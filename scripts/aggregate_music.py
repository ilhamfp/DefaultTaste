#!/usr/bin/env python3
"""DefaultTaste - Music Aggregation Script

Reads parsed music JSONs from data/music/parsed/, selects one output per
refinement chain, computes BPM stats, frequency distributions, brightness /
density scores, and writes data/music/profile.json matching the AgentProfile
TypeScript interface.

Preferred selection is the highest-step liked result in a chain. If a chain
never reaches liked=true, the highest-step successfully parsed result is used.
"""

import json
import math
import re
from collections import Counter, defaultdict
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PARSED_DIR = PROJECT_ROOT / "data" / "music" / "parsed"
RAW_DIR = PROJECT_ROOT / "data" / "music" / "raw"
PROFILE_PATH = PROJECT_ROOT / "data" / "music" / "profile.json"


def load_parsed_files() -> list[dict]:
    """Load all parsed JSON files."""
    files = sorted(PARSED_DIR.glob("*.json"))
    data = []
    for f in files:
        with open(f, "r", encoding="utf-8") as fh:
            item = json.load(fh)
            item.setdefault("file_id", f.stem)
            data.append(item)
    return data


def parse_file_id(file_id: str) -> tuple[str, int] | None:
    """Parse file IDs like c01_s03 into (chain_id, step)."""
    match = re.fullmatch(r"(c\d+)_s(\d+)", file_id)
    if match is None:
        return None
    return match.group(1), int(match.group(2))


def load_raw_metadata(file_id: str) -> dict:
    """Load raw chain metadata for a parsed result when available."""
    raw_path = RAW_DIR / f"{file_id}.json"
    if not raw_path.exists():
        return {}

    try:
        with open(raw_path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, json.JSONDecodeError):
        return {}


def select_chain_results(items: list[dict]) -> list[dict]:
    """Select one parsed result per chain for aggregation."""
    chain_entries: dict[str, list[dict]] = defaultdict(list)

    for item in items:
        file_id = item.get("file_id")
        if not isinstance(file_id, str):
            continue

        parsed = parse_file_id(file_id)
        if parsed is None:
            continue

        chain_id, step = parsed
        raw_data = load_raw_metadata(file_id)
        evaluation = raw_data.get("evaluation") or {}

        chain_entries[chain_id].append(
            {
                "step": step,
                "liked": evaluation.get("liked") is True,
                "item": item,
            }
        )

    selected = []
    for chain_id in sorted(chain_entries, key=lambda value: int(value[1:])):
        entries = sorted(
            chain_entries[chain_id],
            key=lambda entry: entry["step"],
            reverse=True,
        )
        liked_entry = next((entry for entry in entries if entry["liked"]), None)
        chosen = liked_entry or entries[0]
        selected.append(chosen["item"])

    return selected


def count_to_taste_entries(counter: Counter, total: int) -> list[dict]:
    """Convert a Counter to sorted TasteEntry list."""
    entries = []
    for name, count in counter.most_common():
        entries.append({
            "name": name,
            "count": count,
            "percentage": round(count / total * 100),
        })
    return entries


def compute_bpm_stats(items: list[dict]) -> dict:
    """Compute BPM statistics and histogram."""
    bpms = [item["bpm"] for item in items if item.get("bpm") is not None]

    if not bpms:
        return {
            "avg": 0, "median": 0, "min": 0, "max": 0, "std_dev": 0,
            "histogram": [],
        }

    bpms_sorted = sorted(bpms)
    n = len(bpms_sorted)
    avg = sum(bpms) / n
    median = bpms_sorted[n // 2] if n % 2 == 1 else (bpms_sorted[n // 2 - 1] + bpms_sorted[n // 2]) / 2
    bpm_min = min(bpms)
    bpm_max = max(bpms)
    variance = sum((b - avg) ** 2 for b in bpms) / n
    std_dev = math.sqrt(variance)

    # Build histogram with 10-BPM bins
    bin_start = int(bpm_min // 10) * 10
    bin_end = int(bpm_max // 10) * 10 + 10
    histogram = []
    for low in range(bin_start, bin_end + 1, 10):
        high = low + 10
        count = sum(1 for b in bpms if low <= b < high)
        if count > 0:
            histogram.append({"range": f"{low}-{high}", "count": count})

    return {
        "avg": round(avg, 1),
        "median": round(median, 1),
        "min": round(bpm_min, 1),
        "max": round(bpm_max, 1),
        "std_dev": round(std_dev, 1),
        "histogram": histogram,
    }


def compute_brightness(items: list[dict]) -> dict:
    """Compute brightness score from spectral centroid averages.

    Mapping: typical spectral centroid range 500-6000 Hz → 1-10 scale.
    """
    centroids = [item["spectral_centroid_hz"] for item in items if item.get("spectral_centroid_hz") is not None]

    if not centroids:
        return {"avg": 5.0, "label": "Warm"}

    avg_centroid = sum(centroids) / len(centroids)

    # Map 500-6000 Hz to 1-10 scale (clamped)
    score = max(1, min(10, 1 + (avg_centroid - 500) / (6000 - 500) * 9))
    score = round(score, 1)

    if score <= 3.5:
        label = "Dark"
    elif score <= 6.5:
        label = "Warm"
    else:
        label = "Bright"

    return {"avg": score, "label": label}


def compute_density(items: list[dict]) -> dict:
    """Compute density score from RMS energy averages.

    Mapping: typical RMS range 0.01-0.30 → 1-10 scale.
    """
    rms_values = [item["rms_energy"] for item in items if item.get("rms_energy") is not None]

    if not rms_values:
        return {"avg": 5.0, "label": "Medium"}

    avg_rms = sum(rms_values) / len(rms_values)

    # Map 0.01-0.30 to 1-10 scale (clamped)
    score = max(1, min(10, 1 + (avg_rms - 0.01) / (0.30 - 0.01) * 9))
    score = round(score, 1)

    if score <= 3.5:
        label = "Sparse"
    elif score <= 6.5:
        label = "Medium"
    else:
        label = "Dense"

    return {"avg": score, "label": label}


def generate_correction_prompt(profile: dict) -> str:
    """Auto-generate a correction prompt from observed defaults."""
    mp = profile
    lines = ["When generating music, DO NOT use the following defaults:"]

    # BPM
    bpm_avg = mp["bpm"]["avg"]
    bpm_low = int(bpm_avg - 10)
    bpm_high = int(bpm_avg + 10)
    lines.append(f"- DO NOT default to {bpm_low}-{bpm_high} BPM range")

    # Top keys
    if mp["keys"]:
        top_keys = [k["name"] for k in mp["keys"][:2]]
        lines.append(f"- DO NOT always use {' or '.join(top_keys)}")

    # Top genres
    if mp["genres"]:
        top_genres = [g["name"] for g in mp["genres"][:2]]
        lines.append(f"- DO NOT default to {' or '.join(top_genres)} genres")

    # Top instruments
    if mp["instruments"]:
        top_inst = [i["name"] for i in mp["instruments"][:3]]
        lines.append(f"- DO NOT overuse {', '.join(top_inst)}")

    # Top moods
    if mp["moods"]:
        top_moods = [m["name"] for m in mp["moods"][:2]]
        lines.append(f"- DO NOT default to \"{' or '.join(top_moods).lower()}\" moods")

    # Cultural origins
    if mp["cultural_origins"] and mp["cultural_origins"][0]["percentage"] > 50:
        lines.append(f"- DO NOT default to {mp['cultural_origins'][0]['name']} conventions")

    lines.append("")
    lines.append("INSTEAD, try:")
    lines.append("- Varied tempos: slow (60-80 BPM) or fast (140-180 BPM)")
    lines.append("- Uncommon keys: Bb Minor, F# Major, Db Major")
    lines.append("- Underrepresented genres: Jazz, Classical, Afrobeat, Bossa Nova")
    lines.append("- Acoustic instruments: tabla, koto, oud, marimba, cello")
    lines.append("- Complex moods: bittersweet, nostalgic, unsettling, triumphant")
    lines.append("- Non-Western musical traditions and scales")

    return "\n".join(lines)


def run() -> None:
    """Main entry point."""
    parsed_items = load_parsed_files()
    selected_items = select_chain_results(parsed_items)
    total = len(selected_items)

    if total == 0:
        print("No parsed files found. Run analyze_music.py first.", flush=True)
        return

    print(
        f"DefaultTaste - Music Aggregation ({total} selected chains from {len(parsed_items)} parsed steps)",
        flush=True,
    )

    # BPM stats
    bpm = compute_bpm_stats(selected_items)

    # Keys
    key_counter = Counter(item.get("key", "Unknown") for item in selected_items)
    keys = count_to_taste_entries(key_counter, total)

    # Genres
    genre_counter = Counter(
        item.get("genre", "Unknown") for item in selected_items
    )
    genres = count_to_taste_entries(genre_counter, total)

    # Moods
    mood_counter = Counter(item.get("mood", "Unknown") for item in selected_items)
    moods = count_to_taste_entries(mood_counter, total)

    # Instruments — flatten and count per-file presence
    inst_counter = Counter()
    for item in selected_items:
        seen = set()
        for inst in item.get("instruments", []):
            if inst not in seen:
                seen.add(inst)
                inst_counter[inst] += 1
    instruments = count_to_taste_entries(inst_counter, total)

    # Cultural origins
    origin_counter = Counter(
        item.get("cultural_origin", "Unknown") for item in selected_items
    )
    cultural_origins = count_to_taste_entries(origin_counter, total)

    # Brightness and density
    brightness = compute_brightness(selected_items)
    density = compute_density(selected_items)

    music_profile = {
        "bpm": bpm,
        "keys": keys,
        "genres": genres,
        "moods": moods,
        "instruments": instruments,
        "cultural_origins": cultural_origins,
        "brightness": brightness,
        "density": density,
    }

    correction_prompt = generate_correction_prompt(music_profile)

    profile = {
        "id": "lyria",
        "name": "Lyria RealTime",
        "model": "models/lyria-realtime-exp",
        "probe_type": "music",
        "probe_count": total,
        "date": "2026-03-07",
        "music_profile": music_profile,
        "correction_prompt": correction_prompt,
    }

    # Write atomically
    tmp = PROFILE_PATH.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2, ensure_ascii=False)
    tmp.rename(PROFILE_PATH)

    print(f"Written: {PROFILE_PATH}", flush=True)
    print(f"  BPM avg: {bpm['avg']} | median: {bpm['median']} | range: {bpm['min']}-{bpm['max']}", flush=True)
    print(f"  Top key: {keys[0]['name'] if keys else 'none'} ({keys[0]['percentage'] if keys else 0}%)", flush=True)
    print(f"  Top genre: {genres[0]['name'] if genres else 'none'} ({genres[0]['percentage'] if genres else 0}%)", flush=True)
    print(f"  Brightness: {brightness['avg']} ({brightness['label']})", flush=True)
    print(f"  Density: {density['avg']} ({density['label']})", flush=True)


if __name__ == "__main__":
    run()

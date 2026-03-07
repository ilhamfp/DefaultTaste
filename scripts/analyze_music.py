#!/usr/bin/env python3
"""DefaultTaste - Music Analysis Script

Reads raw music metadata from data/music/raw/ (which already has librosa features),
uploads each WAV to Gemini for semantic analysis (genre, mood, instruments, etc.),
and writes combined parsed results to data/music/parsed/.
"""

import asyncio
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# ─── Configuration ───────────────────────────────────────────────

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_RETRIES = 3
CALL_DELAY = 3.0

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "music" / "raw"
AUDIO_DIR = PROJECT_ROOT / "data" / "music" / "audio"
PARSED_DIR = PROJECT_ROOT / "data" / "music" / "parsed"

ANALYSIS_PROMPT = """Listen to this song and analyze it. Here are the measured audio features:

BPM: {bpm}
Key: {key}
Spectral Centroid (brightness): {spectral_centroid_hz} Hz
RMS Energy: {rms_energy}
Spectral Rolloff: {spectral_rolloff_hz} Hz

Respond with ONLY valid JSON (no markdown fences, no explanation) with these exact fields:
- "genre": string — primary genre (e.g., "R&B", "Pop", "Electronic", "Hip-Hop", "Jazz", "Ambient")
- "sub_genre": string — more specific sub-genre (e.g., "Chill R&B", "Synth Pop", "Lo-Fi Hip-Hop")
- "mood": string — primary mood (e.g., "Chill", "Energetic", "Melancholic", "Uplifting", "Dark")
- "instruments": list of strings — instruments/sounds heard (e.g., ["synth pads", "trap drums", "vocal chops", "bass"])
- "tempo_feel": string — how the tempo feels: "slow", "moderate", "fast", "variable"
- "production_style": string — production quality/style (e.g., "Modern/Polished", "Lo-Fi", "Minimalist", "Orchestral")
- "cultural_origin": string — musical tradition it draws from (e.g., "Western Pop", "Afrobeat", "Latin", "East Asian")
- "energy_level": string — overall energy: "low", "medium", "high"
- "complexity": string — musical complexity: "simple", "moderate", "complex"
"""


# ─── Functions ───────────────────────────────────────────────────


def setup() -> genai.Client:
    """Validate config and return a Gemini client."""
    if not API_KEY:
        print("ERROR: GEMINI_API_KEY is not set.", flush=True)
        print("Set it in .env or export GEMINI_API_KEY=your_key", flush=True)
        sys.exit(1)

    PARSED_DIR.mkdir(parents=True, exist_ok=True)

    client = genai.Client(
        api_key=API_KEY,
        http_options=types.HttpOptions(api_version="v1alpha"),
    )
    return client


def extract_json(text: str) -> dict:
    """Strip markdown fences and parse JSON."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    result = json.loads(text)
    if not isinstance(result, dict):
        raise ValueError("Expected a JSON object")
    return result


def get_pending_files() -> list[tuple[Path, Path]]:
    """Return (raw_json, wav_file) pairs that haven't been parsed yet."""
    pending = []
    for raw_file in sorted(RAW_DIR.glob("c*_s*.json")):
        parsed_file = PARSED_DIR / raw_file.name
        if parsed_file.exists():
            continue

        wav_file = AUDIO_DIR / f"{raw_file.stem}.wav"
        if not wav_file.exists():
            print(f"  Warning: {wav_file.name} not found, skipping {raw_file.name}", flush=True)
            continue

        pending.append((raw_file, wav_file))
    return pending


async def analyze_one(client: genai.Client, raw_file: Path, wav_file: Path) -> dict | None:
    """Upload WAV to Gemini for semantic analysis. Returns parsed dict or None."""
    with open(raw_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    audio_features = raw_data.get("audio_features") or {}
    if "error" in audio_features:
        print(f"  {raw_file.stem}: Audio features had error, skipping.", flush=True)
        return None

    prompt = ANALYSIS_PROMPT.format(
        bpm=audio_features.get("bpm", "unknown"),
        key=audio_features.get("key", "unknown"),
        spectral_centroid_hz=audio_features.get("spectral_centroid_hz", "unknown"),
        rms_energy=audio_features.get("rms_energy", "unknown"),
        spectral_rolloff_hz=audio_features.get("spectral_rolloff_hz", "unknown"),
    )

    for attempt in range(MAX_RETRIES):
        try:
            file_ref = client.files.upload(file=str(wav_file))

            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=[prompt, file_ref],
            )

            parsed = extract_json(response.text)

            result = {
                "file_id": raw_file.stem,
                "audio_file": str(wav_file.relative_to(PROJECT_ROOT)),
                "bpm": audio_features.get("bpm"),
                "key": audio_features.get("key"),
                "spectral_centroid_hz": audio_features.get("spectral_centroid_hz"),
                "rms_energy": audio_features.get("rms_energy"),
                "spectral_rolloff_hz": audio_features.get("spectral_rolloff_hz"),
                "genre": parsed.get("genre", "Unknown"),
                "sub_genre": parsed.get("sub_genre", "Unknown"),
                "mood": parsed.get("mood", "Unknown"),
                "instruments": parsed.get("instruments", []),
                "tempo_feel": parsed.get("tempo_feel", "moderate"),
                "production_style": parsed.get("production_style", "Unknown"),
                "cultural_origin": parsed.get("cultural_origin", "Unknown"),
                "energy_level": parsed.get("energy_level", "medium"),
                "complexity": parsed.get("complexity", "moderate"),
            }
            return result

        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f"  {raw_file.stem}: Retry {attempt + 1}/{MAX_RETRIES} ({e}), waiting {wait}s...", flush=True)
                await asyncio.sleep(wait)
            else:
                print(f"  {raw_file.stem}: FAILED after {MAX_RETRIES} attempts ({e})", flush=True)
                return None


def save_parsed(filename: str, result: dict) -> None:
    """Atomically write parsed JSON."""
    tmp = PARSED_DIR / f"{filename}.tmp"
    final = PARSED_DIR / f"{filename}.json"

    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    tmp.rename(final)


async def run() -> None:
    """Main entry point."""
    client = setup()
    pending = get_pending_files()

    print("DefaultTaste - Music Analysis", flush=True)
    print(f"Model: {MODEL}", flush=True)
    print(f"Total raw: {len(list(RAW_DIR.glob('c*_s*.json')))} | Pending: {len(pending)}", flush=True)
    print("-" * 60, flush=True)

    if not pending:
        print("Nothing to do — all files already parsed.", flush=True)
        return

    success = 0
    failed = 0

    for i, (raw_file, wav_file) in enumerate(pending):
        print(f"  [{i + 1}/{len(pending)}] Analyzing {raw_file.stem}...", flush=True)

        result = await analyze_one(client, raw_file, wav_file)

        if result is not None:
            save_parsed(raw_file.stem, result)
            success += 1
            print(f"  [{i + 1}/{len(pending)}] {raw_file.stem}: OK — {result['genre']}, {result['mood']}", flush=True)
        else:
            failed += 1

        if i < len(pending) - 1:
            await asyncio.sleep(CALL_DELAY)

    print("-" * 60, flush=True)
    print(f"Done. Success: {success} | Failed: {failed}", flush=True)


if __name__ == "__main__":
    asyncio.run(run())

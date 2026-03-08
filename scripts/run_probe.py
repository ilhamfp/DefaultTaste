#!/usr/bin/env python3
"""DefaultTaste persisted demo probe worker.

Reads a probe run from data/runs/<run_id>/run.json, simulates a full probe
pipeline with persisted progress, writes medium-specific artifacts, and saves
the final profile to data/runs/<run_id>/profile.json.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import shutil
import time
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


PROJECT_ROOT = Path(__file__).resolve().parent.parent
RUNS_ROOT = PROJECT_ROOT / "data" / "runs"

DEPTH_RUN_COUNTS = {
    "website": {"quick": 12, "standard": 30, "deep": 60},
    "music": {"quick": 4, "standard": 8, "deep": 12},
}

WEBSITE_PROMPT_PACK = [
    "Make me a website for a new product.",
    "Design a homepage for a startup.",
    "Create a polished single-page site.",
    "Build a portfolio landing page.",
    "Make a documentation homepage.",
    "Design an editorial front page.",
    "Create a SaaS marketing site.",
    "Build a pricing page and hero section.",
    "Make a studio website.",
    "Create a product announcement page.",
    "Design a launch microsite.",
    "Build a simple but polished website.",
]

MUSIC_PROMPT_PACK = [
    "Make me a song.",
    "Create a short musical idea.",
    "Generate a complete song sketch.",
    "Compose a polished track.",
    "Make a catchy instrumental.",
    "Create a memorable melody-led piece.",
    "Generate a concise song concept.",
    "Compose a modern music loop.",
    "Make a short original track.",
    "Create a full musical cue.",
    "Generate a producer-style demo.",
    "Compose a finished song fragment.",
]

WEBSITE_MODEL_LABEL = "Gemini-style demo profile"
MUSIC_MODEL_LABEL = "Lyria-style demo profile"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", required=True)
    return parser.parse_args()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_json(path: Path) -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json_atomic(path: Path, value: dict[str, Any]) -> None:
    temp_path = path.with_suffix(path.suffix + ".tmp")
    with open(temp_path, "w", encoding="utf-8") as handle:
        json.dump(value, handle, indent=2, ensure_ascii=False)
    temp_path.replace(path)


def load_run(run_id: str) -> tuple[Path, dict[str, Any]]:
    run_dir = RUNS_ROOT / run_id
    run_path = run_dir / "run.json"
    return run_dir, read_json(run_path)


def update_run(
    run_dir: Path,
    *,
    status: str | None = None,
    message: str | None = None,
    current: int | None = None,
    total: int | None = None,
    error: str | None = None,
    result_profile_path: str | None = None,
    started: bool = False,
    completed: bool = False,
    clear_pid: bool = False,
) -> dict[str, Any]:
    run_path = run_dir / "run.json"
    run = read_json(run_path)

    if status is not None:
      run["status"] = status

    if started and not run.get("startedAt"):
        run["startedAt"] = utc_now()

    if completed:
        run["completedAt"] = utc_now()

    progress = run.get("progress", {})
    if total is not None:
        progress["total"] = total
    if current is not None:
        progress["current"] = current
    if message is not None:
        progress["message"] = message

    progress_total = progress.get("total", 0) or 0
    progress_current = progress.get("current", 0) or 0
    progress["percent"] = (
        round(progress_current / progress_total * 100)
        if progress_total > 0
        else 0
    )
    run["progress"] = progress

    if error is not None:
        run["error"] = error

    if result_profile_path is not None:
        run["resultProfilePath"] = result_profile_path

    if clear_pid:
        run["workerPid"] = None

    run["updatedAt"] = utc_now()
    write_json_atomic(run_path, run)
    return run


def load_base_profile(media: str) -> dict[str, Any]:
    candidate_paths: list[Path] = []

    if media == "websites":
        candidate_paths.append(
            PROJECT_ROOT / "data" / "websites" / "gemini-flash" / "profile.json",
        )

    candidate_paths.append(PROJECT_ROOT / "data" / media / "profile.json")

    for profile_path in candidate_paths:
        if profile_path.exists():
            return read_json(profile_path)

    if media == "websites":
        return {
            "id": "fixture-website",
            "name": "Website Probe",
            "model": WEBSITE_MODEL_LABEL,
            "probe_type": "website",
            "probe_count": 12,
            "date": date.today().isoformat(),
            "website_profile": {
                "frameworks": [{"name": "React", "count": 8, "percentage": 67}],
                "css_frameworks": [{"name": "Tailwind CSS", "count": 8, "percentage": 67}],
                "colors": [{"hex": "#00786f", "name": "Teal", "count": 6, "percentage": 50}],
                "fonts": [{"name": "Geist", "count": 8, "percentage": 67}],
                "layouts": [{"name": "Landing Page", "count": 7, "percentage": 58}],
                "libraries": [{"name": "Framer Motion", "count": 5, "percentage": 42}],
                "dark_mode_percentage": 40,
            },
            "correction_prompt": "Avoid the strongest repeated website defaults and push toward a different visual system.",
        }

    return {
        "id": "fixture-music",
        "name": "Music Probe",
        "model": MUSIC_MODEL_LABEL,
        "probe_type": "music",
        "probe_count": 4,
        "date": date.today().isoformat(),
        "music_profile": {
            "bpm": {
                "avg": 112.0,
                "median": 112,
                "min": 95,
                "max": 126,
                "std_dev": 8.5,
                "histogram": [{"range": "110-120", "count": 2}],
            },
            "keys": [{"name": "C Major", "count": 2, "percentage": 50}],
            "genres": [{"name": "Pop", "count": 2, "percentage": 50}],
            "moods": [{"name": "Uplifting", "count": 2, "percentage": 50}],
            "instruments": [{"name": "Synth Pads", "count": 2, "percentage": 50}],
            "cultural_origins": [{"name": "Western Pop", "count": 2, "percentage": 50}],
            "brightness": {"avg": 6.0, "label": "Warm"},
            "density": {"avg": 5.0, "label": "Medium"},
        },
        "correction_prompt": "Avoid the strongest repeated music defaults and push toward a different musical identity.",
    }


def rotate_list(items: list[dict[str, Any]], offset: int) -> list[dict[str, Any]]:
    if not items:
        return []

    pivot = offset % len(items)
    return copy.deepcopy(items[pivot:] + items[:pivot])


def vary_entry_percentages(entries: list[dict[str, Any]], seed: int) -> list[dict[str, Any]]:
    varied = []
    for index, entry in enumerate(entries):
        item = copy.deepcopy(entry)
        if "percentage" in item:
            delta = ((seed + index * 3) % 9) - 4
            item["percentage"] = max(1, min(99, int(item["percentage"]) + delta))
        if "count" in item:
            delta = ((seed + index * 5) % 5) - 2
            item["count"] = max(1, int(item["count"]) + delta)
        varied.append(item)
    return varied


def slug_to_title(value: str) -> str:
    parts = [part for part in re.split(r"[-._]", value) if part]
    if not parts:
        return value or "Custom Probe"
    return " ".join(part.capitalize() for part in parts[:4])


def display_name(run: dict[str, Any]) -> str:
    settings = run["settings"]
    if settings.get("label"):
        return settings["label"]

    host = urlparse(settings["endpointUrl"]).netloc
    if host:
        return slug_to_title(host.split(":")[0])

    return "Custom Probe"


def build_profile(run: dict[str, Any], run_id: str) -> dict[str, Any]:
    settings = run["settings"]
    seed = int(hashlib.sha256(settings["endpointUrl"].encode("utf-8")).hexdigest()[:8], 16)
    total = DEPTH_RUN_COUNTS[settings["media"]][settings["depth"]]

    if settings["media"] == "website":
        base = load_base_profile("websites")
        profile = copy.deepcopy(base)
        wp = profile["website_profile"]
        profile["id"] = run_id
        profile["name"] = display_name(run)
        profile["model"] = WEBSITE_MODEL_LABEL
        profile["probe_count"] = total
        profile["date"] = date.today().isoformat()
        wp["frameworks"] = vary_entry_percentages(
            rotate_list(wp.get("frameworks", []), seed),
            seed,
        )
        wp["css_frameworks"] = vary_entry_percentages(
            rotate_list(wp.get("css_frameworks", []), seed // 2),
            seed // 2,
        )
        wp["colors"] = vary_entry_percentages(
            rotate_list(wp.get("colors", []), seed // 3),
            seed // 3,
        )
        wp["fonts"] = vary_entry_percentages(
            rotate_list(wp.get("fonts", []), seed // 5),
            seed // 5,
        )
        wp["layouts"] = vary_entry_percentages(
            rotate_list(wp.get("layouts", []), seed // 7),
            seed // 7,
        )
        wp["libraries"] = vary_entry_percentages(
            rotate_list(wp.get("libraries", []), seed // 11),
            seed // 11,
        )
        wp["dark_mode_percentage"] = max(
            5,
            min(95, int(wp.get("dark_mode_percentage", 50)) + (seed % 11) - 5),
        )
        return profile

    base = load_base_profile("music")
    profile = copy.deepcopy(base)
    mp = profile["music_profile"]
    profile["id"] = run_id
    profile["name"] = display_name(run)
    profile["model"] = MUSIC_MODEL_LABEL
    profile["probe_count"] = total
    profile["date"] = date.today().isoformat()
    mp["keys"] = vary_entry_percentages(rotate_list(mp.get("keys", []), seed), seed)
    mp["genres"] = vary_entry_percentages(
        rotate_list(mp.get("genres", []), seed // 2),
        seed // 2,
    )
    mp["moods"] = vary_entry_percentages(
        rotate_list(mp.get("moods", []), seed // 3),
        seed // 3,
    )
    mp["instruments"] = vary_entry_percentages(
        rotate_list(mp.get("instruments", []), seed // 5),
        seed // 5,
    )
    mp["cultural_origins"] = vary_entry_percentages(
        rotate_list(mp.get("cultural_origins", []), seed // 7),
        seed // 7,
    )
    bpm = mp["bpm"]
    bpm_delta = (seed % 9) - 4
    bpm["avg"] = round(float(bpm.get("avg", 110)) + bpm_delta, 1)
    bpm["median"] = round(float(bpm.get("median", 110)) + bpm_delta)
    bpm["min"] = round(float(bpm.get("min", 90)) + bpm_delta)
    bpm["max"] = round(float(bpm.get("max", 130)) + bpm_delta)
    brightness = mp["brightness"]
    brightness["avg"] = max(1, min(10, round(float(brightness.get("avg", 5)) + ((seed % 5) - 2) * 0.4, 1)))
    density = mp["density"]
    density["avg"] = max(1, min(10, round(float(density.get("avg", 5)) + ((seed % 7) - 3) * 0.3, 1)))
    return profile


def list_sample_files(directory: Path, pattern: str) -> list[Path]:
    return sorted(path for path in directory.glob(pattern) if path.is_file())


def copy_sample_json(
    sample_files: list[Path],
    output_path: Path,
    *,
    run: dict[str, Any],
    prompt: str,
    index: int,
) -> None:
    payload: dict[str, Any]

    if sample_files:
        payload = read_json(sample_files[(index - 1) % len(sample_files)])
    else:
        payload = {}

    payload["id"] = index
    payload["probe_run_id"] = run["id"]
    payload["endpoint_url"] = run["settings"]["endpointUrl"]
    payload["prompt"] = prompt
    payload["timestamp"] = utc_now()
    write_json_atomic(output_path, payload)


def copy_sample_audio(sample_files: list[Path], output_path: Path, index: int) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if sample_files:
        shutil.copy2(sample_files[(index - 1) % len(sample_files)], output_path)
        return
    output_path.write_bytes(b"")


def seed_artifacts(run_dir: Path, run: dict[str, Any], total: int) -> None:
    media = run["settings"]["media"]
    prompt_pack = WEBSITE_PROMPT_PACK if media == "website" else MUSIC_PROMPT_PACK

    if media == "website":
        raw_samples = list_sample_files(PROJECT_ROOT / "data" / "websites" / "raw", "*.json")
        parsed_samples = list_sample_files(PROJECT_ROOT / "data" / "websites" / "parsed", "*.json")
        raw_dir = run_dir / "raw"
        parsed_dir = run_dir / "parsed"
        raw_dir.mkdir(parents=True, exist_ok=True)
        parsed_dir.mkdir(parents=True, exist_ok=True)

        for index in range(1, total + 1):
            prompt = prompt_pack[(index - 1) % len(prompt_pack)]
            copy_sample_json(
                raw_samples,
                raw_dir / f"{index:03d}.json",
                run=run,
                prompt=prompt,
                index=index,
            )
            copy_sample_json(
                parsed_samples,
                parsed_dir / f"{index:03d}.json",
                run=run,
                prompt=prompt,
                index=index,
            )
    else:
        raw_samples = list_sample_files(PROJECT_ROOT / "data" / "music" / "raw", "*.json")
        parsed_samples = list_sample_files(PROJECT_ROOT / "data" / "music" / "parsed", "*.json")
        audio_samples = list_sample_files(PROJECT_ROOT / "data" / "music" / "audio", "*.wav")
        raw_dir = run_dir / "raw"
        parsed_dir = run_dir / "parsed"
        audio_dir = run_dir / "audio"
        raw_dir.mkdir(parents=True, exist_ok=True)
        parsed_dir.mkdir(parents=True, exist_ok=True)
        audio_dir.mkdir(parents=True, exist_ok=True)

        for index in range(1, total + 1):
            prompt = prompt_pack[(index - 1) % len(prompt_pack)]
            copy_sample_json(
                raw_samples,
                raw_dir / f"{index:03d}.json",
                run=run,
                prompt=prompt,
                index=index,
            )
            copy_sample_json(
                parsed_samples,
                parsed_dir / f"{index:03d}.json",
                run=run,
                prompt=prompt,
                index=index,
            )
            copy_sample_audio(audio_samples, audio_dir / f"{index:03d}.wav", index)


def simulate_progress(
    run_dir: Path,
    status: str,
    total: int,
    base_message: str,
    delay: float,
) -> None:
    for current in range(1, total + 1):
        update_run(
            run_dir,
            status=status,
            message=f"{base_message} {current} of {total}.",
            current=current,
            total=total,
        )
        time.sleep(delay)


def main() -> None:
    args = parse_args()
    run_dir, run = load_run(args.run_id)
    total = DEPTH_RUN_COUNTS[run["settings"]["media"]][run["settings"]["depth"]]

    try:
        update_run(
            run_dir,
            status="validating",
            message="Checking the submitted URL and preparing the demo walkthrough.",
            total=total,
            current=0,
            started=True,
        )
        time.sleep(0.5)

        update_run(
            run_dir,
            status="probing",
            message="Staging a simulated probe pass from pre-generated artifacts.",
            total=total,
            current=0,
        )
        seed_artifacts(run_dir, run, total)
        simulate_progress(
            run_dir,
            "probing",
            total,
            "Prepared demo sample",
            0.05 if total <= 12 else 0.03,
        )

        update_run(
            run_dir,
            status="analyzing",
            message="Inspecting the demo artifacts for recurring defaults.",
            total=total,
            current=0,
        )
        simulate_progress(
            run_dir,
            "analyzing",
            total,
            "Reviewed demo sample",
            0.03,
        )

        update_run(
            run_dir,
            status="aggregating",
            message="Assembling a simulated taste profile from the demo artifacts.",
            total=1,
            current=0,
        )
        time.sleep(0.4)
        profile = build_profile(run, args.run_id)
        profile_path = run_dir / "profile.json"
        write_json_atomic(profile_path, profile)
        update_run(
            run_dir,
            status="aggregating",
            message="Assembled the simulated taste profile.",
            total=1,
            current=1,
        )
        time.sleep(0.4)

        update_run(
            run_dir,
            status="generating_correction_prompt",
            message="Writing a demo correction prompt from the repeated defaults.",
            total=1,
            current=0,
        )
        time.sleep(0.5)

        update_run(
            run_dir,
            status="completed",
            message="Demo walkthrough complete. Your simulated taste profile is ready.",
            total=total,
            current=total,
            result_profile_path=str(profile_path.relative_to(PROJECT_ROOT)),
            completed=True,
            clear_pid=True,
        )
    except Exception as error:  # pragma: no cover - runtime failure path
        update_run(
            run_dir,
            status="failed",
            message="The demo walkthrough failed before completion.",
            error=str(error),
            clear_pid=True,
        )
        raise


if __name__ == "__main__":
    main()

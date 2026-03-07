#!/usr/bin/env python3
"""DefaultTaste - Exploration Prompt Generator

Reads profile.json for both agents, sends each to Gemini to generate
an exploration-oriented system prompt (not negation), then updates the
correction_prompt field in each profile.json.
"""

import asyncio
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# --- Configuration -----------------------------------------------------------

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_RETRIES = 3

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROFILES = [
    {
        "profile_path": PROJECT_ROOT / "data" / "websites" / "profile.json",
        "profile_key": "website_profile",
        "output_path": PROJECT_ROOT / "data" / "negation" / "website_exploration.txt",
        "label": "website",
    },
    {
        "profile_path": PROJECT_ROOT / "data" / "music" / "profile.json",
        "profile_key": "music_profile",
        "output_path": PROJECT_ROOT / "data" / "negation" / "music_exploration.txt",
        "label": "music",
    },
]

EXPLORATION_PROMPT = """Here is the default taste profile of an AI agent, showing what it produces
when given minimal instructions:

{profile_summary}

Write a system prompt that encourages this AI to explore beyond these defaults.
The tone should NOT be restrictive ("don't use X") — instead, it should be
curiosity-driven and exploratory ("consider trying X, explore Y, experiment with Z").

The goal is to nudge the AI toward aesthetic diversity — wider range of colors,
fonts, styles, moods, structures — without forbidding its existing defaults.

Rules for the prompt you write:
- Be specific: reference actual alternatives (name fonts, colors, genres, keys, etc.)
- Keep it concise: 6-10 lines max
- Frame as encouragement, not restriction
- Ground suggestions in the data (e.g. if it always picks dark mode, suggest exploring light themes)
- Output ONLY the prompt text, no explanation or preamble"""


# --- Functions ---------------------------------------------------------------


def setup() -> genai.Client:
    """Validate config and return a Gemini client."""
    if not API_KEY:
        print("ERROR: GEMINI_API_KEY is not set.", flush=True)
        print("Set it in .env or export GEMINI_API_KEY=your_key", flush=True)
        sys.exit(1)

    client = genai.Client(
        api_key=API_KEY,
        http_options=types.HttpOptions(api_version="v1alpha"),
    )
    return client


def format_profile_summary(profile_data: dict, profile_key: str) -> str:
    """Format profile data into a readable summary string."""
    data = profile_data[profile_key]
    lines = []

    if profile_key == "website_profile":
        frameworks = ", ".join(f"{f['name']} ({f['percentage']}%)" for f in data.get("frameworks", []))
        css = ", ".join(f"{f['name']} ({f['percentage']}%)" for f in data.get("css_frameworks", []))
        colors = ", ".join(f"{c['name']} {c['hex']} ({c['percentage']}%)" for c in data.get("colors", [])[:6])
        fonts = ", ".join(f"{f['name']} ({f['percentage']}%)" for f in data.get("fonts", []))
        layouts = ", ".join(f"{l['name']} ({l['percentage']}%)" for l in data.get("layouts", []))
        libs = ", ".join(f"{l['name']}" for l in data.get("libraries", [])) or "None"
        dark_pct = data.get("dark_mode_percentage", 0)

        lines.append(f"Frameworks: {frameworks}")
        lines.append(f"CSS: {css}")
        lines.append(f"Colors: {colors}")
        lines.append(f"Fonts: {fonts}")
        lines.append(f"Layouts: {layouts}")
        lines.append(f"Libraries: {libs}")
        lines.append(f"Dark mode: {dark_pct}%")

    elif profile_key == "music_profile":
        bpm = data.get("bpm", {})
        keys = ", ".join(f"{k['name']} ({k['percentage']}%)" for k in data.get("keys", []))
        genres = ", ".join(f"{g['name']} ({g['percentage']}%)" for g in data.get("genres", []))
        moods = ", ".join(f"{m['name']} ({m['percentage']}%)" for m in data.get("moods", []))
        instruments = ", ".join(f"{i['name']} ({i['percentage']}%)" for i in data.get("instruments", [])[:6])
        origins = ", ".join(f"{o['name']} ({o['percentage']}%)" for o in data.get("cultural_origins", []))
        brightness = data.get("brightness", {})
        density = data.get("density", {})

        lines.append(f"BPM: avg {bpm.get('avg', '?')}, range {bpm.get('min', '?')}-{bpm.get('max', '?')}")
        lines.append(f"Keys: {keys}")
        lines.append(f"Genres: {genres}")
        lines.append(f"Moods: {moods}")
        lines.append(f"Instruments: {instruments}")
        lines.append(f"Cultural origins: {origins}")
        lines.append(f"Brightness: {brightness.get('avg', '?')}/5 ({brightness.get('label', '?')})")
        lines.append(f"Density: {density.get('avg', '?')}/5 ({density.get('label', '?')})")

    return "\n".join(lines)


async def generate_exploration_prompt(client: genai.Client, profile_summary: str) -> str:
    """Send profile summary to Gemini and get an exploration prompt back."""
    prompt = EXPLORATION_PROMPT.format(profile_summary=profile_summary)

    for attempt in range(MAX_RETRIES):
        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=prompt,
            )
            return response.text.strip()
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f"  Retry {attempt + 1}/{MAX_RETRIES} ({e}), waiting {wait}s...", flush=True)
                await asyncio.sleep(wait)
            else:
                print(f"  FAILED after {MAX_RETRIES} attempts ({e})", flush=True)
                raise


def atomic_write_json(path: Path, data: dict) -> None:
    """Write JSON atomically via tmp + rename."""
    tmp = path.with_suffix(".json.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    tmp.rename(path)


def write_text(path: Path, text: str) -> None:
    """Write text file atomically via tmp + rename."""
    tmp = path.with_suffix(".txt.tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(text + "\n")
    tmp.rename(path)


async def main() -> None:
    client = setup()

    print("DefaultTaste - Exploration Prompt Generator", flush=True)
    print(f"Model: {MODEL}", flush=True)
    print("-" * 60, flush=True)

    for cfg in PROFILES:
        profile_path = cfg["profile_path"]
        label = cfg["label"]

        if not profile_path.exists():
            print(f"  [{label}] Profile not found at {profile_path}, skipping.", flush=True)
            continue

        with open(profile_path, "r", encoding="utf-8") as f:
            profile_data = json.load(f)

        print(f"  [{label}] Generating exploration prompt...", flush=True)
        summary = format_profile_summary(profile_data, cfg["profile_key"])
        exploration_prompt = await generate_exploration_prompt(client, summary)

        # Update profile.json
        profile_data["correction_prompt"] = exploration_prompt
        atomic_write_json(profile_path, profile_data)
        print(f"  [{label}] Updated {profile_path.name}", flush=True)

        # Save standalone copy
        cfg["output_path"].parent.mkdir(parents=True, exist_ok=True)
        write_text(cfg["output_path"], exploration_prompt)
        print(f"  [{label}] Saved {cfg['output_path'].name}", flush=True)

        print(f"\n--- {label} exploration prompt ---", flush=True)
        print(exploration_prompt, flush=True)
        print("---\n", flush=True)

    print("-" * 60, flush=True)
    print("Done.", flush=True)


if __name__ == "__main__":
    asyncio.run(main())

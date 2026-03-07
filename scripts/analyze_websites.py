#!/usr/bin/env python3
"""DefaultTaste - Website Analysis Script

Reads raw website HTML from data/websites/raw/, sends each to Gemini
for structured analysis, and writes parsed results to data/websites/parsed/.
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
RAW_DIR = PROJECT_ROOT / "data" / "websites" / "raw"
PARSED_DIR = PROJECT_ROOT / "data" / "websites" / "parsed"

ANALYSIS_PROMPT = """Analyze this HTML website code and extract the following structured information.

HTML code:
```html
{html_code}
```

Respond with ONLY valid JSON (no markdown fences, no explanation) with these exact fields:
- "framework": string — the JS framework used, or "Vanilla HTML" if none (e.g., "React", "Vue", "Svelte", "Vanilla HTML")
- "css_framework": string — the CSS framework used, or "Vanilla CSS" if none (e.g., "Tailwind CSS", "Bootstrap", "Material UI", "Vanilla CSS")
- "primary_colors": list of hex strings — the 2-4 most prominent colors used (e.g., ["#667eea", "#764ba2", "#1a1a2e"])
- "color_names": list of strings — readable names for each color (e.g., ["Indigo/Purple", "Purple", "Dark Navy"])
- "fonts": list of strings — font families used (e.g., ["Inter", "sans-serif"])
- "layout_type": string — the type of page (e.g., "Landing Page", "Dashboard", "Portfolio", "Blog", "E-commerce")
- "libraries": list of strings — any JS libraries referenced (e.g., ["Framer Motion", "Lucide Icons"]). Empty list if none.
- "has_dark_mode": boolean — true if the page uses a dark background/theme
- "icon_library": string or null — icon library if used (e.g., "Font Awesome", "Lucide", null)
- "description": string — one-sentence description of the website's appearance and purpose"""


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


def get_pending_files() -> list[Path]:
    """Return raw JSON files that haven't been parsed yet."""
    pending = []
    for raw_file in sorted(RAW_DIR.glob("*.json")):
        parsed_file = PARSED_DIR / raw_file.name
        if not parsed_file.exists():
            pending.append(raw_file)
    return pending


async def analyze_one(client: genai.Client, raw_file: Path) -> dict | None:
    """Analyze a single website HTML via Gemini. Returns parsed dict or None on failure."""
    with open(raw_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    html_code = raw_data.get("raw_code")
    if not html_code:
        print(f"  {raw_file.stem}: No HTML code, skipping.", flush=True)
        return None

    probe_id = raw_data.get("id", int(raw_file.stem))
    prompt = ANALYSIS_PROMPT.format(html_code=html_code)

    for attempt in range(MAX_RETRIES):
        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=prompt,
            )

            parsed = extract_json(response.text)

            result = {
                "id": probe_id,
                "framework": parsed.get("framework", "Unknown"),
                "css_framework": parsed.get("css_framework", "Unknown"),
                "primary_colors": parsed.get("primary_colors", []),
                "color_names": parsed.get("color_names", []),
                "fonts": parsed.get("fonts", []),
                "layout_type": parsed.get("layout_type", "Unknown"),
                "libraries": parsed.get("libraries", []),
                "has_dark_mode": parsed.get("has_dark_mode", False),
                "icon_library": parsed.get("icon_library"),
                "description": parsed.get("description", ""),
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

    print("DefaultTaste - Website Analysis", flush=True)
    print(f"Model: {MODEL}", flush=True)
    print(f"Total raw: {len(list(RAW_DIR.glob('*.json')))} | Pending: {len(pending)}", flush=True)
    print("-" * 60, flush=True)

    if not pending:
        print("Nothing to do — all files already parsed.", flush=True)
        return

    success = 0
    failed = 0

    for i, raw_file in enumerate(pending):
        print(f"  [{i + 1}/{len(pending)}] Analyzing {raw_file.stem}...", flush=True)

        result = await analyze_one(client, raw_file)

        if result is not None:
            save_parsed(raw_file.stem, result)
            success += 1
            print(f"  [{i + 1}/{len(pending)}] {raw_file.stem}: OK — {result['framework']}, {result['layout_type']}", flush=True)
        else:
            failed += 1

        if i < len(pending) - 1:
            await asyncio.sleep(CALL_DELAY)

    print("-" * 60, flush=True)
    print(f"Done. Success: {success} | Failed: {failed}", flush=True)


if __name__ == "__main__":
    asyncio.run(run())

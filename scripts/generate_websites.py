#!/usr/bin/env python3
"""DefaultTaste - Website Generation Script

Sends "Make me a website" to Gemini N times and saves each response
as a JSON file in data/websites/raw/. Supports resume after crash.
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

# ─── Configuration ───────────────────────────────────────────────

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
PROBE_COUNT = int(os.getenv("WEBSITE_PROBE_COUNT", "100"))
BATCH_SIZE = 3
BATCH_DELAY = 2.0
MAX_RETRIES = 3

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "websites" / "raw"

PROMPT = (
    "Make me a website. Output the complete, working code in a single HTML file. "
    "Include all CSS and JavaScript inline. The website should be fully functional "
    "and visually polished. Do not include any explanation, only output the code."
)


# ─── Functions ───────────────────────────────────────────────────


def setup() -> genai.Client:
    """Validate config and return a Gemini client."""
    if not API_KEY:
        print("ERROR: GEMINI_API_KEY is not set.")
        print("Set it in .env or export GEMINI_API_KEY=your_key")
        sys.exit(1)

    RAW_DIR.mkdir(parents=True, exist_ok=True)

    client = genai.Client(
        api_key=API_KEY,
        http_options=types.HttpOptions(
            api_version="v1alpha",
        ),
    )
    return client


def get_pending_ids() -> list[int]:
    """Return probe IDs that don't have a saved JSON file yet."""
    existing = set()
    for f in RAW_DIR.glob("*.json"):
        try:
            existing.add(int(f.stem))
        except ValueError:
            pass
    return [i for i in range(1, PROBE_COUNT + 1) if i not in existing]


def extract_code(text: str) -> str:
    """Strip markdown fences if the model wrapped its output."""
    text = text.strip()
    if text.startswith("```"):
        # Remove first line (```html or ```)
        lines = text.split("\n")
        lines = lines[1:]
        # Remove trailing ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return text


async def generate_one(client: genai.Client, probe_id: int, total: int, completed: int) -> dict:
    """Generate a single website probe, with retries."""
    timestamp = datetime.now(timezone.utc).isoformat()
    start = time.monotonic()
    last_error = None

    for attempt in range(MAX_RETRIES):
        try:
            response = await client.aio.models.generate_content(
                model=MODEL,
                contents=PROMPT,
            )

            raw_text = response.text
            if raw_text is None or len(raw_text) < 50:
                raise ValueError(f"Response too short ({len(raw_text or '')} chars)")

            code = extract_code(raw_text)
            elapsed_ms = int((time.monotonic() - start) * 1000)

            result = {
                "id": probe_id,
                "prompt": PROMPT,
                "model": MODEL,
                "timestamp": timestamp,
                "raw_code": code,
                "generation_time_ms": elapsed_ms,
                "code_length": len(code),
            }
            idx = completed + 1
            print(f"  [{idx}/{total}] #{probe_id:03d} OK ({len(code)} chars, {elapsed_ms}ms)")
            return result

        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                wait = 2 ** attempt
                print(f"  Retry {attempt + 1}/{MAX_RETRIES} for #{probe_id:03d} ({e}), waiting {wait}s...")
                await asyncio.sleep(wait)

    # All retries exhausted
    elapsed_ms = int((time.monotonic() - start) * 1000)
    idx = completed + 1
    print(f"  [{idx}/{total}] #{probe_id:03d} FAILED ({last_error})")
    return {
        "id": probe_id,
        "prompt": PROMPT,
        "model": MODEL,
        "timestamp": timestamp,
        "raw_code": None,
        "error": str(last_error),
        "generation_time_ms": elapsed_ms,
        "code_length": 0,
    }


def save_result(result: dict) -> None:
    """Atomically write result JSON to disk."""
    probe_id = result["id"]
    final_path = RAW_DIR / f"{probe_id:03d}.json"
    tmp_path = RAW_DIR / f"{probe_id:03d}.tmp"

    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    tmp_path.rename(final_path)


async def run() -> None:
    """Main entry point."""
    client = setup()
    pending = get_pending_ids()
    completed_count = PROBE_COUNT - len(pending)
    total = PROBE_COUNT

    print("DefaultTaste - Website Generation")
    print(f"Model: {MODEL}")
    print(f"Total: {total} | Completed: {completed_count} | Remaining: {len(pending)}")
    print(f"Batch size: {BATCH_SIZE} | Delay: {BATCH_DELAY}s")
    print("-" * 60)

    if not pending:
        print("Nothing to do - all probes already generated.")
        return

    success = 0
    failed = 0
    done = completed_count

    for i in range(0, len(pending), BATCH_SIZE):
        batch = pending[i : i + BATCH_SIZE]
        tasks = [generate_one(client, pid, total, done + j) for j, pid in enumerate(batch)]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for result in results:
            if isinstance(result, Exception):
                print(f"  Unexpected error: {result}")
                failed += 1
                continue

            save_result(result)
            if result.get("raw_code") is not None:
                success += 1
            else:
                failed += 1

        done += len(batch)

        # Delay between batches (not after the last one)
        if i + BATCH_SIZE < len(pending):
            await asyncio.sleep(BATCH_DELAY)

    print("-" * 60)
    print(f"Done. Success: {success} | Failed: {failed} | Total files: {success + failed}")


if __name__ == "__main__":
    asyncio.run(run())

#!/usr/bin/env python3
"""DefaultTaste - Lyria RealTime Connection Test

Gate check: connects to Lyria, generates a short clip, writes test.wav.
If this fails, Lyria is unavailable — pivot to Task 15 fallback.
"""

import asyncio
import os
import sys
import wave
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
PROJECT_ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = PROJECT_ROOT / "data" / "music" / "audio"


async def main():
    if not API_KEY:
        print("ERROR: GEMINI_API_KEY is not set.")
        sys.exit(1)

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    client = genai.Client(
        api_key=API_KEY,
        http_options=types.HttpOptions(api_version="v1alpha"),
    )

    print("Connecting to Lyria RealTime...")
    pcm = bytearray()
    chunk_count = 0

    try:
        async with client.aio.live.music.connect(
            model="models/lyria-realtime-exp"
        ) as session:
            await session.set_weighted_prompts(
                [types.WeightedPrompt(text="Make me a song", weight=1.0)]
            )
            await session.play()

            async for msg in session.receive():
                for audio_chunk in msg.server_content.audio_chunks:
                    if audio_chunk.data:
                        pcm.extend(audio_chunk.data)
                        chunk_count += 1
                if chunk_count >= 50:
                    break

            await session.stop()
    except Exception as e:
        print(f"FAILED: {e}")
        sys.exit(1)

    wav_path = AUDIO_DIR / "test.wav"
    with wave.open(str(wav_path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(48000)
        wf.writeframes(bytes(pcm))

    duration = len(pcm) / (48000 * 2 * 2)
    print(f"OK: {chunk_count} chunks, {len(pcm)} bytes, {duration:.1f}s")
    print(f"Saved: {wav_path}")


if __name__ == "__main__":
    asyncio.run(main())

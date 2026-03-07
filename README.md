<p align="center">
  <img src="img.png" alt="DefaultTaste — Point us at an agent. Reveal the taste it defaults to." width="100%" />
</p>

<p align="center">
  DefaultTaste reveals the hidden aesthetic preferences baked into AI agents.<br/>
  We probe a model hundreds of times, map the patterns it defaults to,<br/>
  and generate a correction prompt to break out of them.
</p>

---

## The Problem

Ask an AI to "make me a website" and you'll get React, Tailwind, Inter font, purple gradients, and three feature cards. Ask it to compose music and you'll get 120 BPM pop in the key of C. Do it again — same thing. And again.

These aren't creative choices. They're **defaults** — aesthetic biases absorbed from training data that silently shape every output. A [March 2025 study](https://arxiv.org/abs/2503.01633) found LLMs pick Python 90–97% of the time. A [December 2025 paper](https://arxiv.org/abs/2412.13153) showed image generators converge to just 12 visual motifs.

Every AI model has taste. DefaultTaste makes it visible.

## How It Works

```
1. PROBE      Send the same vague prompt hundreds of times
2. ANALYZE    Extract dimensions: colors, fonts, frameworks, BPM, key, genre...
3. PROFILE    Aggregate into a taste fingerprint with frequency distributions
4. CORRECT    Generate a negation prompt that inverts the defaults
```

The result is a **taste profile** — a data-driven portrait of what an AI reaches for when you don't tell it what to do — paired with a **correction prompt** to override those defaults.

## Agents Profiled

| Agent | Model | Domain | Probes | Key Findings |
|-------|-------|--------|--------|--------------|
| **Gemini 2.5 Flash** | `gemini-2.5-flash` | Code generation | 94 | Light Gray / Blue palette, Arial 74%, landing pages 41%, "clinical" mood |
| **Gemini 3.1 Flash Lite** | `gemini-3.1-flash-lite-preview` | Code generation | 99 | Indigo-led palette, different font/layout defaults than 2.5 Flash |
| **Gemini 2.0 Flash Lite** | `gemini-2.0-flash-lite-001` | Code generation | 100 | Charcoal-dominant (32%), distinct aesthetic from newer models |
| **Lyria RealTime** | `lyria-realtime` | Music generation | 20 | 120 BPM clustering, C Major, pop/electronic, Western-dominant |

Each agent gets its own taste profile page with radar charts, color palettes, font specimens, and an auto-generated correction prompt to override its defaults.

## Project Structure

```
defaulttaste/
├── scripts/           # Python — offline data generation pipeline
│   ├── generate_*.py  # Probe agents (Gemini, Lyria)
│   ├── analyze_*.py   # Extract dimensions from raw outputs
│   └── aggregate_*.py # Build taste profiles
├── data/              # Generated artifacts (JSON + WAV)
│   ├── websites/      # raw/, parsed/, profile.json
│   ├── music/         # audio/, raw/, parsed/, profile.json
│   └── negation/      # Correction prompts
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # UI: charts, profile views, landing
│   └── lib/           # Data loading, types, mock data
└── public/audio/      # Served audio files
```

## Architecture

Users submit an agent endpoint through the web UI, choose a medium (website or music) and probe depth (quick / standard / deep), and hit start. The Next.js API kicks off a Python worker that probes the agent live, persists progress to disk, and streams status back to the frontend. Once probing completes, the results are analyzed, aggregated into a taste profile, and rendered as an interactive report.

```
Browser ──▶ POST /api/probe-runs ──▶ Python worker (run_probe.py)
                                          │
                                          ├─ probe agent N times
                                          ├─ analyze each output
                                          ├─ aggregate into profile
                                          └─ write to data/runs/<id>/
                                                    │
                                          ◀── poll /api/probe-runs/<id>
                                          │
Browser ◀── live progress + final profile
```

Pre-generated profiles for the four agents above are also included in `data/` so the app works out of the box without running any probes.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Charts:** Recharts
- **Motion:** Framer Motion
- **Data Pipeline:** Python 3.11+ (google-genai SDK, librosa)
- **APIs:** Gemini 2.5 Flash (text/code), Lyria RealTime (music via WebSocket)
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

### Data Generation (optional — pre-generated data included)

```bash
# Generate website probes
GEMINI_API_KEY=xxx python3 scripts/generate_websites.py

# Generate music probes
GEMINI_API_KEY=xxx python3 scripts/generate_music.py
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing — hero, agent cards, probe input |
| `/agent/gemini-flash` | Gemini 2.5 Flash taste profile |
| `/agent/gemini-flash-lite` | Gemini 3.1 Flash Lite taste profile |
| `/agent/gemini-2-flash-lite` | Gemini 2.0 Flash Lite taste profile |
| `/agent/lyria` | Lyria RealTime music taste profile |
| `/probe/new` | Configure and launch a new probe |
| `/probe/[runId]` | Live progress and results for a probe run |
| `/intro` | Animated intro presentation |

## Context

Built at the **Gemini 3 Hackathon** in Singapore, March 7, 2026. Team of 2, 7 hours.

## License

MIT

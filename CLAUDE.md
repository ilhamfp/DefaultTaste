# CLAUDE.md — Project Context for AI Assistants

## What is this project?

DefaultTaste is a platform that reveals the hidden aesthetic preferences ("default taste") of AI agents. We probe AI models by asking them to generate websites and music hundreds of times, analyze the patterns in their outputs, and produce a visual "taste profile" showing their defaults — plus a correction prompt to override them.

**Hackathon project.** Gemini 3 Singapore, March 7, 2026. Team of 2. 7 hours to build.

## Key Documents

Read these before writing any code:

- `ARCHITECTURE.md` — System design, data flow, file structure, demo script
- `TASKS.md` — Step-by-step build plan with timeline and ownership
- `BRAND_GUIDELINES.md` — Visual identity, colors, fonts, components, anti-patterns
- `.env.example` — Environment variables

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Data Generation:** Python scripts (offline, not in API routes)
- **APIs:** Google Gemini 2.5 Flash (text/code), Lyria RealTime (music via WebSocket)
- **Fonts:** Instrument Serif (display headlines), JetBrains Mono (data/body/everything else)
- **Deployment:** Vercel

## Architecture Summary

```
Python scripts (offline) → data/ directory (JSON + WAV)
                                    ↓
                    Next.js frontend reads data/ and visualizes
```

Data generation and the frontend are decoupled. Python scripts run in terminal with retry/resume. The Next.js app reads pre-generated JSON files from `data/` and serves them. Mock data exists in `src/lib/mock.ts` for development before real data is ready.

## Project Structure

```
defaulttaste/
├── scripts/              # Python data generation (offline)
├── data/                 # Generated artifacts (JSON + WAV)
│   ├── websites/         # raw/, parsed/, profile.json
│   ├── music/            # audio/, raw/, parsed/, profile.json
│   ├── negation/         # Correction prompts
│   └── demo/             # Before/after assets
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── agent/[agentId]/      # Agent profile page
│   │   └── api/                  # Minimal API routes
│   ├── components/
│   │   ├── landing/              # Hero, AgentCard, ProbeInput, Ticker
│   │   └── profile/              # Charts, CorrectionPrompt, BeforeAfter
│   └── lib/
│       ├── types.ts              # TypeScript interfaces
│       ├── mock.ts               # Mock data for dev
│       └── data.ts               # Loads real data, falls back to mock
└── public/audio/                 # Served audio files
```

## Design System — CRITICAL

**Read `BRAND_GUIDELINES.md` in full before writing any frontend code.**

### Theme: Warm Light Editorial ("Data Broadsheet")

This is a LIGHT theme. Warm cream background, white cards, sharp black ink, amber accents. Think Financial Times meets scientific paper. AI defaults to dark mode 72% of the time — we're bright on purpose.

### Colors (quick ref):

- Page background: `bg-[#FAFAF7]` (warm cream, NOT pure white)
- Cards: `bg-white border border-stone-200 rounded-sm p-6`
- Text: `text-stone-900` (primary), `text-stone-600` (secondary), `text-stone-400` (ghost)
- Labels: `text-xs uppercase tracking-widest text-stone-500`
- Accent: `text-amber-600`, `bg-amber-600` — sparingly, for key stats and CTAs
- Highlighter: `bg-amber-100 px-1` on key numbers (1-2 per section max)
- Chart colors: `["#D97706", "#57534E", "#EA580C", "#A8A29E", "#92400E", "#D6D3D1"]`
- Before card: `bg-red-50 border-red-200`
- After card: `bg-green-50 border-green-200`

### Typography:

- Headlines: Instrument Serif (`font-serif`), regular weight, stone-900
- Tagline: Instrument Serif italic, stone-500
- Everything else: JetBrains Mono (`font-mono`)
- Stat numbers: `text-5xl font-bold text-stone-900` — always the hero
- Labels: `text-xs uppercase tracking-widest text-stone-500`

### Layout:

- Sharp corners: `rounded-sm` max. NEVER `rounded-lg`.
- Borders not shadows. NEVER `shadow-lg`.
- Left-aligned, not centered.
- Dense, data-first.

### NEVER use (these are the AI defaults we expose):

- ❌ Purple/indigo colors
- ❌ Inter, Roboto, Space Grotesk fonts
- ❌ Dark mode / dark backgrounds
- ❌ `rounded-lg`, `rounded-xl`
- ❌ Box shadows on cards
- ❌ Centered hero + subtitle + CTA button layout
- ❌ 3 feature cards in a row with icons
- ❌ Gradient text
- ❌ Emojis in UI

### Logo:
"Default" in `text-stone-900` + "Taste" in `text-amber-600`. Instrument Serif.

## Two Pre-Built Agent Profiles

1. **Gemini 2.5 Flash** (`gemini-flash`) — 100 website probes. Dimensions: framework, CSS, colors, fonts, layout, libraries, dark mode %.
2. **Lyria RealTime** (`lyria`) — 20 music probes. Dimensions: BPM, key, genre, mood, instruments, cultural origin, brightness, density.

## Routes

| Route | What |
|-------|------|
| `/` | Landing page: hero, agent cards, platform concept |
| `/agent/gemini-flash` | Website taste profile |
| `/agent/lyria` | Music taste profile |
| `/api/profile/[agentId]` | Returns agent profile JSON |

## Commands

```bash
npm run dev                                              # Dev server
GEMINI_API_KEY=xxx python3 scripts/generate_websites.py  # Generate data
GEMINI_API_KEY=xxx python3 scripts/generate_music.py     # Generate music
npx vercel                                               # Deploy
```

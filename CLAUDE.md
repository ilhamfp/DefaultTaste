# CLAUDE.md - Project Context for AI Assistants

## What is this project?

DefaultTaste is a platform that reveals the hidden aesthetic preferences ("default taste") of AI agents. We probe AI models by asking them to generate websites and music hundreds of times, analyze the patterns in their outputs, and produce a visual taste profile showing their defaults, plus a correction prompt to override them.

**Hackathon project.** Gemini 3 Singapore, March 7, 2026. Team of 2. 7 hours to build.

## Key Documents

Read these before writing any code:

- `ARCHITECTURE.md` - System design, data flow, file structure, demo script
- `TASKS.md` - Step-by-step build plan with timeline and ownership
- `BRAND_GUIDELINES.md` - Visual identity, colors, fonts, components, anti-patterns
- `.env.example` - Environment variables

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Data Generation:** Python scripts (offline, not in API routes)
- **APIs:** Google Gemini 2.5 Flash (text/code), Lyria RealTime (music via WebSocket)
- **Fonts:** Noto Serif (display headlines), Geist (UI/body), Geist Mono (data, code, model labels)
- **Deployment:** Vercel

## Architecture Summary

```text
Python scripts (offline) -> data/ directory (JSON + WAV)
                                    |
                                    v
                    Next.js frontend reads data/ and visualizes
```

Data generation and the frontend are decoupled. Python scripts run in terminal with retry/resume. The Next.js app reads pre-generated JSON files from `data/` and serves them. Mock data exists in `src/lib/mock.ts` for development before real data is ready.

## Project Structure

```text
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

## Design System - CRITICAL

**Read `BRAND_GUIDELINES.md` in full before writing any frontend code.**

### Theme: Light Reference Study

This is a **light-first** theme. White background, soft neutral surfaces, deep ink text, and restrained teal accents. The interface should feel modern, calm, and precise.

### Colors (quick ref)

- Page background: `bg-background`
- Cards: `bg-card border border-border rounded-xl p-6`
- Muted surfaces: `bg-muted`, `bg-muted/60`, `bg-secondary`
- Text: `text-foreground` (primary), `text-muted-foreground` (secondary)
- Accent: `text-primary`, `bg-primary`
- Chart colors: `["#46ECD5", "#00BBA7", "#009689", "#00786F", "#005F5A", "#7C7C67"]`
- Before card: `bg-rose-50 border-rose-200`
- After card: `bg-emerald-50 border-emerald-200`

### Typography

- Headlines and logo: Noto Serif (`font-serif`)
- Body and interface copy: Geist (`font-sans`)
- Data labels, model IDs, and code blocks: Geist Mono (`font-mono`)
- Stats should feel compact and precise, usually in mono

### Layout

- Medium radius and soft corners. Prefer `rounded-lg` and `rounded-xl`.
- Quiet borders over decorative chrome.
- Strong left alignment and readable content widths.
- Minimal effects. No paper texture, no gradient text, no loud motion.

### Avoid

- Amber-led editorial styling from the previous version
- Purple or neon brand accents
- Dark mode as the default presentation
- Heavy shadows, glassmorphism, or glossy surfaces
- Overly playful marketing patterns that fight the research tone

### Logo

"Default" in `text-foreground` + "Taste" in `text-primary`, both in `font-serif`.

## Two Pre-Built Agent Profiles

1. **Gemini 2.5 Flash** (`gemini-flash`) - 100 website probes. Dimensions: framework, CSS, colors, fonts, layout, libraries, dark mode %.
2. **Lyria RealTime** (`lyria`) - 20 music probes. Dimensions: BPM, key, genre, mood, instruments, cultural origin, brightness, density.

## Routes

| Route                    | What                                              |
| ------------------------ | ------------------------------------------------- |
| `/`                      | Landing page: hero, agent cards, platform concept |
| `/agent/gemini-flash`    | Website taste profile                             |
| `/agent/lyria`           | Music taste profile                               |
| `/api/profile/[agentId]` | Returns agent profile JSON                        |

## Commands

```bash
npm run dev                                              # Dev server
GEMINI_API_KEY=xxx python3 scripts/generate_websites.py  # Generate data
GEMINI_API_KEY=xxx python3 scripts/generate_music.py     # Generate music
npx vercel                                               # Deploy
```

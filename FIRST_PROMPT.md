# FIRST_PROMPT.md — Copy everything below the line into Claude Code

---

Read CLAUDE.md, ARCHITECTURE.md, TASKS.md, and BRAND_GUIDELINES.md carefully. Then bootstrap the DefaultTaste project in one go.

## What to build

### 1. Project setup
- Create a Next.js project with TypeScript, Tailwind, App Router, src directory
- Install: shadcn/ui (New York style, Zinc base, CSS variables), recharts, framer-motion
- Add shadcn components: button, card, badge, progress, tabs, separator
- Set up both fonts via next/font/google:
  - JetBrains Mono (weights: 300, 400, 500, 700) as `--font-mono`
  - Instrument Serif (weight: 400, styles: normal + italic) as `--font-serif`
- Apply both font variables to the body element
- Configure layout.tsx: NO dark class on html. Body classes: `font-mono antialiased` with custom background color `#FAFAF7`
- In globals.css: set the paper texture background on body per BRAND_GUIDELINES.md (the SVG noise with background-blend-mode: overlay on #FAFAF7)
- Override shadcn's default theme to use stone colors for borders and warm cream for backgrounds

### 2. Directory structure
Create all directories per ARCHITECTURE.md: scripts/, data/ (with all subdirs), src/components/landing/, src/components/profile/, src/lib/, src/app/agent/[agentId]/, src/app/api/profile/[agentId]/

### 3. Core lib files
- `src/lib/types.ts` — Full TypeScript interfaces for WebsiteProfile, MusicProfile, BpmStats, TasteEntry, ColorEntry, AgentProfile per ARCHITECTURE.md
- `src/lib/mock.ts` — Complete mock data for both agents with realistic numbers. Gemini Flash: React 78%, Tailwind 65%, Inter 62%, purple colors dominant, dark mode 72%, landing-page 55%. Lyria: avg BPM 118.5, key of C 35%, pop 35%, electronic 25%, Western origin 85%, synth pads 70%.
- `src/lib/data.ts` — Data loading utility: reads from data/ directory, falls back to mock

### 4. API route
- `src/app/api/profile/[agentId]/route.ts` — GET handler returning agent profile JSON

### 5. Landing page (`src/app/page.tsx`)
Build the full landing page. This is a PLATFORM landing page, not a simple demo. Follow BRAND_GUIDELINES.md exactly:

**Hero section:**
- "DefaultTaste" wordmark: Instrument Serif. "Default" in text-stone-900, "Taste" in text-amber-600. text-5xl or text-6xl.
- Below: *"Your AI has taste. You just don't know it yet."* in Instrument Serif italic, text-xl, text-stone-500.
- Below: "We probed Gemini 100 times. Here's what we found." with the number "100" wrapped in `<span className="bg-amber-100 px-1">100</span>` for highlighter effect, and animated with a count-up from 0.
- Left-aligned. NOT centered. No hero image.

**Agent cards section:**
- Section label: `text-xs uppercase tracking-widest text-stone-500` saying "AGENT PROFILES"
- Two cards side by side (grid cols-2 on desktop) linking to /agent/gemini-flash and /agent/lyria.
  - Each card: `bg-white border border-stone-200 rounded-sm p-6 hover:border-stone-300 transition-colors`
  - Card content: agent name in font-mono text-lg font-medium, model name in text-stone-500, probe count, and 2-3 key stat previews (e.g., "React: 78%" in amber-600)
  - A subtle `border-t-2 border-t-amber-600` on the top edge of each card
- Plus a ghost "Add Agent" card: `border border-dashed border-stone-300 rounded-sm p-6` with a + icon and "Add Agent" text in stone-400

**Platform concept section:**
- A form-like area (non-functional, shows the vision):
  - Label "AGENT ENDPOINT" (uppercase tracked stone-500) above a text input with placeholder "wss://your-agent-endpoint..."
  - Below: a row with select dropdown ("REST" / "WebSocket"), number input for runs (default "100"), and an amber button "Start Probing"
  - Below the form: "Supports any agent that accepts a prompt and returns a response." in text-xs text-stone-400
- All inputs styled with: `bg-white border border-stone-200 rounded-sm` — NOT default browser styling

**Defaults ticker (bottom):**
- A horizontally scrolling marquee: "React: 78% · Inter: 62% · Purple: 45% · Tailwind: 65% · Dark Mode: 72% · Pop: 35% · 120 BPM · Key of C · Western: 85%"
- Use CSS animation (translateX) for infinite scroll. Duplicate the text for seamless loop.
- Monospace, text-xs, text-stone-400. Percentages in text-amber-600.
- Contained in a div with `border-t border-stone-200` as a separator, `py-4`

**Animations:**
- All elements stagger in via Framer Motion: `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}` with `delay: index * 0.08`, `duration: 0.4`, `ease: "easeOut"`

### 6. Agent profile page (`src/app/agent/[agentId]/page.tsx`)
Build the full profile page. Fetch data client-side from /api/profile/[agentId] using useEffect + useState.

**Header:**
- Agent name: Instrument Serif, text-4xl, text-stone-900, left-aligned
- Below: model version + probe count + date. text-sm text-stone-500. Font mono.
- A dashed divider below: `border-t border-dashed border-stone-300 my-8`

**For gemini-flash (when website_profile exists):**
- Section label: "WEB GENERATION DEFAULTS" — text-xs uppercase tracking-widest text-stone-500
- Grid of cards (2 cols desktop):
  - **Framework**: horizontal BarChart (Recharts, layout="vertical"). XAxis percentage, YAxis category. Use CHART_COLORS. Contained in white card with border.
  - **CSS Framework**: same style horizontal BarChart
  - **Color Palette**: grid of square color swatches. Each swatch is a div with the hex background, rounded-sm, border-stone-200 border. Hex code in mono below. Count below that.
  - **Fonts**: Badge components. First font gets a badge with `bg-amber-100 text-amber-800 border-amber-200`. Rest get `bg-stone-100 text-stone-600`. Show percentage after each.
  - **Layout Type**: PieChart (Recharts). Use CHART_COLORS.
  - **Libraries**: badges like fonts.
  - **Dark Mode**: A big stat card. "72%" huge, "Dark Mode Default" label.

**For lyria (when music_profile exists):**
- Section label: "MUSIC GENERATION DEFAULTS"
- Grid of cards:
  - **BPM**: Three big numbers (average, median, ±std_dev) in a row. Below: BarChart histogram of BPM distribution.
  - **Key Signature**: PieChart
  - **Genre**: horizontal BarChart
  - **Mood**: badges (like font badges)
  - **Instruments**: badges, sorted by frequency
  - **Cultural Origin**: horizontal BarChart (this is the most important finding — 85% Western)
  - **Brightness + Density**: Two stat numbers side by side with text labels ("warm", "moderate")

**Correction prompt section:**
- Dashed divider above
- Section label "CORRECTION PROMPT"
- The negation_prompt displayed in: `bg-stone-50 border border-stone-200 rounded-sm p-4 font-mono text-sm text-stone-700 whitespace-pre-wrap`
- A "Copy" button (amber ghost style) that copies to clipboard, shows "Copied!" for 2 seconds

**Before/After section:**
- Section label "BEFORE / AFTER"
- Two cards side by side:
  - Left: `bg-red-50 border border-red-200 rounded-sm p-4`. Label "DEFAULT" in text-red-600 text-xs uppercase tracking-widest. An iframe placeholder or audio player placeholder inside.
  - Right: `bg-green-50 border border-green-200 rounded-sm p-4`. Label "CORRECTED" in text-green-600 text-xs uppercase tracking-widest. Same placeholder.
  - Below each: metadata in text-xs text-stone-500 (framework + colors for web, BPM + key + genre for music)

**Animations:** All cards stagger in with Framer Motion, 0.08s delay each.

### 7. Utility files
- `.env.example` with `GEMINI_API_KEY=` placeholder
- `.gitignore`: node_modules, .next, .env.local, data/websites/raw/, data/music/raw/ (but NOT data/*/profile.json, data/negation/, data/demo/)

## Non-negotiable design rules

Follow BRAND_GUIDELINES.md exactly:
- Warm cream page background: `bg-[#FAFAF7]` with paper texture CSS
- White cards: `bg-white border border-stone-200 rounded-sm`
- Text: stone-900, stone-600, stone-400 scale
- Accent: amber-600 ONLY. Used sparingly.
- Highlighter: bg-amber-100 on key numbers
- Font: Instrument Serif for headlines, JetBrains Mono for everything else
- Labels: text-xs uppercase tracking-widest text-stone-500
- Stats: text-5xl font-bold text-stone-900
- Sharp corners (rounded-sm), borders not shadows, left-aligned not centered
- Chart colors: ["#D97706", "#57534E", "#EA580C", "#A8A29E", "#92400E", "#D6D3D1"]
- NEVER: purple, Inter, dark mode, rounded-lg, shadow-lg, centered hero, gradient text, emojis

Build everything in one pass. Make it production-grade and visually striking. This is a hackathon demo — judges score creativity (35%) and live demo (45%). The design must be memorable and distinctly NOT look like AI-generated slop.

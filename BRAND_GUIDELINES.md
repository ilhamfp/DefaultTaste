# BRAND_GUIDELINES.md — DefaultTaste Visual Identity

---

## 1. Design Philosophy

DefaultTaste is a tool that exposes AI aesthetic defaults. **Our own aesthetic must be the antithesis of everything we critique.** If AI defaults to dark mode, we go warm and bright. If AI defaults to purple gradients, we use ink black and amber. If AI defaults to Inter, we use a serif. If AI defaults to safe, rounded, friendly layouts — we go sharp, dense, and editorial.

### Aesthetic Direction: **Data Broadsheet**

Imagine the front page of the Financial Times, crossed with a scientific paper, crossed with a vintage computer printout. Warm off-white paper. Dense columns of data. Sharp black ink. Amber highlights hand-drawn by a researcher circling the important finding. Everything has purpose, nothing is decoration. The typography is precise and elegant. You feel like you're reading an investigative report that reveals something hidden.

**Tone:** Editorial, investigative, precise, confidently technical.
**NOT:** Dark-mode techy, corporate SaaS, playful startup, or "clean minimal."

### The Irony Principle

We are built with the same tools we critique (Next.js, Tailwind, React). The irony is intentional. Our site proves that these tools CAN produce distinctive work — the defaults are the problem, not the tools. And yes — AI defaults to dark mode 72% of the time. We're bright on purpose.

---

## 2. Color System

### Core Palette

```
PAGE BACKGROUND:  #FAFAF7  (warm cream — NOT pure white)
CARD BACKGROUND:  #FFFFFF  (white cards on cream = subtle depth)
ELEVATED/CODE:    #F5F5F0  (warm gray, for code blocks + elevated surfaces)

INK PRIMARY:      #1C1917  (stone-900, near-black)
INK SECONDARY:    #57534E  (stone-600)
INK GHOST:        #A8A29E  (stone-400, for labels)

ACCENT:           #D97706  (amber-600 — the only accent color)
ACCENT HOT:       #EA580C  (orange-600 — hover/emphasis only)
ACCENT MUTED:     #FDE68A  (amber-200 — highlighter effect)

BORDER:           #E7E5E4  (stone-200)
BORDER STRONG:    #D6D3D1  (stone-300)

SUCCESS:          #16A34A  (green-600)
ERROR:            #DC2626  (red-600)
```

### CSS Variables

```css
:root {
  --bg-page: #FAFAF7;
  --bg-card: #FFFFFF;
  --bg-elevated: #F5F5F0;
  --ink-primary: #1C1917;
  --ink-secondary: #57534E;
  --ink-ghost: #A8A29E;
  --accent: #D97706;
  --accent-hot: #EA580C;
  --accent-muted: #FDE68A;
  --border: #E7E5E4;
  --border-strong: #D6D3D1;
}
```

### Usage Rules

- **Page background is warm cream, NOT pure white.** The warmth gives it a "quality paper" feeling.
- **Cards are pure white with stone-200 borders.** Cream + white = subtle depth without shadows.
- **Amber is the accent, used sparingly.** Key stat, active tab, CTA button, chart primary bar. If everything is amber, nothing is.
- **Amber-200 for highlighter effect.** Background behind a key stat, like a researcher's yellow marker.
- **Never use purple, indigo, or blue.** These are the AI defaults we expose.

### Chart Colors

```typescript
const CHART_COLORS = [
  "#D97706", // amber-600
  "#57534E", // stone-600
  "#EA580C", // orange-600
  "#A8A29E", // stone-400
  "#92400E", // amber-800
  "#D6D3D1", // stone-300
];
```

---

## 3. Typography

### Font Stack

```
Display / Headlines:   Instrument Serif (Google Fonts)
Data / Stats / Code:   JetBrains Mono (Google Fonts)
Body / Prose:          JetBrains Mono at lighter weight
```

### Font Loading

```tsx
import { JetBrains_Mono, Instrument_Serif } from "next/font/google";

const mono = JetBrains_Mono({
  subsets: ["latin"], variable: "--font-mono",
  weight: ["300", "400", "500", "700"],
});
const serif = Instrument_Serif({
  subsets: ["latin"], variable: "--font-serif",
  weight: ["400"], style: ["normal", "italic"],
});
```

### Type Scale

```
Stat Number:     text-6xl / JetBrains Mono 700 / stone-900
Page Headline:   text-4xl / Instrument Serif 400 / stone-900
Section Head:    text-2xl / Instrument Serif 400 / stone-900
Card Title:      text-lg  / JetBrains Mono 500 / stone-800
Body:            text-sm  / JetBrains Mono 400 / stone-700
Label:           text-xs  / JetBrains Mono 400 / uppercase tracking-widest stone-500
Ghost:           text-xs  / JetBrains Mono 300 / stone-400
```

### Rules

- Stat numbers are the hero. "78%" is huge. "Framework" is tiny above it.
- Labels: uppercase, tracking-widest, stone-500. Like `FRAMEWORK PREFERENCE`.
- Tagline in Instrument Serif italic: *"Your AI has taste."*
- Never bold the serif. Use JetBrains Mono 700 when you need bold.

---

## 4. Spatial Composition

- **Sharp corners:** `rounded-none` or `rounded-sm`. Never `rounded-lg`.
- **Borders, not shadows.** `border border-stone-200`, not `shadow-lg`.
- **Left-aligned, not centered.** Strong reading edge.
- **Dense, data-first.** Information density is a feature.
- Cards: `bg-white border border-stone-200 rounded-sm p-6`
- Before card: `bg-red-50 border border-red-200`
- After card: `bg-green-50 border border-green-200`

---

## 5. Texture & Effects

### Paper texture on body

```css
body {
  background-color: #FAFAF7;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-blend-mode: overlay;
}
```

### Highlighter effect: `bg-amber-100 px-1` on key numbers (max 1-2 per section)
### Accent top border on key cards: `border-t-2 border-t-amber-600`
### Dashed dividers between sections: `border-t border-dashed border-stone-300`

---

## 6. Motion

- Stagger entrance: `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}` delay `index * 0.08`
- Duration 0.4s, easeOut. No springs or bounces.
- Number count-up animation for hero stats.
- Recharts bars animate from zero: `animationDuration={800} animationEasing="ease-out"`
- Hover: border darkens slightly. No scale transforms.

---

## 7. Logo

"Default" in stone-900 + "Taste" in amber-600. Instrument Serif. No icon.
Tagline: *"Your AI has taste."* Instrument Serif italic, stone-500.

---

## 8. Anti-Patterns (NEVER)

| ❌ Anti-Pattern | ✅ Instead |
|----------------|-----------|
| Purple/indigo | Amber/orange |
| Inter font | Instrument Serif + JetBrains Mono |
| Dark mode | Warm cream light theme |
| `rounded-xl` | `rounded-sm` |
| `shadow-lg` | `border-stone-200` |
| Centered hero+CTA | Left-aligned, asymmetric |
| 3 feature cards | Data-first layout |
| Gradient text | Solid amber |
| Pure white #FFF bg | Warm cream #FAFAF7 |
| Emojis in UI | No emojis |

---

## 9. Tailwind Quick Reference

```
Page bg:         bg-[#FAFAF7]
Cards:           bg-white border border-stone-200 rounded-sm p-6
Text:            text-stone-900, text-stone-600, text-stone-400
Accent:          text-amber-600, bg-amber-600
Highlight:       bg-amber-100 px-1
Labels:          text-xs uppercase tracking-widest text-stone-500
Stat numbers:    text-5xl font-bold text-stone-900
Headlines:       font-serif text-4xl text-stone-900
Buttons:         bg-amber-600 hover:bg-amber-700 text-white rounded-sm
Ghost buttons:   border border-stone-300 hover:border-stone-400 rounded-sm
Before card:     bg-red-50 border-red-200
After card:      bg-green-50 border-green-200
```

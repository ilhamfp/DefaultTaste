# BRAND_GUIDELINES.md - DefaultTaste Visual Identity

## 1. Design Philosophy

DefaultTaste should feel like a modern research interface: calm, precise, and clearly structured. We are visualizing patterns in AI output, so the UI should look intentional and legible rather than theatrical.

### Aesthetic Direction: Reference Study

Think of a well-made design systems starter with a more editorial serif headline layer. The interface is bright, white, and quiet. Teal is used as a signal color, not a wallpaper color. Typography carries most of the character. Surfaces are soft and neutral. The result should feel analytical, polished, and current.

**Tone:** modern, research-forward, restrained, clear.
**Not:** warm newspaper aesthetic, loud startup gradients, dark cyber UI, or playful consumer app styling.

### Core Principles

- Light-first. The default experience is bright and neutral.
- Teal is the brand signal. Use it for emphasis, active states, and key numbers.
- Typography is split intentionally: serif for authority, sans for interface copy, mono for model names and data.
- Use medium radius and soft corners. This brand is calmer than the old sharp editorial system.
- Prefer borders and muted surfaces over decorative effects.

## 2. Color System

### Core Palette

```text
PAGE BACKGROUND:  #FFFFFF
CARD BACKGROUND:  #FFFFFF
MUTED SURFACE:    #F4F4F0
SECONDARY SURFACE:#F4F4F5

INK PRIMARY:      #0C0C09
INK SECONDARY:    #18181B
INK MUTED:        #7C7C67

PRIMARY:          #00786F
PRIMARY SOFT:     rgba(0, 120, 111, 0.10)
BORDER:           #E8E8E3
RING:             #ABAB9C

SUCCESS:          #059669
ERROR:            #DC2626
```

### CSS Variables

```css
:root {
  --background: #ffffff;
  --foreground: #0c0c09;
  --card: #ffffff;
  --card-foreground: #0c0c09;
  --primary: #00786f;
  --primary-foreground: #f0fdfa;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f0;
  --muted-foreground: #7c7c67;
  --border: #e8e8e3;
  --input: #e8e8e3;
  --ring: #abab9c;
}
```

### Usage Rules

- The page background stays white. Depth comes from muted surfaces and borders, not from tinted page chrome.
- Cards are white with quiet neutral borders.
- Teal is reserved for key actions, active state, logo accent, and highlighted metrics.
- Neutral muted backgrounds are preferred for code blocks, stat callouts, and inactive controls.
- Do not bring back amber as the house accent. Amber can appear in data, but not as the system color.

### Chart Colors

```ts
const CHART_COLORS = [
  "#46ECD5",
  "#00BBA7",
  "#009689",
  "#00786F",
  "#005F5A",
  "#7C7C67",
];
```

## 3. Typography

### Font Stack

```text
Display / Headlines: Noto Serif
Body / Interface:    Geist
Data / Code / Meta:  Geist Mono
```

### Font Loading

```tsx
import { Geist, Geist_Mono, Noto_Serif } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const notoSerif = Noto_Serif({ subsets: ["latin"], variable: "--font-serif" });
```

### Type Scale

```text
Hero Headline:   text-5xl to text-6xl / Noto Serif / tracking-tight
Section Title:   text-4xl / Noto Serif / tracking-tight
Card Title:      text-2xl / Noto Serif / tracking-tight
Body Copy:       text-sm to text-base / Geist
UI Label:        text-xs / Geist / uppercase tracking-[0.24em]
Data Stat:       text-4xl to text-5xl / Geist Mono / semibold
Meta Copy:       text-xs to text-sm / Geist Mono
```

### Rules

- Headlines and product name use `font-serif`.
- Interface copy defaults to `font-sans`.
- Model IDs, hex values, and dense stats use `font-mono`.
- Keep contrast high. The visual hierarchy should come from type, spacing, and restraint.

## 4. Components and Layout

- Cards: `rounded-xl border border-border bg-card p-6`
- Inputs: `rounded-lg border border-input bg-muted/60`
- Primary buttons: `rounded-lg bg-primary text-primary-foreground`
- Secondary surfaces: `bg-muted`, `bg-muted/60`, or `bg-secondary`
- Labels: `text-xs uppercase tracking-[0.24em] text-muted-foreground`
- Logo: "Default" in `text-foreground`, "Taste" in `text-primary`, both in `font-serif`

### Layout Rules

- Preserve a strong left alignment and readable line lengths.
- Use whitespace to separate sections instead of ornamental dividers.
- Medium radius is the default. Avoid extremely sharp corners and avoid oversized pill shapes on large surfaces.
- Borders should stay low-contrast and consistent across cards, inputs, and charts.

## 5. Motion and Effects

- Use the existing fade-up stagger for section entrances.
- Keep duration around 0.4s to 0.5s with ease-out timing.
- Avoid bouncy motion, oversized parallax, and attention-seeking hover transforms.
- No paper texture. No gradient text. No glossy glassmorphism.

## 6. Anti-Patterns

| Avoid                                            | Use Instead                                    |
| ------------------------------------------------ | ---------------------------------------------- |
| Amber-led branding                               | Teal-led branding                              |
| Instrument Serif + JetBrains Mono as house style | Noto Serif + Geist + Geist Mono                |
| Warm cream paper texture                         | Clean white canvas with muted neutral surfaces |
| Sharp editorial corners everywhere               | Medium radius, softer surfaces                 |
| Heavy shadows or glass                           | Quiet borders and muted fills                  |
| Loud gradients and neon accents                  | Restrained solid color emphasis                |
| Dark mode as default brand presentation          | Bright, light-first presentation               |

## 7. Tailwind Quick Reference

```text
Page background:  bg-background
Card:             bg-card border border-border rounded-xl p-6
Muted surface:    bg-muted or bg-muted/60
Primary text:     text-foreground
Secondary text:   text-muted-foreground
Accent:           text-primary or bg-primary
Labels:           text-xs uppercase tracking-[0.24em] text-muted-foreground
Headline:         font-serif tracking-tight text-foreground
Stat:             font-mono text-4xl to text-5xl text-primary
Input:            rounded-lg border border-input bg-muted/60
Button:           rounded-lg bg-primary text-primary-foreground
```

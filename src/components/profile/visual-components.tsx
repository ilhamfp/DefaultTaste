"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type {
  ColorEntry,
  TasteEntry,
  PersonalityProfile,
  ArtifactEntry,
} from "@/lib/types";

// ─── Artifact Hover Card ────────────────────────────────────────
// Reusable wrapper: hover to see matching artifact previews

function ArtifactHoverCard({
  children,
  matching,
  agentId,
}: {
  children: ReactNode;
  matching: ArtifactEntry[];
  agentId: string;
}) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (matching.length === 0) return <>{children}</>;

  const previews = matching.slice(0, 4);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setShow(true), 250);
      }}
      onMouseLeave={() => {
        clearTimeout(timeoutRef.current);
        setShow(false);
      }}
    >
      {children}
      {show && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              {matching.length} artifact{matching.length !== 1 ? "s" : ""} with
              this trait
            </p>
            <div className="flex gap-2">
              {previews.map((a) => (
                <div
                  key={a.id}
                  className="overflow-hidden rounded-lg border border-border bg-white"
                >
                  <div className="relative h-[75px] w-[100px] overflow-hidden">
                    <iframe
                      src={`/artifacts/${agentId}/${a.id}.html`}
                      sandbox="allow-scripts"
                      loading="lazy"
                      title={`Artifact ${a.run_index}`}
                      className="pointer-events-none h-[600px] w-[800px] origin-top-left"
                      style={{ transform: "scale(0.125)" }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-1.5 py-1">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      #{a.run_index}
                    </span>
                    <div className="flex gap-0.5">
                      {a.dominant_colors.slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full border border-border/50"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Taste DNA Strip ────────────────────────────────────────────
// A wide proportional color bar — the AI's aesthetic fingerprint

export function TasteDNA({
  colors,
  artifacts,
  agentId,
}: {
  colors: ColorEntry[];
  artifacts?: ArtifactEntry[];
  agentId?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex h-16 sm:h-20">
        {colors.map((color) => (
          <div
            key={color.hex}
            className="group relative transition-all duration-300 hover:brightness-110"
            style={{
              backgroundColor: color.hex,
              flexGrow: color.percentage,
            }}
          >
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[10px] text-foreground shadow-sm backdrop-blur-sm">
                {color.name} {color.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/30 px-4 py-2">
        {colors.slice(0, 5).map((color) => {
          const matching =
            artifacts?.filter((a) =>
              a.dominant_colors.some(
                (c) => c.toLowerCase() === color.hex.toLowerCase(),
              ),
            ) ?? [];

          const inner = (
            <div className="flex cursor-default items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {color.hex}
              </span>
            </div>
          );

          return artifacts && agentId && matching.length > 0 ? (
            <ArtifactHoverCard
              key={color.hex}
              matching={matching}
              agentId={agentId}
            >
              {inner}
            </ArtifactHoverCard>
          ) : (
            <div key={color.hex}>{inner}</div>
          );
        })}
        {colors.length > 5 && (
          <span className="font-mono text-[10px] text-muted-foreground">
            +{colors.length - 5}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Personality Radar ──────────────────────────────────────────
// Spider chart of the AI's aesthetic personality

const PERSONALITY_LABELS: Record<string, string> = {
  boldness: "Boldness",
  originality: "Originality",
  sophistication: "Sophistication",
  playfulness: "Playfulness",
  minimalism: "Minimalism",
  warmth: "Warmth",
  professionalism: "Professionalism",
  trendiness: "Trendiness",
};

export function PersonalityRadarChart({
  personality,
}: {
  personality: PersonalityProfile;
}) {
  const data = Object.entries(personality).map(([key, value]) => ({
    trait: PERSONALITY_LABELS[key] || key,
    value: value as number,
    fullMark: 10,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="#E8E8E3" />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ fontSize: 11, fill: "#7C7C67" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fontSize: 9, fill: "#aaa" }}
            tickCount={6}
          />
          <Radar
            dataKey="value"
            stroke="#00786F"
            fill="#46ECD5"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1">
        {data.map((d) => (
          <div key={d.trait} className="flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
              {d.value}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {d.trait}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Font Specimen ──────────────────────────────────────────────
// Renders each font in its actual typeface

const SYSTEM_FONTS = new Set([
  "arial",
  "helvetica",
  "times new roman",
  "georgia",
  "verdana",
  "trebuchet ms",
  "courier new",
  "segoe ui",
  "tahoma",
  "impact",
  "comic sans ms",
  "lucida console",
  "palatino",
  "garamond",
  "book antiqua",
  "lucida sans",
  "century gothic",
  "calibri",
  "cambria",
  "candara",
  "consolas",
  "franklin gothic",
  "futura",
  "gill sans",
  "optima",
]);

function googleFontsUrl(fontName: string): string | null {
  if (SYSTEM_FONTS.has(fontName.toLowerCase())) return null;
  const family = fontName.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap`;
}

export function FontSpecimens({
  fonts,
  artifacts,
  agentId,
}: {
  fonts: TasteEntry[];
  artifacts?: ArtifactEntry[];
  agentId?: string;
}) {
  useEffect(() => {
    fonts.forEach((font) => {
      const url = googleFontsUrl(font.name);
      if (url && !document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = url;
        document.head.appendChild(link);
      }
    });
  }, [fonts]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fonts.map((font) => {
        const matching =
          artifacts?.filter(
            (a) =>
              a.primary_font.toLowerCase() === font.name.toLowerCase(),
          ) ?? [];

        const card = (
          <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
            <div
              className="mb-4 min-h-[5rem]"
              style={{ fontFamily: `"${font.name}", sans-serif` }}
            >
              <p className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                Aa Bb Cc
              </p>
              <p
                className="mt-1 text-lg text-muted-foreground"
                style={{ fontFamily: `"${font.name}", sans-serif` }}
              >
                The quick brown fox jumps over
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {font.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {font.count} of{" "}
                  {Math.round(font.count / (font.percentage / 100))} sites
                </p>
              </div>
              <span className="font-mono text-2xl font-semibold tracking-tight text-primary">
                {font.percentage}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${font.percentage}%` }}
              />
            </div>
            {artifacts && matching.length > 0 && (
              <p className="mt-2 text-[10px] text-muted-foreground/60">
                Hover to see {matching.length} example
                {matching.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        );

        return artifacts && agentId && matching.length > 0 ? (
          <ArtifactHoverCard
            key={font.name}
            matching={matching}
            agentId={agentId}
          >
            {card}
          </ArtifactHoverCard>
        ) : (
          <div key={font.name}>{card}</div>
        );
      })}
    </div>
  );
}

// ─── Ring Gauge ─────────────────────────────────────────────────
// Circular SVG progress indicator

function RingGauge({
  value,
  max = 100,
  label,
  suffix = "%",
  size = 100,
  color = "#00786F",
}: {
  value: number;
  max?: number;
  label: string;
  suffix?: string;
  size?: number;
  color?: string;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E8E8E3"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
            {typeof value === "number" && value % 1 !== 0
              ? value.toFixed(1)
              : value}
            <span className="text-xs text-muted-foreground">{suffix}</span>
          </span>
        </div>
      </div>
      <span className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function VisualFeaturesGauges({
  features,
}: {
  features: {
    has_animations_pct: number;
    has_gradients_pct: number;
    has_shadows_pct: number;
    hover_effects_pct: number;
    avg_density: number;
    avg_whitespace: number;
    avg_code_quality: number;
  };
}) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8">
      <RingGauge
        value={features.has_animations_pct}
        label="Animations"
        color="#46ECD5"
      />
      <RingGauge
        value={features.has_gradients_pct}
        label="Gradients"
        color="#00BBA7"
      />
      <RingGauge
        value={features.has_shadows_pct}
        label="Shadows"
        color="#009689"
      />
      <RingGauge
        value={features.hover_effects_pct}
        label="Hover Effects"
        color="#00786F"
      />
      <RingGauge
        value={features.avg_density}
        max={10}
        label="Density"
        suffix="/10"
        color="#005F5A"
      />
      <RingGauge
        value={features.avg_whitespace}
        max={10}
        label="Whitespace"
        suffix="/10"
        color="#46ECD5"
      />
      <RingGauge
        value={features.avg_code_quality}
        max={10}
        label="Code Quality"
        suffix="/10"
        color="#00BBA7"
      />
    </div>
  );
}

// ─── Warmth Spectrum ────────────────────────────────────────────
// Gradient bar showing warm/neutral/cool balance

export function WarmthSpectrum({ data }: { data: TasteEntry[] }) {
  const warm = data.find((d) => d.name === "Warm")?.percentage ?? 0;
  const neutral = data.find((d) => d.name === "Neutral")?.percentage ?? 0;
  const cool = data.find((d) => d.name === "Cool")?.percentage ?? 0;

  // Position marker: 0 = full warm, 100 = full cool
  const position = cool + neutral * 0.5;

  return (
    <div>
      <div className="relative mt-2">
        <div
          className="h-8 overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(to right, #E8956D, #F0C27F, #D4D4C8, #8CC5D6, #5B9BD5)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${position}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="h-10 w-0.5 bg-foreground/80" />
            <div className="mt-1 rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] text-background">
              {position > 66 ? "Cool" : position > 33 ? "Neutral" : "Warm"}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-between text-xs text-muted-foreground">
        <span>Warm {warm}%</span>
        <span>Neutral {neutral}%</span>
        <span>Cool {cool}%</span>
      </div>
    </div>
  );
}

// ─── Mood Bubbles ───────────────────────────────────────────────
// Proportionally-sized circles for emotional mood

const MOOD_COLORS: Record<string, string> = {
  Clinical: "#94a3b8",
  Calm: "#86efac",
  Serious: "#64748b",
  Energetic: "#fbbf24",
  Playful: "#f472b6",
  Futuristic: "#818cf8",
};

export function MoodBubbles({ data }: { data: TasteEntry[] }) {
  const maxPct = Math.max(...data.map((d) => d.percentage));

  return (
    <div className="flex flex-wrap items-end justify-center gap-4 py-4">
      {data.map((mood) => {
        const size = Math.max(
          40,
          Math.round(Math.sqrt(mood.percentage / maxPct) * 120),
        );
        const bg = MOOD_COLORS[mood.name] || "#cbd5e1";

        return (
          <div key={mood.name} className="flex flex-col items-center gap-2">
            <div
              className="flex items-center justify-center rounded-full transition-transform hover:scale-110"
              style={{
                width: size,
                height: size,
                backgroundColor: bg,
                opacity: 0.25 + 0.75 * (mood.percentage / maxPct),
              }}
            >
              <span className="font-mono text-xs font-semibold text-foreground">
                {mood.percentage}%
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {mood.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Dark Mode Split ────────────────────────────────────────────
// Visual light/dark card showing the ratio

export function DarkModeSplit({
  darkPercentage,
  artifacts,
  agentId,
}: {
  darkPercentage: number;
  artifacts?: ArtifactEntry[];
  agentId?: string;
}) {
  const lightPct = 100 - darkPercentage;
  const [hoveredSide, setHoveredSide] = useState<"light" | "dark" | null>(
    null,
  );
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const lightArtifacts =
    artifacts?.filter((a) => a.theme === "light") ?? [];
  const darkArtifacts =
    artifacts?.filter((a) => a.theme === "dark") ?? [];

  const hoveredArtifacts =
    hoveredSide === "light"
      ? lightArtifacts
      : hoveredSide === "dark"
        ? darkArtifacts
        : [];
  const previews = hoveredArtifacts.slice(0, 4);

  function enterSide(side: "light" | "dark") {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoveredSide(side), 250);
  }

  function leaveSide() {
    clearTimeout(hoverTimeout.current);
    setHoveredSide(null);
  }

  return (
    <div className="relative overflow-visible">
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex h-28 sm:h-32">
          {/* Light side */}
          <div
            className="relative flex items-center justify-center bg-white"
            style={{ flexGrow: lightPct }}
            onMouseEnter={() => enterSide("light")}
            onMouseLeave={leaveSide}
          >
            <div className="text-center">
              <svg
                className="mx-auto mb-1 text-amber-400"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="5" />
                <path
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <p className="font-mono text-2xl font-bold text-gray-900">
                {lightPct.toFixed(1)}%
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">
                Light
              </p>
            </div>
          </div>
          {/* Dark side */}
          <div
            className="relative flex items-center justify-center bg-gray-900"
            style={{ flexGrow: Math.max(darkPercentage, 3) }}
            onMouseEnter={() => enterSide("dark")}
            onMouseLeave={leaveSide}
          >
            <div className="text-center">
              <svg
                className="mx-auto mb-1 text-indigo-300"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              <p className="font-mono text-lg font-bold text-white">
                {darkPercentage}%
              </p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Dark
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Artifact preview popover */}
      {hoveredSide && agentId && previews.length > 0 && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              {hoveredArtifacts.length} {hoveredSide} artifact
              {hoveredArtifacts.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              {previews.map((a) => (
                <div
                  key={a.id}
                  className="overflow-hidden rounded-lg border border-border bg-white"
                >
                  <div className="relative h-[75px] w-[100px] overflow-hidden">
                    <iframe
                      src={`/artifacts/${agentId}/${a.id}.html`}
                      sandbox="allow-scripts"
                      loading="lazy"
                      title={`Artifact ${a.run_index}`}
                      className="pointer-events-none h-[600px] w-[800px] origin-top-left"
                      style={{ transform: "scale(0.125)" }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-1.5 py-1">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      #{a.run_index}
                    </span>
                    <div className="flex gap-0.5">
                      {a.dominant_colors.slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full border border-border/50"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Color Palette Grid (Enhanced) ──────────────────────────────
// Larger color swatches with hover interaction + artifact previews

export function ColorPaletteGrid({
  colors,
  artifacts,
  agentId,
}: {
  colors: ColorEntry[];
  artifacts?: ArtifactEntry[];
  agentId?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {colors.map((color) => {
        const matching =
          artifacts?.filter((a) =>
            a.dominant_colors.some(
              (c) => c.toLowerCase() === color.hex.toLowerCase(),
            ),
          ) ?? [];

        const card = (
          <div className="group rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div
              className="mb-3 aspect-square w-full rounded-lg border border-border transition-transform group-hover:scale-105"
              style={{ backgroundColor: color.hex }}
            />
            <p className="text-xs font-medium text-foreground">{color.name}</p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              {color.hex}
            </p>
            <p className="mt-2 font-mono text-sm font-semibold text-primary">
              {color.percentage}%
            </p>
            {artifacts && matching.length > 0 && (
              <p className="mt-1 text-[9px] text-muted-foreground/50">
                {matching.length} sites
              </p>
            )}
          </div>
        );

        return artifacts && agentId && matching.length > 0 ? (
          <ArtifactHoverCard
            key={color.hex}
            matching={matching}
            agentId={agentId}
          >
            {card}
          </ArtifactHoverCard>
        ) : (
          <div key={color.hex}>{card}</div>
        );
      })}
    </div>
  );
}

// ─── Design Philosophy Scale ────────────────────────────────────
// A visual scale from minimalist to maximalist

export function PhilosophyScale({ data }: { data: TasteEntry[] }) {
  const minimalist =
    data.find((d) => d.name === "Minimalist")?.percentage ?? 0;
  const balanced = data.find((d) => d.name === "Balanced")?.percentage ?? 0;

  return (
    <div>
      <div className="relative h-10 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center rounded-full bg-primary/15"
          style={{ width: `${minimalist}%` }}
        >
          <span className="px-3 font-mono text-xs font-semibold text-primary">
            {minimalist}%
          </span>
        </div>
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center"
          style={{ width: `${balanced}%` }}
        >
          <span className="px-3 font-mono text-xs font-semibold text-muted-foreground">
            {balanced}%
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Minimalist</span>
        <span>Balanced / Maximalist</span>
      </div>
    </div>
  );
}

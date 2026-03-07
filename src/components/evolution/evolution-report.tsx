"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MarketingShell } from "@/components/site/marketing-shell";
import { MoodBubbles } from "@/components/profile/visual-components";
import type { AgentProfile, ArtifactEntry } from "@/lib/types";

// ─── Constants ───────────────────────────────────────────────────

const MODEL_COLORS = ["#7C7C67", "#00BBA7", "#00786F"] as const;
const MODEL_LABELS = [
  "2.0 Flash Lite",
  "2.5 Flash",
  "3.1 Flash Lite",
] as const;

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E8E8E3",
  borderRadius: 12,
  fontSize: 12,
  color: "#0C0C09",
};

const labelClass =
  "text-xs uppercase tracking-[0.24em] text-muted-foreground";

// ─── Animation wrapper ──────────────────────────────────────────

function Reveal({
  children,
  className,
  reducedMotion,
}: {
  children: React.ReactNode;
  className?: string;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Compact TasteDNA strip ─────────────────────────────────────

function CompactDNA({
  colors,
  height = "h-8",
}: {
  colors: { hex: string; percentage: number; name: string }[];
  height?: string;
}) {
  return (
    <div className={`flex overflow-hidden rounded-lg ${height}`}>
      {colors.map((color, i) => (
        <div
          key={`${color.hex}-${i}`}
          className="group relative transition-all duration-300"
          style={{ backgroundColor: color.hex, flexGrow: color.percentage }}
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full bg-white/90 px-1.5 py-0.5 font-mono text-[9px] text-foreground shadow-sm">
              {color.name} {color.percentage}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────

function ChapterHeading({
  title,
  subtitle,
  reducedMotion,
}: {
  title: string;
  subtitle?: string;
  reducedMotion: boolean;
}) {
  return (
    <Reveal reducedMotion={reducedMotion} className="mb-8">
      <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
      <div className="mt-4 h-px bg-border" />
    </Reveal>
  );
}

// ─── Delta Card ─────────────────────────────────────────────────

function DeltaCard({
  label,
  oldVal,
  newVal,
  suffix = "",
  positive = true,
}: {
  label: string;
  oldVal: string;
  newVal: string;
  suffix?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className={`${labelClass} mb-3`}>{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-lg text-muted-foreground line-through decoration-muted-foreground/30">
          {oldVal}
          {suffix}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className={positive ? "text-emerald-500" : "text-rose-500"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
        <span
          className={`font-mono text-2xl font-semibold tracking-tight ${positive ? "text-emerald-600" : "text-rose-600"}`}
        >
          {newVal}
          {suffix}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

type Props = {
  profiles: AgentProfile[];
  manifests: ArtifactEntry[][];
};

export function EvolutionReport({ profiles, manifests }: Props) {
  const reducedMotion = useReducedMotion() ?? false;

  if (profiles.length < 3) {
    return (
      <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl px-2 pb-12 pt-10">
          <p className="text-sm text-muted-foreground">
            Not enough profile data to show evolution report.
          </p>
        </div>
      </MarketingShell>
    );
  }

  const [p0, p1, p2] = profiles;
  const wp0 = p0.website_profile!;
  const wp1 = p1.website_profile!;
  const wp2 = p2.website_profile!;
  const wps = [wp0, wp1, wp2];

  return (
    <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
      <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
        {/* ── 1. Hero + Artifact Triptych header ──────────── */}
        <HeroSection
          profiles={profiles}
          wps={wps}
          reducedMotion={reducedMotion}
        />

        {/* ── 2. Artifact Triptych (top-level showcase) ───── */}
        <section className="mt-10">
          <ArtifactTriptychSection
            profiles={profiles}
            manifests={manifests}
            reducedMotion={reducedMotion}
          />
        </section>

        {/* ── 3. Personality Radar ─────────────────────────── */}
        <section className="mt-16">
          <PersonalitySection wps={wps} reducedMotion={reducedMotion} />
        </section>

        {/* ── 4. Color Evolution ───────────────────────────── */}
        <section className="mt-16">
          <ColorEvolutionSection
            wps={wps}
            reducedMotion={reducedMotion}
          />
        </section>

        {/* ── 5. Mood Shift ────────────────────────────────── */}
        <section className="mt-16">
          <MoodShiftSection wps={wps} reducedMotion={reducedMotion} />
        </section>

        {/* ── 6. The Numbers Grid ──────────────────────────── */}
        <section className="mt-16">
          <NumbersGridSection wps={wps} reducedMotion={reducedMotion} />
        </section>

        {/* ── 7. Conclusion ────────────────────────────────── */}
        <section className="mt-16">
          <ConclusionSection
            profiles={profiles}
            wps={wps}
            reducedMotion={reducedMotion}
          />
        </section>

        <footer className="mt-10 border-t border-border pt-6">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-serif text-foreground">Default</span>
              <span className="font-serif text-primary">Taste</span>
            </Link>
            <span>Gemini 3 Hackathon 2026 &middot; Singapore</span>
          </div>
        </footer>
      </div>
    </MarketingShell>
  );
}

// ─── Section 1: Hero ────────────────────────────────────────────

function HeroSection({
  profiles,
  wps,
  reducedMotion,
}: {
  profiles: AgentProfile[];
  wps: NonNullable<AgentProfile["website_profile"]>[];
  reducedMotion: boolean;
}) {
  return (
    <section>
      <Reveal reducedMotion={reducedMotion}>
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="font-serif text-foreground">Default</span>
          <span className="font-serif text-primary">Taste</span>
          <span className="ml-2">/ Visual Report</span>
        </Link>
      </Reveal>

      <Reveal reducedMotion={reducedMotion} className="mt-6">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          How Gemini Learned to Feel
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          We gave three generations of Gemini the same prompt&mdash;&ldquo;build
          me a website&rdquo;&mdash;{profiles.reduce((s, p) => s + p.probe_count, 0)}{" "}
          times. The result is a visual story of an AI discovering aesthetics:
          from clinical precision to calm sophistication.
        </p>
      </Reveal>

      {/* Timeline dots */}
      <Reveal reducedMotion={reducedMotion} className="mt-8">
        <div className="flex items-center gap-0">
          {profiles.map((p, i) => (
            <div key={p.id} className="flex items-center">
              {i > 0 && (
                <div className="h-px w-8 sm:w-16 bg-border" />
              )}
              <div className="flex items-center gap-2.5">
                <div
                  className="h-3 w-3 rounded-full border-2"
                  style={{
                    borderColor: MODEL_COLORS[i],
                    backgroundColor:
                      i === profiles.length - 1
                        ? MODEL_COLORS[i]
                        : "transparent",
                  }}
                />
                <div>
                  <p
                    className="font-mono text-xs font-medium"
                    style={{ color: MODEL_COLORS[i] }}
                  >
                    {MODEL_LABELS[i]}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {p.probe_count} probes
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Three TasteDNA strips */}
      <Reveal reducedMotion={reducedMotion} className="mt-8 space-y-2">
        {wps.map((wp, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="w-24 shrink-0 text-right font-mono text-[10px]"
              style={{ color: MODEL_COLORS[i] }}
            >
              {MODEL_LABELS[i]}
            </span>
            <div className="flex-1">
              <CompactDNA colors={wp.colors} />
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

// ─── Section 2: Personality Radar ───────────────────────────────

const PERSONALITY_KEYS: (keyof NonNullable<
  AgentProfile["website_profile"]
>["personality"])[] = [
  "boldness",
  "originality",
  "sophistication",
  "playfulness",
  "minimalism",
  "warmth",
  "professionalism",
  "trendiness",
];

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

function PersonalitySection({
  wps,
  reducedMotion,
}: {
  wps: NonNullable<AgentProfile["website_profile"]>[];
  reducedMotion: boolean;
}) {
  const radarData = PERSONALITY_KEYS.map((key) => ({
    trait: PERSONALITY_LABELS[key],
    v0: wps[0].personality[key],
    v1: wps[1].personality[key],
    v2: wps[2].personality[key],
    fullMark: 10,
  }));

  return (
    <>
      <ChapterHeading
        title="Aesthetic Personality"
        subtitle="Each model's personality radar, overlaid. Watch the shape expand from a tight cautious cluster to a bolder, more expressive profile."
        reducedMotion={reducedMotion}
      />

      <Reveal reducedMotion={reducedMotion}>
        <div className="rounded-xl border border-border bg-card p-6">
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
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
                name={MODEL_LABELS[0]}
                dataKey="v0"
                stroke={MODEL_COLORS[0]}
                fill={MODEL_COLORS[0]}
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="6 3"
              />
              <Radar
                name={MODEL_LABELS[1]}
                dataKey="v1"
                stroke={MODEL_COLORS[1]}
                fill={MODEL_COLORS[1]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name={MODEL_LABELS[2]}
                dataKey="v2"
                stroke={MODEL_COLORS[2]}
                fill={MODEL_COLORS[2]}
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
              />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Reveal>

      {/* Stat delta cards for biggest movers */}
      <Reveal reducedMotion={reducedMotion} className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DeltaCard
            label="Sophistication"
            oldVal={wps[0].personality.sophistication.toFixed(1)}
            newVal={wps[2].personality.sophistication.toFixed(1)}
            suffix="/10"
          />
          <DeltaCard
            label="Trendiness"
            oldVal={wps[0].personality.trendiness.toFixed(1)}
            newVal={wps[2].personality.trendiness.toFixed(1)}
            suffix="/10"
          />
          <DeltaCard
            label="Originality"
            oldVal={wps[0].personality.originality.toFixed(1)}
            newVal={wps[2].personality.originality.toFixed(1)}
            suffix="/10"
          />
          <DeltaCard
            label="Warmth"
            oldVal={wps[0].personality.warmth.toFixed(1)}
            newVal={wps[2].personality.warmth.toFixed(1)}
            suffix="/10"
          />
        </div>
      </Reveal>
    </>
  );
}

// ─── Section 3: Color Evolution ─────────────────────────────────

function ColorEvolutionSection({
  wps,
  reducedMotion,
}: {
  wps: NonNullable<AgentProfile["website_profile"]>[];
  reducedMotion: boolean;
}) {
  // Build grouped bar data: top colors across versions
  const allColorNames = new Set<string>();
  wps.forEach((wp) =>
    wp.colors.slice(0, 5).forEach((c) => allColorNames.add(c.name)),
  );

  const barData = Array.from(allColorNames).map((name) => ({
    name,
    [MODEL_LABELS[0]]:
      wps[0].colors.find((c) => c.name === name)?.percentage ?? 0,
    [MODEL_LABELS[1]]:
      wps[1].colors.find((c) => c.name === name)?.percentage ?? 0,
    [MODEL_LABELS[2]]:
      wps[2].colors.find((c) => c.name === name)?.percentage ?? 0,
  }));

  // Sort by total to show most prominent colors first
  barData.sort(
    (a, b) =>
      (b[MODEL_LABELS[0]] as number) +
      (b[MODEL_LABELS[1]] as number) +
      (b[MODEL_LABELS[2]] as number) -
      ((a[MODEL_LABELS[0]] as number) +
        (a[MODEL_LABELS[1]] as number) +
        (a[MODEL_LABELS[2]] as number)),
  );

  return (
    <>
      <ChapterHeading
        title="From Grayscale to Indigo"
        subtitle="Gemini 2.0 lived in charcoal. 2.5 discovered blue. 3.1 committed to indigo. Watch the color palette transform."
        reducedMotion={reducedMotion}
      />

      {/* Stacked DNA strips with annotations */}
      <Reveal reducedMotion={reducedMotion}>
        <div className="space-y-4">
          {wps.map((wp, i) => (
            <div key={i}>
              <div className="mb-1 flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: MODEL_COLORS[i] }}
                />
                <span className="font-mono text-xs" style={{ color: MODEL_COLORS[i] }}>
                  {MODEL_LABELS[i]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Top: {wp.colors[0]?.name} {wp.colors[0]?.percentage}%
                </span>
              </div>
              <CompactDNA colors={wp.colors} height="h-10" />
              {i === 0 && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  Dominated by charcoal and grays &mdash; utilitarian, unadorned
                </p>
              )}
              {i === 1 && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  Blue emerges as the first &ldquo;chosen&rdquo; color &mdash;
                  a step toward expression
                </p>
              )}
              {i === 2 && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  Indigo takes over &mdash; a deliberate, sophisticated palette
                  choice
                </p>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      {/* Grouped bar chart */}
      <Reveal reducedMotion={reducedMotion} className="mt-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className={`${labelClass} mb-4`}>Color Comparison</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#7C7C67" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#7C7C67" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
              />
              {MODEL_LABELS.map((label, i) => (
                <Bar
                  key={label}
                  dataKey={label}
                  fill={MODEL_COLORS[i]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Reveal>
    </>
  );
}

// ─── Section 4: Mood Shift ──────────────────────────────────────

function MoodShiftSection({
  wps,
  reducedMotion,
}: {
  wps: NonNullable<AgentProfile["website_profile"]>[];
  reducedMotion: boolean;
}) {
  // Collect all mood names across versions
  const allMoods = new Set<string>();
  wps.forEach((wp) => wp.emotional_mood.forEach((m) => allMoods.add(m.name)));

  // Build area chart data: 3 data points (one per model version)
  const areaData = MODEL_LABELS.map((label, i) => {
    const entry: Record<string, string | number> = { model: label };
    allMoods.forEach((mood) => {
      entry[mood] =
        wps[i].emotional_mood.find((m) => m.name === mood)?.percentage ?? 0;
    });
    return entry;
  });

  const MOOD_AREA_COLORS: Record<string, string> = {
    Clinical: "#94a3b8",
    Calm: "#86efac",
    Serious: "#64748b",
    Energetic: "#fbbf24",
    Playful: "#f472b6",
    Futuristic: "#818cf8",
  };

  const moodNames = Array.from(allMoods);

  return (
    <>
      <ChapterHeading
        title="From Clinical to Calm"
        subtitle="The emotional signature of Gemini's output underwent a dramatic transformation. Clinical precision gave way to calm confidence."
        reducedMotion={reducedMotion}
      />

      {/* Stacked Area Chart */}
      <Reveal reducedMotion={reducedMotion}>
        <div className="rounded-xl border border-border bg-card p-6">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
              <XAxis
                dataKey="model"
                tick={{ fontSize: 11, fill: "#7C7C67" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#7C7C67" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
              />
              {moodNames.map((mood) => (
                <Area
                  key={mood}
                  type="monotone"
                  dataKey={mood}
                  stackId="1"
                  stroke={MOOD_AREA_COLORS[mood] ?? "#cbd5e1"}
                  fill={MOOD_AREA_COLORS[mood] ?? "#cbd5e1"}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Reveal>

      {/* Three MoodBubbles side-by-side */}
      <Reveal reducedMotion={reducedMotion} className="mt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {wps.map((wp, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: MODEL_COLORS[i] }}
                />
                <span className="font-mono text-xs" style={{ color: MODEL_COLORS[i] }}>
                  {MODEL_LABELS[i]}
                </span>
              </div>
              <MoodBubbles data={wp.emotional_mood} />
            </div>
          ))}
        </div>
      </Reveal>

      {/* Pull-quote */}
      <Reveal reducedMotion={reducedMotion} className="mt-6">
        <blockquote className="border-l-2 border-primary/40 pl-4">
          <p className="font-serif text-lg italic text-foreground/80">
            &ldquo;Clinical dropped from 90% to gone. Calm rose from
            nowhere to 82%. The machine didn&apos;t just learn to
            code&mdash;it learned to breathe.&rdquo;
          </p>
        </blockquote>
      </Reveal>
    </>
  );
}

// ─── Section 5: The Numbers Grid ────────────────────────────────

function NumbersGridSection({
  wps,
  reducedMotion,
}: {
  wps: NonNullable<AgentProfile["website_profile"]>[];
  reducedMotion: boolean;
}) {
  const metrics = [
    {
      label: "Dark Mode",
      oldVal: `${wps[0].dark_mode_percentage}`,
      newVal: `${wps[2].dark_mode_percentage}`,
      suffix: "%",
      positive: true,
    },
    {
      label: "Animations",
      oldVal: `${wps[0].visual_features.has_animations_pct}`,
      newVal: `${wps[2].visual_features.has_animations_pct}`,
      suffix: "%",
      positive: true,
    },
    {
      label: "Code Quality",
      oldVal: wps[0].visual_features.avg_code_quality.toFixed(1),
      newVal: wps[2].visual_features.avg_code_quality.toFixed(1),
      suffix: "/10",
      positive: true,
    },
    {
      label: "Whitespace",
      oldVal: wps[0].visual_features.avg_whitespace.toFixed(1),
      newVal: wps[2].visual_features.avg_whitespace.toFixed(1),
      suffix: "/10",
      positive: true,
    },
    {
      label: "Gradients",
      oldVal: `${wps[0].visual_features.has_gradients_pct}`,
      newVal: `${wps[2].visual_features.has_gradients_pct}`,
      suffix: "%",
      positive: true,
    },
    {
      label: "Shadows",
      oldVal: `${wps[0].visual_features.has_shadows_pct}`,
      newVal: `${wps[2].visual_features.has_shadows_pct}`,
      suffix: "%",
      positive: true,
    },
  ];

  return (
    <>
      <ChapterHeading
        title="The Numbers"
        subtitle="Key metrics that tell the story of growing expressiveness and craft."
        reducedMotion={reducedMotion}
      />

      <Reveal reducedMotion={reducedMotion}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <DeltaCard key={m.label} {...m} />
          ))}
        </div>
      </Reveal>
    </>
  );
}

// ─── Section 6: Artifact Triptych ───────────────────────────────

function ArtifactTriptychSection({
  profiles,
  manifests,
  reducedMotion,
}: {
  profiles: AgentProfile[];
  manifests: ArtifactEntry[][];
  reducedMotion: boolean;
}) {
  const [selection, setSelection] = useState(() =>
    manifests.map((m) => (m.length > 0 ? m[0] : null)),
  );
  const [activeTab, setActiveTab] = useState(0);

  const shuffle = useCallback(() => {
    setSelection(
      manifests.map((m) => {
        if (m.length === 0) return null;
        return m[Math.floor(Math.random() * m.length)];
      }),
    );
  }, [manifests]);

  return (
    <>
      <Reveal reducedMotion={reducedMotion}>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
              Side by Side
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Same prompt, three generations. See the difference in a single glance.
            </p>
          </div>
          <button
            onClick={shuffle}
            className="shrink-0 rounded-full border border-border bg-card px-4 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Shuffle
          </button>
        </div>
      </Reveal>

      <Reveal reducedMotion={reducedMotion}>
        {/* Mobile: tab switcher */}
        <div className="mb-4 flex gap-2 md:hidden">
          {MODEL_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={`flex-1 rounded-lg border px-2 py-1.5 font-mono text-xs transition-colors ${
                activeTab === i
                  ? "border-primary/40 bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Desktop: side-by-side */}
        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {profiles.map((p, i) => {
            const artifact = selection[i];
            return (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: MODEL_COLORS[i] }}
                  />
                  <span
                    className="font-mono text-xs"
                    style={{ color: MODEL_COLORS[i] }}
                  >
                    {MODEL_LABELS[i]}
                  </span>
                </div>
                {artifact ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-white">
                    <iframe
                      src={`/artifacts/${p.id}/${artifact.id}.html`}
                      sandbox="allow-scripts"
                      loading="lazy"
                      title={`${MODEL_LABELS[i]} artifact`}
                      className="pointer-events-none absolute left-0 top-0 h-[900px] w-[1200px] origin-top-left"
                      style={{
                        transform: "scale(0.25)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      No artifacts
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: single view */}
        <div className="md:hidden">
          {profiles.map((p, i) => {
            if (i !== activeTab) return null;
            const artifact = selection[i];
            return (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {artifact ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-white">
                    <iframe
                      src={`/artifacts/${p.id}/${artifact.id}.html`}
                      sandbox="allow-scripts"
                      loading="lazy"
                      title={`${MODEL_LABELS[i]} artifact`}
                      className="pointer-events-none absolute left-0 top-0 h-[900px] w-[1200px] origin-top-left"
                      style={{
                        transform: "scale(0.25)",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      No artifacts
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </>
  );
}

// ─── Section 7: Conclusion ──────────────────────────────────────

const PERSONA_DATA = [
  {
    title: "The Brutalist",
    desc: "Functional, unadorned, clinical. Every decision defaulted to the safest possible choice.",
    trait: "Clinical 90%",
  },
  {
    title: "The Explorer",
    desc: "Started adding color, motion, and variety. Blue appeared. Animations emerged. Balance was attempted.",
    trait: "Balanced 70%",
  },
  {
    title: "The Aesthete",
    desc: "Calm confidence. Indigo palettes, dark mode awareness, rising code quality. Taste, not just function.",
    trait: "Calm 82%",
  },
] as const;

function ConclusionSection({
  profiles,
  wps,
  reducedMotion,
}: {
  profiles: AgentProfile[];
  wps: NonNullable<AgentProfile["website_profile"]>[];
  reducedMotion: boolean;
}) {
  return (
    <>
      <ChapterHeading
        title="Three Eras of Taste"
        subtitle="Each model generation brought a distinct aesthetic personality."
        reducedMotion={reducedMotion}
      />

      <Reveal reducedMotion={reducedMotion}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PERSONA_DATA.map((persona, i) => (
            <Link
              key={persona.title}
              href={`/agent/${profiles[i].id}`}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: MODEL_COLORS[i] }}
                />
                <span
                  className="font-mono text-xs font-medium"
                  style={{ color: MODEL_COLORS[i] }}
                >
                  {MODEL_LABELS[i]}
                </span>
              </div>

              <h3 className="font-serif text-xl text-foreground">
                {persona.title}
              </h3>

              <div className="my-3">
                <CompactDNA colors={wps[i].colors} height="h-5" />
              </div>

              <p className="mb-3 font-mono text-xs text-primary">
                {persona.trait}
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {persona.desc}
              </p>

              <p className="mt-3 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                View full profile &rarr;
              </p>
            </Link>
          ))}
        </div>
      </Reveal>
    </>
  );
}

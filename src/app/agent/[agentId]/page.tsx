"use client";

import { useState, useEffect, use } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { MarketingShell } from "@/components/site/marketing-shell";
import type { AgentProfile } from "@/lib/types";

const CHART_COLORS = [
  "#46ECD5",
  "#00BBA7",
  "#009689",
  "#00786F",
  "#005F5A",
  "#7C7C67",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const sectionClass = "rounded-xl border border-border bg-card p-6";
const labelClass = "text-xs uppercase tracking-[0.24em] text-muted-foreground";
const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E8E8E3",
  borderRadius: 12,
  fontSize: 12,
  color: "#0C0C09",
};

function Section({
  title,
  index,
  reducedMotion,
  children,
}: {
  title: string;
  index: number;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion ? undefined : "visible"}
      variants={fadeUp}
      custom={index}
      className={sectionClass}
    >
      <h2 className={`${labelClass} mb-4`}>{title}</h2>
      {children}
    </motion.div>
  );
}

function HorizontalBarChart({
  data,
  dataKey = "percentage",
}: {
  data: { name: string; percentage: number }[];
  dataKey?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={data.length * 40 + 20}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#E8E8E3"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#7C7C67" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#0C0C09" }}
          width={120}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgb(0 120 111 / 6%)" }}
        />
        <Bar dataKey={dataKey} radius={[0, 8, 8, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TastePieChart({
  data,
}: {
  data: { name: string; percentage: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="percentage"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={88}
          stroke="#FFFFFF"
          strokeWidth={2}
          label={(props: PieLabelRenderProps) =>
            `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
          }
          style={{ fontSize: 11, fill: "#7C7C67" }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-md px-2 py-1 text-xs uppercase tracking-[0.24em] text-primary transition-colors hover:text-primary/80"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function WebsiteProfileView({
  profile,
  reducedMotion,
}: {
  profile: AgentProfile;
  reducedMotion: boolean;
}) {
  const wp = profile.website_profile!;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section
          title="Framework Distribution"
          index={3}
          reducedMotion={reducedMotion}
        >
          <HorizontalBarChart data={wp.frameworks} />
        </Section>
        <Section
          title="CSS Framework Distribution"
          index={4}
          reducedMotion={reducedMotion}
        >
          <HorizontalBarChart data={wp.css_frameworks} />
        </Section>
      </div>

      <Section
        title="Color Palette Defaults"
        index={5}
        reducedMotion={reducedMotion}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {wp.colors.map((color) => (
            <div
              key={color.hex}
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <div
                className="mb-3 aspect-square w-full rounded-lg border border-border"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-xs font-medium text-foreground">
                {color.name}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {color.hex}
              </p>
              <p className="mt-2 text-xs font-medium text-primary">
                {color.percentage}%
              </p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Font Defaults" index={6} reducedMotion={reducedMotion}>
          <div className="flex flex-wrap gap-2">
            {wp.fonts.map((font, i) => (
              <span
                key={font.name}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  i === 0
                    ? "border border-primary/20 bg-primary/10 text-primary"
                    : "border border-border bg-muted text-muted-foreground"
                }`}
              >
                {font.name}{" "}
                <span className="font-medium">{font.percentage}%</span>
              </span>
            ))}
          </div>
        </Section>

        <Section title="Layout Types" index={7} reducedMotion={reducedMotion}>
          <TastePieChart data={wp.layouts} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section
          title="Common Libraries"
          index={8}
          reducedMotion={reducedMotion}
        >
          <div className="flex flex-wrap gap-2">
            {wp.libraries.map((lib) => (
              <span
                key={lib.name}
                className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground"
              >
                {lib.name}{" "}
                <span className="font-medium text-foreground">
                  {lib.percentage}%
                </span>
              </span>
            ))}
          </div>
        </Section>

        <Section
          title="Dark Mode Default"
          index={9}
          reducedMotion={reducedMotion}
        >
          <div className="rounded-2xl border border-border bg-muted/60 px-4 py-6 text-center">
            <p className="font-mono text-5xl font-semibold tracking-tight text-primary">
              {wp.dark_mode_percentage}%
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              of generated websites use dark mode
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function MusicProfileView({
  profile,
  reducedMotion,
}: {
  profile: AgentProfile;
  reducedMotion: boolean;
}) {
  const mp = profile.music_profile!;

  return (
    <div className="space-y-6">
      <Section title="BPM Analysis" index={3} reducedMotion={reducedMotion}>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Average", value: mp.bpm.avg.toFixed(1) },
            { label: "Median", value: mp.bpm.median.toString() },
            { label: "Std Dev", value: mp.bpm.std_dev.toFixed(1) },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-muted/40 p-4 text-center"
            >
              <p className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mp.bpm.histogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 11, fill: "#7C7C67" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#7C7C67" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#00786F" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section
          title="Key Signature Distribution"
          index={4}
          reducedMotion={reducedMotion}
        >
          <TastePieChart data={mp.keys} />
        </Section>
        <Section
          title="Genre Distribution"
          index={5}
          reducedMotion={reducedMotion}
        >
          <HorizontalBarChart data={mp.genres} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Mood Defaults" index={6} reducedMotion={reducedMotion}>
          <div className="flex flex-wrap gap-2">
            {mp.moods.map((mood, i) => (
              <span
                key={mood.name}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  i === 0
                    ? "border border-primary/20 bg-primary/10 text-primary"
                    : "border border-border bg-muted text-muted-foreground"
                }`}
              >
                {mood.name}{" "}
                <span className="font-medium">{mood.percentage}%</span>
              </span>
            ))}
          </div>
        </Section>

        <Section
          title="Instrument Frequency"
          index={7}
          reducedMotion={reducedMotion}
        >
          <div className="space-y-3">
            {mp.instruments.map((inst) => (
              <div key={inst.name} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-sm text-foreground">
                  {inst.name}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${inst.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-muted-foreground">
                  {inst.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section
          title="Cultural Origin"
          index={8}
          reducedMotion={reducedMotion}
        >
          <HorizontalBarChart data={mp.cultural_origins} />
        </Section>

        <Section
          title="Audio Characteristics"
          index={9}
          reducedMotion={reducedMotion}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
              <p className="font-mono text-4xl font-semibold tracking-tight text-foreground">
                {mp.brightness.avg}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Brightness
              </p>
              <p className="mt-2 text-sm text-primary">{mp.brightness.label}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
              <p className="font-mono text-4xl font-semibold tracking-tight text-foreground">
                {mp.density.avg}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Density
              </p>
              <p className="mt-2 text-sm text-primary">{mp.density.label}</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function formatProfileDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

export default function AgentProfilePage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const reducedMotion = useReducedMotion() ?? false;
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/profile/${agentId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  if (loading) {
    return (
      <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </MarketingShell>
    );
  }

  if (!profile) {
    return (
      <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
          <p className="text-sm text-muted-foreground">Agent not found.</p>
          <Link
            href="/"
            className={`mt-3 inline-block text-sm text-primary transition-colors hover:text-primary/80 ${focusRingClass}`}
          >
            Back to home
          </Link>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
      <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
        <section className="pb-8">
          <motion.div
            initial={reducedMotion ? false : "hidden"}
            animate={reducedMotion ? undefined : "visible"}
            variants={fadeUp}
            custom={0}
          >
            <Link
              href="/"
              className={`text-xs uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-primary ${focusRingClass}`}
            >
              <span className="font-serif text-foreground">Default</span>
              <span className="font-serif text-primary">Taste</span>
              <span className="ml-2">/ Agents</span>
            </Link>
          </motion.div>

          <motion.h1
            className="mt-4 font-serif text-4xl tracking-tight text-foreground"
            initial={reducedMotion ? false : "hidden"}
            animate={reducedMotion ? undefined : "visible"}
            variants={fadeUp}
            custom={1}
          >
            {profile.name}
          </motion.h1>

          <motion.div
            className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground sm:text-sm"
            initial={reducedMotion ? false : "hidden"}
            animate={reducedMotion ? undefined : "visible"}
            variants={fadeUp}
            custom={2}
          >
            <span>{profile.model}</span>
            <span>·</span>
            <span>{profile.probe_count} probes</span>
            <span>·</span>
            <span>{formatProfileDate(profile.date)}</span>
          </motion.div>

          <div className="mt-6 border-b border-border" />
        </section>

        {profile.website_profile && (
          <WebsiteProfileView profile={profile} reducedMotion={reducedMotion} />
        )}
        {profile.music_profile && (
          <MusicProfileView profile={profile} reducedMotion={reducedMotion} />
        )}

        <motion.div
          initial={reducedMotion ? false : "hidden"}
          animate={reducedMotion ? undefined : "visible"}
          variants={fadeUp}
          custom={10}
          className="mt-8"
        >
          <div className={sectionClass}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className={labelClass}>Correction Prompt</h2>
              <CopyButton text={profile.correction_prompt} />
            </div>
            <div className="rounded-xl border border-border bg-muted/60 p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                {profile.correction_prompt}
              </pre>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : "hidden"}
          animate={reducedMotion ? undefined : "visible"}
          variants={fadeUp}
          custom={11}
          className="mt-6"
        >
          <h2 className={`${labelClass} mb-4`}>Before & After Correction</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-rose-700">
                Default Output
              </p>
              <div className="mt-3 flex min-h-[120px] items-center justify-center rounded-xl border border-rose-200 bg-white p-4">
                <p className="text-sm italic text-muted-foreground">
                  Demo asset pending. This will show the default{" "}
                  {profile.probe_type === "website" ? "website" : "audio"}{" "}
                  output.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-700">
                Corrected Output
              </p>
              <div className="mt-3 flex min-h-[120px] items-center justify-center rounded-xl border border-emerald-200 bg-white p-4">
                <p className="text-sm italic text-muted-foreground">
                  Demo asset pending. This will show the corrected{" "}
                  {profile.probe_type === "website" ? "website" : "audio"}{" "}
                  output.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <footer className="mt-10 border-t border-border pt-6">
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className={`transition-colors hover:text-primary ${focusRingClass}`}
            >
              <span className="font-serif text-foreground">Default</span>
              <span className="font-serif text-primary">Taste</span>
            </Link>
            <span>Gemini 3 Hackathon 2026 · Singapore</span>
          </div>
        </footer>
      </div>
    </MarketingShell>
  );
}

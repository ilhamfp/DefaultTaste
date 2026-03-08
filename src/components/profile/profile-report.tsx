"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import {
  TasteDNA,
  PersonalityRadarChart,
  FontSpecimens,
  VisualFeaturesGauges,
  WarmthSpectrum,
  MoodBubbles,
  DarkModeSplit,
  ColorPaletteGrid,
  PhilosophyScale,
} from "@/components/profile/visual-components";
import { ArtifactsGrid } from "@/components/profile/ArtifactsViewer";
import type { AgentProfile, ArtifactEntry, LyriaInteractiveProfile } from "@/lib/types";

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

const LyriaDefaultAudioCard = dynamic(
  () =>
    import("./lyria-default-audio-card").then(
      (module) => module.LyriaDefaultAudioCard,
    ),
  {
    loading: () => (
      <div className="min-h-80 rounded-[1.1rem] border border-border bg-muted/30" />
    ),
  },
);

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
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`rounded-md px-2 py-1 text-xs uppercase tracking-[0.24em] text-primary transition-colors hover:text-primary/80 ${focusRingClass}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function WebsiteProfileView({
  profile,
  reducedMotion,
  artifacts,
}: {
  profile: AgentProfile;
  reducedMotion: boolean;
  artifacts: ArtifactEntry[];
}) {
  const wp = profile.website_profile!;
  const agentId = profile.id;

  return (
    <div className="space-y-6">
      {/* Color Fingerprint */}
      <Section title="Color Fingerprint" index={3} reducedMotion={reducedMotion}>
        <TasteDNA colors={wp.colors} artifacts={artifacts} agentId={agentId} />
      </Section>

      {/* Personality Radar */}
      <Section title="Aesthetic Personality" index={4} reducedMotion={reducedMotion}>
        <PersonalityRadarChart personality={wp.personality} />
      </Section>

      {/* Font Specimens */}
      <Section title="Typography Defaults" index={5} reducedMotion={reducedMotion}>
        <FontSpecimens fonts={wp.fonts} artifacts={artifacts} agentId={agentId} />
      </Section>

      {/* Color Palette */}
      <Section title="Color Palette" index={6} reducedMotion={reducedMotion}>
        <ColorPaletteGrid colors={wp.colors} artifacts={artifacts} agentId={agentId} />
      </Section>

      {/* Warmth + Mood */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Color Temperature" index={7} reducedMotion={reducedMotion}>
          <WarmthSpectrum data={wp.color_warmth} />
        </Section>
        <Section title="Emotional Mood" index={7} reducedMotion={reducedMotion}>
          <MoodBubbles data={wp.emotional_mood} />
        </Section>
      </div>

      {/* Visual Features */}
      <Section title="Visual Features" index={8} reducedMotion={reducedMotion}>
        <VisualFeaturesGauges features={wp.visual_features} />
      </Section>

      {/* Dark Mode */}
      <Section title="Dark Mode Default" index={9} reducedMotion={reducedMotion}>
        <DarkModeSplit darkPercentage={wp.dark_mode_percentage} artifacts={artifacts} agentId={agentId} />
      </Section>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Layout Types" index={10} reducedMotion={reducedMotion}>
          <TastePieChart data={wp.layouts} />
        </Section>
        <Section title="Layout Techniques" index={10} reducedMotion={reducedMotion}>
          <HorizontalBarChart data={wp.layout_techniques} />
        </Section>
      </div>

      {/* Content Tone + Design Philosophy */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Content Tone" index={11} reducedMotion={reducedMotion}>
          <HorizontalBarChart data={wp.content_tone} />
        </Section>
        <Section title="Design Philosophy" index={11} reducedMotion={reducedMotion}>
          <PhilosophyScale data={wp.design_philosophy} />
        </Section>
      </div>
    </div>
  );
}

function MusicProfileView({
  profile,
  interactiveData,
  reducedMotion,
}: {
  profile: AgentProfile;
  interactiveData: LyriaInteractiveProfile | null;
  reducedMotion: boolean;
}) {
  const mp = profile.music_profile!;
  const hasInteractive = Boolean(interactiveData?.representativeRun);
  const bpmSectionIndex = hasInteractive ? 4 : 3;
  const keySectionIndex = hasInteractive ? 5 : 4;
  const genreSectionIndex = hasInteractive ? 6 : 5;
  const moodSectionIndex = hasInteractive ? 7 : 6;
  const instrumentSectionIndex = hasInteractive ? 8 : 7;
  const culturalOriginSectionIndex = hasInteractive ? 9 : 8;
  const audioCharacteristicsSectionIndex = hasInteractive ? 10 : 9;

  return (
    <div className="space-y-6">
      {hasInteractive ? (
        <Section
          title="Hear the Default"
          index={3}
          reducedMotion={reducedMotion}
        >
          <LyriaDefaultAudioCard
            key={interactiveData!.representativeRun.fileId}
            data={interactiveData!}
          />
        </Section>
      ) : null}

      <Section
        title="BPM Analysis"
        index={bpmSectionIndex}
        reducedMotion={reducedMotion}
      >
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
          index={keySectionIndex}
          reducedMotion={reducedMotion}
        >
          <TastePieChart data={mp.keys} />
        </Section>
        <Section
          title="Genre Distribution"
          index={genreSectionIndex}
          reducedMotion={reducedMotion}
        >
          <HorizontalBarChart data={mp.genres} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section
          title="Mood Defaults"
          index={moodSectionIndex}
          reducedMotion={reducedMotion}
        >
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
          index={instrumentSectionIndex}
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
          index={culturalOriginSectionIndex}
          reducedMotion={reducedMotion}
        >
          <HorizontalBarChart data={mp.cultural_origins} />
        </Section>

        <Section
          title="Audio Characteristics"
          index={audioCharacteristicsSectionIndex}
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

export function formatProfileDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

type ProfileTab = "report" | "artifacts";

const tabButtonClass = (active: boolean) =>
  `px-4 py-2 text-sm transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
    active
      ? "border-primary font-medium text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground"
  }`;

export function ProfileReport({
  profile,
  interactiveData,
  backLabel,
  footerNote,
}: {
  profile: AgentProfile;
  interactiveData?: LyriaInteractiveProfile | null;
  backLabel: string;
  footerNote: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const [artifacts, setArtifacts] = useState<ArtifactEntry[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("report");

  const isWebsite = profile.probe_type === "website";

  useEffect(() => {
    if (!isWebsite) return;
    fetch(`/api/artifacts/${profile.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setArtifacts)
      .catch(() => {});
  }, [profile.id, isWebsite]);

  // Sample thumbnails for hero
  const sampleArtifacts = (() => {
    if (artifacts.length === 0) return [];
    const step = Math.max(1, Math.floor(artifacts.length / 6));
    return Array.from(
      { length: Math.min(6, artifacts.length) },
      (_, i) => artifacts[i * step] ?? artifacts[i],
    ).filter(Boolean);
  })();

  return (
    <>
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
            <span className="ml-2">/ {backLabel}</span>
          </Link>
        </motion.div>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-8">
          <motion.div
            className="shrink-0"
            initial={reducedMotion ? false : "hidden"}
            animate={reducedMotion ? undefined : "visible"}
            variants={fadeUp}
            custom={1}
          >
            <h1 className="text-pretty font-serif text-4xl tracking-tight text-foreground">
              {profile.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground sm:text-sm">
              <span>{profile.model}</span>
              <span>·</span>
              <span>{profile.probe_count} probes</span>
              <span>·</span>
              <span>{formatProfileDate(profile.date)}</span>
            </div>
          </motion.div>

          {sampleArtifacts.length > 0 && (
            <motion.div
              className="min-w-0 flex-1"
              initial={reducedMotion ? false : "hidden"}
              animate={reducedMotion ? undefined : "visible"}
              variants={fadeUp}
              custom={2}
            >
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {sampleArtifacts.map((a) => (
                  <div
                    key={a.id}
                    className="shrink-0 overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="relative h-[68px] w-[90px] overflow-hidden">
                      <iframe
                        src={`/artifacts/${profile.id}/${a.id}.html`}
                        sandbox="allow-scripts"
                        loading="lazy"
                        title={`Artifact ${a.run_index}`}
                        className="pointer-events-none h-[600px] w-[800px] origin-top-left"
                        style={{ transform: "scale(0.1125)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-6 border-b border-border" />
      </section>

      {/* Tabbed layout for website profiles */}
      {isWebsite ? (
        <div>
          {/* Top tabs */}
          <nav className="mb-6 flex gap-1 border-b border-border" role="tablist" aria-label="Profile sections">
            <button
              role="tab"
              id="tab-report"
              aria-selected={activeTab === "report"}
              aria-controls="tabpanel-report"
              onClick={() => setActiveTab("report")}
              className={tabButtonClass(activeTab === "report")}
            >
              Report
            </button>
            <button
              role="tab"
              id="tab-artifacts"
              aria-selected={activeTab === "artifacts"}
              aria-controls="tabpanel-artifacts"
              onClick={() => setActiveTab("artifacts")}
              className={tabButtonClass(activeTab === "artifacts")}
            >
              Artifacts
              {artifacts.length > 0 && (
                <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                  {artifacts.length}
                </span>
              )}
            </button>
          </nav>

          {/* Tab content */}
          <div>
            {activeTab === "report" && (
              <div role="tabpanel" id="tabpanel-report" aria-labelledby="tab-report">
                <WebsiteProfileView
                  profile={profile}
                  reducedMotion={reducedMotion}
                  artifacts={artifacts}
                />
                <motion.div
                  initial={reducedMotion ? false : "hidden"}
                  animate={reducedMotion ? undefined : "visible"}
                  variants={fadeUp}
                  custom={10}
                  className="mt-8"
                >
                  <div className={sectionClass}>
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h2 className={labelClass}>Neutral Prompt</h2>
                      <CopyButton text={profile.correction_prompt} />
                    </div>
                    <div className="rounded-xl border border-border bg-muted/60 p-4">
                      <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                        {profile.correction_prompt}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "artifacts" && (
              <div role="tabpanel" id="tabpanel-artifacts" aria-labelledby="tab-artifacts">
                <ArtifactsGrid artifacts={artifacts} agentId={profile.id} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {profile.music_profile && (
            <MusicProfileView
              profile={profile}
              interactiveData={interactiveData ?? null}
              reducedMotion={reducedMotion}
            />
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
                <h2 className={labelClass}>Neutral Prompt</h2>
                <CopyButton text={profile.correction_prompt} />
              </div>
              <div className="rounded-xl border border-border bg-muted/60 p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                  {profile.correction_prompt}
                </pre>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <footer className="mt-10 border-t border-border pt-6">
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className={`transition-colors hover:text-primary ${focusRingClass}`}
          >
            <span className="font-serif text-foreground">Default</span>
            <span className="font-serif text-primary">Taste</span>
          </Link>
          <span>{footerNote}</span>
        </div>
      </footer>
    </>
  );
}

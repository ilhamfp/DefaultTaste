"use client";

import Link from "next/link";
import type { ArtifactEntry } from "@/lib/types";

type ReportCard = {
  id: string;
  title: string;
  subtitle: string;
  edition: string;
  href: string;
  comingSoon?: boolean;
  accentColor: string;
  spineColor: string;
  artifacts?: { agentId: string; entry: ArtifactEntry }[];
};

type ReportCarouselProps = {
  geminiArtifacts: { agentId: string; entries: ArtifactEntry[] }[];
};

export function ReportCarousel({ geminiArtifacts }: ReportCarouselProps) {
  const geminiPreviews = geminiArtifacts
    .map((m) => {
      const entry = m.entries[Math.floor(Math.random() * m.entries.length)];
      return entry ? { agentId: m.agentId, entry } : null;
    })
    .filter(Boolean) as { agentId: string; entry: ArtifactEntry }[];

  const reports: ReportCard[] = [
    {
      id: "gemini",
      title: "Gemini",
      subtitle: "How Gemini Learned to Feel",
      edition: "3 generations / 293 probes",
      href: "/visual-report",
      accentColor: "#00786F",
      spineColor: "#00786F",
      artifacts: geminiPreviews,
    },
    {
      id: "claude",
      title: "Claude",
      subtitle: "From Careful to Creative",
      edition: "Haiku to Opus",
      href: "#",
      comingSoon: true,
      accentColor: "#D97706",
      spineColor: "#B45309",
    },
    {
      id: "big-three",
      title: "The Big Three",
      subtitle: "Claude vs Gemini vs GPT",
      edition: "Cross-model comparison",
      href: "#",
      comingSoon: true,
      accentColor: "#6366F1",
      spineColor: "#4F46E5",
    },
  ];

  return (
    <div className="flex flex-wrap items-start justify-center gap-5 px-4 py-4 sm:gap-6 sm:px-6">
      {reports.map((report) => (
        <BookCover key={report.id} report={report} />
      ))}
    </div>
  );
}

function BookCover({ report }: { report: ReportCard }) {
  const inner = (
    <div
      className={`group relative flex h-[13rem] w-[9.5rem] shrink-0 flex-col overflow-hidden rounded-sm shadow-md transition-all sm:h-[15rem] sm:w-[10.5rem] ${
        report.comingSoon
          ? "cursor-default grayscale"
          : "hover:-translate-y-1 hover:shadow-xl"
      }`}
    >
      {/* Spine edge */}
      <div
        className="absolute inset-y-0 left-0 w-[5px]"
        style={{ backgroundColor: report.comingSoon ? "#9CA3AF" : report.spineColor }}
      />

      {/* Cover background */}
      <div className="absolute inset-0 bg-[#FAF9F7]" />

      {/* Top accent band */}
      <div
        className="relative h-[4px] w-full"
        style={{ backgroundColor: report.comingSoon ? "#D1D5DB" : report.accentColor }}
      />

      {/* Artifact mosaic or placeholder pattern */}
      <div className="relative mx-3 mt-3 flex h-[4.5rem] overflow-hidden rounded-[3px] border border-border/60 bg-muted/40 sm:mx-4 sm:mt-4 sm:h-[5rem]">
        {report.artifacts && report.artifacts.length > 0 ? (
          report.artifacts.map((a, i) => (
            <div
              key={a.agentId}
              className="relative flex-1 overflow-hidden border-r border-border/40 last:border-r-0"
            >
              <iframe
                src={`/artifacts/${a.agentId}/${a.entry.id}.html`}
                sandbox="allow-scripts"
                loading="lazy"
                title={`${report.title} preview ${i}`}
                className="pointer-events-none absolute left-0 top-0 h-[600px] w-[800px] origin-top-left"
                style={{ transform: "scale(0.044)" }}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-1.5 opacity-30">
              <div
                className="h-5 w-5 rounded-full"
                style={{ backgroundColor: report.accentColor }}
              />
              <div className="h-px w-8 bg-current text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Typography block */}
      <div className="relative flex flex-1 flex-col justify-between px-3 pb-3 pt-2 sm:px-4 sm:pb-3 sm:pt-2.5">
        <div>
          <h3 className="font-serif text-sm leading-tight tracking-tight text-foreground sm:text-base">
            {report.title}
          </h3>
          <p className="mt-0.5 text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
            {report.subtitle}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div
              className="mb-1 h-px w-6"
              style={{ backgroundColor: report.comingSoon ? "#D1D5DB" : report.accentColor }}
            />
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground sm:text-[9px]">
              {report.edition}
            </p>
          </div>

          {report.comingSoon && (
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-wider text-muted-foreground sm:text-[8px]">
              Soon
            </span>
          )}
        </div>
      </div>

      {/* Subtle page edge effect on right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-border/20 via-border/40 to-border/20" />
      <div className="pointer-events-none absolute inset-y-0 right-[1px] w-px bg-white/60" />
    </div>
  );

  if (report.comingSoon) {
    return <div className="opacity-50">{inner}</div>;
  }

  return (
    <Link
      href={report.href}
      className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {inner}
    </Link>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/site/marketing-shell";
import { VisualReportCarousel } from "@/components/home/visual-report-carousel";

export const metadata: Metadata = {
  title: "Visual Reports | DefaultTaste",
  description:
    "Deep visual studies of how AI models express default taste.",
};

const reports = [
  {
    id: "gemini-evolution",
    title: "Gemini Evolution",
    description:
      "How Gemini's default aesthetic evolved across three model generations. Same prompt, three eras of taste.",
    href: "/visual-reports/gemini-evolution",
    available: true,
    color: "#00786F",
  },
  {
    id: "claude-evolution",
    title: "Claude Evolution",
    description:
      "Tracing Claude's aesthetic defaults from Haiku to Opus — how its visual taste shifts across capability tiers.",
    href: "#",
    available: false,
    color: "#E54F10",
  },
  {
    id: "the-big-three",
    title: "The Big Three",
    description:
      "OpenAI vs Claude vs Gemini — a side-by-side comparison of how the leading models express visual taste.",
    href: "#",
    available: false,
    color: "#0C0C09",
  },
];

export default function VisualReportsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Visual Reports
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Deep visual studies of how AI models express default taste. Each
            report probes a model hundreds of times and maps the aesthetic
            patterns that emerge.
          </p>
        </header>

        {/* Carousel showcase */}
        <div className="mb-16">
          <VisualReportCarousel />
        </div>

        {/* Clean list */}
        <div>
          <h2 className="mb-6 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            All reports
          </h2>
          <div className="divide-y divide-border border-t border-border">
            {reports.map((report) => {
              const content = (
                <div className="flex items-start gap-4 py-6">
                  <div
                    className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: report.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg text-foreground">
                        {report.title}
                      </h3>
                      {!report.available && (
                        <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {report.description}
                    </p>
                    {report.available && (
                      <span className="mt-2 inline-block font-mono text-xs text-primary">
                        View report →
                      </span>
                    )}
                  </div>
                </div>
              );

              return report.available ? (
                <Link
                  key={report.id}
                  href={report.href}
                  className="block rounded-lg transition-colors hover:bg-muted/40"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={report.id}
                  className="cursor-default opacity-50"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

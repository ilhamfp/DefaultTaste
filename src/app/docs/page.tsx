import type { Metadata } from "next";
import Link from "next/link";
import { AgentSummaryCard } from "@/components/site/agent-summary-card";
import { MarketingShell } from "@/components/site/marketing-shell";
import { getHomepageAgentSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Documentation | DefaultTaste",
  description:
    "How DefaultTaste works, what it measures, and how the current demo flow is staged.",
};

const websiteDimensions = [
  "framework choices",
  "CSS systems",
  "color defaults",
  "font defaults",
  "layout patterns",
  "dark-mode bias",
];

const musicDimensions = [
  "tempo and BPM ranges",
  "key signature bias",
  "genre defaults",
  "mood patterns",
  "instrument choices",
  "cultural origin bias",
];

const probingSteps = [
  {
    title: "Probe repeatedly",
    copy: "We run the same agent across many prompts so one lucky output does not define the profile.",
  },
  {
    title: "Aggregate the patterns",
    copy: "We count recurring defaults across colors, fonts, layouts, genres, moods, and other dimensions.",
  },
  {
    title: "Return a correction prompt",
    copy: "The final profile turns those defaults into an explicit prompt you can use to push the agent somewhere less generic.",
  },
];

export default async function DocsPage() {
  const agents = await getHomepageAgentSummaries();

  return (
    <MarketingShell current="docs">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <section className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Documentation
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
            DefaultTaste turns repeated generations into a readable taste
            profile.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            The product is simple on purpose: point to an agent, run it enough
            times to expose its defaults, then turn those defaults into a
            profile and a correction prompt. In this hackathon build, the
            showcase profiles are published examples and the custom URL flow is
            a staged demo of that pipeline.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              How to use it
            </p>
            <ol className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">1.</span> Paste an
                agent server URL into the homepage form.
              </li>
              <li>
                <span className="font-medium text-foreground">2.</span> Choose
                the medium and probe depth on the setup page.
              </li>
              <li>
                <span className="font-medium text-foreground">3.</span> Follow
                the permanent run URL as DefaultTaste walks through a simulated
                validate, probe, analyze, aggregate, and correction flow.
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              What is available today
            </p>
            <p className="mt-4 text-base leading-7 text-foreground">
              The showcase profiles are available now. Custom URL submissions
              currently run as a guided demo walkthrough.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The demo uses pre-generated artifacts and deterministic logic to
              show the intended pipeline. The future integration targets are
              Gemini-style HTTPS endpoints for website probes and Lyria-style
              live endpoints for music probes. Protected endpoints and custom
              auth are out of scope for this demo pass.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            What a taste profile contains
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-7">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Websites
              </p>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {websiteDimensions.map((dimension) => (
                  <li key={dimension} className="flex gap-3">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{dimension}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-7">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Music
              </p>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {musicDimensions.map((dimension) => (
                  <li key={dimension} className="flex gap-3">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{dimension}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Supported agents
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground">
                Explore the showcase profiles
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              These are the agents already probed in the product. Click any card
              to open the full taste profile.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {agents.map((agent) => (
              <AgentSummaryCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            How probing works
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {probingSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-xl border border-border bg-card p-7"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Step {index + 1}
                </p>
                <h3 className="mt-3 font-serif text-2xl tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-border bg-card p-8">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            Want the full story?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            The docs explain the product and the demo run flow. The About page
            explains why it matters, why Gemini made it possible, and how the
            hackathon build stages the idea today.
          </p>
          <div className="mt-6">
            <Link
              href="/about"
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Read the pitch
            </Link>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}

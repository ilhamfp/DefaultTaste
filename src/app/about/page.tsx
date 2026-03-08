import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/site/marketing-shell";

export const metadata: Metadata = {
  title: "About | DefaultTaste",
  description:
    "Why DefaultTaste matters, how Gemini powers it, and why this project should win.",
};

const reasonsToWin = [
  {
    title: "It uses Gemini differently",
    copy: "Most tools ask a model for one polished output. DefaultTaste uses Gemini as an instrument for measuring generative bias across many outputs.",
  },
  {
    title: "It turns sameness into something useful",
    copy: "The result is not just a chart. It is a practical correction prompt creators can use to steer an agent away from its defaults.",
  },
  {
    title: "It is natively multimodal",
    copy: "The same product can profile website taste and music taste, proving the idea extends across different creative media.",
  },
];

const geminiStack = [
  {
    title: "Gemini 2.5 Flash",
    copy: "Drives the website probing loop so we can repeatedly generate, compare, and categorize visual defaults across many runs.",
  },
  {
    title: "Lyria RealTime",
    copy: "Lets us probe musical defaults the same way, capturing recurring tempo, genre, key, mood, and instrumentation choices.",
  },
  {
    title: "One coherent product story",
    copy: "Because these capabilities live in the Gemini ecosystem, the product can analyze taste across media instead of stopping at a single format.",
  },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <section className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            About
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            DefaultTaste exposes the creative defaults AI keeps repeating when
            nobody is steering it.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            DefaultTaste is a product that uses repeated generation to turn
            vague model sameness into a profile, then turns that profile into
            creative leverage.
          </p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-xl border border-border bg-card p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              The problem
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground">
              AI often looks original once, then predictable at scale.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Ask the same agent to make websites 100 times and you start
                seeing the same colors, fonts, layouts, and libraries. Do the
                same with music and you get the same tempos, genres, keys, and
                moods.
              </p>
              <p>
                That repetition is hard to spot in one output, but obvious once
                the outputs are collected together. We think that hidden default
                is one of the most important things to understand about a model.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              The transformation
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground">
              DefaultTaste turns repetition into an explorable profile.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                We probe an agent repeatedly, aggregate the patterns, and map
                the defaults it keeps falling back to.
              </p>
              <p>
                The output is simple to understand and immediately useful: a
                taste profile that shows what the model prefers, plus a
                correction prompt that helps creators push beyond those
                defaults.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            Why Gemini matters
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            This project works because Gemini is not just one model endpoint. It
            gives us a credible way to study taste across different creative
            media inside one product instead of stitching together unrelated
            systems.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {geminiStack.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-7"
              >
                <h3 className="font-serif text-2xl tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-border bg-card p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Why this should win
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground">
            This is not another generator. It is a way to understand generators.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {reasonsToWin.map((reason) => (
              <div
                key={reason.title}
                className="rounded-xl border border-border bg-muted/40 p-6"
              >
                <h3 className="font-serif text-2xl tracking-tight text-foreground">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {reason.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-xl border border-border bg-card p-8">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            Explore the product
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Start at the homepage to run a probe, or inspect the showcase
            profiles and docs.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Go to homepage
            </Link>
            <Link
              href="/docs"
              className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Read the docs
            </Link>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}

import type { Metadata } from "next";
import { AgentCarousel } from "@/components/home/agent-carousel";
import { ProbeUrlForm } from "@/components/home/probe-url-form";
import { BrandLockup } from "@/components/site/brand-lockup";
import { MarketingShell } from "@/components/site/marketing-shell";
import { getHomepageAgentSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "DefaultTaste",
  description:
    "Try the demo probe flow and preview the taste profile DefaultTaste would map.",
};

export default async function Home() {
  const agents = await getHomepageAgentSummaries();

  return (
    <MarketingShell
      compactHeader
      backgroundVariant="home"
      mainClassName="px-4 sm:px-6 lg:h-[calc(100svh-3.5rem)]"
    >
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-5 sm:gap-8 sm:py-6 lg:h-full lg:gap-3 lg:py-4">
        <div className="flex flex-1 items-center justify-center lg:min-h-0">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <BrandLockup
              centered
              tone="hero"
              markClassName="size-12 drop-shadow-[0_14px_28px_rgba(0,120,111,0.12)] sm:size-14"
              wordmarkClassName="text-[2.35rem] sm:text-[3rem]"
            />

            <h1 className="mt-5 max-w-4xl font-serif text-[2rem] leading-[1.02] tracking-tight text-foreground text-pretty sm:text-[2.75rem] lg:text-[3rem]">
              <span className="block">Point us at an agent.</span>
              <span className="mt-1.5 block italic text-foreground/80">
                Preview the taste it tends to echo.
              </span>
            </h1>

            <div className="mt-5 w-full">
              <ProbeUrlForm />
            </div>
          </div>
        </div>

        <div className="shrink-0 pb-1 lg:pb-0">
          <div className="mb-2 flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-border sm:w-16" />
            <h2 className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Already probed
            </h2>
            <div className="h-px w-10 bg-border sm:w-16" />
          </div>

          <AgentCarousel agents={agents} />
        </div>
      </section>
    </MarketingShell>
  );
}

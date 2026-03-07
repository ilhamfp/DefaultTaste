import type { Metadata } from "next";
import { AgentCarousel } from "@/components/home/agent-carousel";
import { ProbeUrlForm } from "@/components/home/probe-url-form";
import { BrandLockup } from "@/components/site/brand-lockup";
import { MarketingShell } from "@/components/site/marketing-shell";
import { getHomepageAgentSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "DefaultTaste",
  description:
    "Set up the DefaultTaste demo and reveal the taste an agent defaults to.",
};

export default async function Home() {
  const agents = await getHomepageAgentSummaries();

  return (
    <MarketingShell
      compactHeader
      backgroundVariant="home"
      mainClassName="px-4 sm:px-6 lg:h-[calc(100svh-3.5rem)]"
    >
      <section className="mx-auto flex w-full max-w-6xl flex-col py-6 sm:py-8 lg:h-full lg:justify-between lg:py-5">
        <div className="flex flex-1 items-center justify-center py-4 lg:min-h-0 lg:py-7">
          <div className="mx-auto flex w-full max-w-[44rem] flex-col items-center gap-6 text-center sm:gap-7 lg:-translate-y-3 lg:gap-8">
            <BrandLockup
              centered
              tone="hero"
              markClassName="size-[3.25rem] drop-shadow-[0_14px_28px_rgba(0,120,111,0.12)] sm:size-[3.75rem]"
              wordmarkClassName="text-[2.45rem] sm:text-[3.1rem]"
            />

            <h1 className="max-w-[38rem] font-serif text-[1.9rem] leading-[1.04] tracking-tight text-foreground text-pretty sm:text-[2.45rem] lg:text-[2.7rem]">
              <span className="block">Point us at an agent.</span>
              <span className="mt-2 block italic text-foreground/78">
                Reveal the taste it defaults to.
              </span>
            </h1>

            <div className="w-full">
              <ProbeUrlForm />
            </div>
          </div>
        </div>

        <div className="shrink-0 lg:pb-1">
          <div className="mb-3 flex items-center justify-center gap-3">
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

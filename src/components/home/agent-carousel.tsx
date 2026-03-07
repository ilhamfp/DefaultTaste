"use client";

import { useReducedMotion } from "framer-motion";
import type { AgentSummary } from "@/lib/types";
import { AgentSummaryCard } from "@/components/site/agent-summary-card";

type AgentCarouselProps = {
  agents: AgentSummary[];
};

export function AgentCarousel({ agents }: AgentCarouselProps) {
  const reducedMotion = useReducedMotion() ?? false;

  if (agents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
        No probed agents available yet.
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        <div className="flex w-max gap-3">
          {agents.map((agent) => (
            <AgentSummaryCard
              key={agent.id}
              agent={agent}
              density="compact"
              className="w-[16rem] shrink-0 sm:w-[17rem]"
            />
          ))}
        </div>
      </div>
    );
  }

  const repeatCount = Math.max(2, Math.ceil(8 / agents.length));
  const marqueeAgents = Array.from({ length: repeatCount }, (_, repeatIndex) =>
    agents.map((agent) => ({
      key: `${agent.id}-${repeatIndex}`,
      agent,
    })),
  ).flat();

  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((sequence) => (
          <div
            key={sequence}
            aria-hidden={sequence === 1}
            className="flex shrink-0 gap-3 pr-3"
          >
            {marqueeAgents.map(({ agent, key }) => (
              <AgentSummaryCard
                key={`${key}-sequence-${sequence}`}
                agent={agent}
                density="compact"
                className="w-[14rem] shrink-0 sm:w-[14.5rem]"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

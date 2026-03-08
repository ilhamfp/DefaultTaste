import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AgentSummary } from "@/lib/types";

type AgentSummaryCardProps = {
  agent: AgentSummary;
  className?: string;
  density?: "default" | "compact";
};

export function AgentSummaryCard({
  agent,
  className,
  density = "default",
}: AgentSummaryCardProps) {
  const isCompact = density === "compact";

  return (
    <Link
      href={`/agent/${agent.id}`}
      className={cn(
        "group block border border-border bg-card transition-[transform,border-color,box-shadow] hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isCompact
          ? "rounded-xl bg-card/94 p-3.5 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(12,12,9,0.06)]"
          : "rounded-xl p-5",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-start justify-between",
          isCompact ? "gap-3" : "gap-4",
        )}
      >
        <div className="min-w-0">
          <p
            className={cn(
              "uppercase text-muted-foreground",
              isCompact
                ? "text-[10px] tracking-[0.2em]"
                : "text-[11px] tracking-[0.24em]",
            )}
          >
            {agent.probeTypeLabel}
          </p>
          <h3
            className={cn(
              "font-serif tracking-tight text-foreground",
              isCompact ? "mt-1.5 text-lg leading-tight" : "mt-3 text-2xl",
            )}
          >
            {agent.name}
          </h3>
          <p
            className={cn(
              "truncate font-mono text-muted-foreground",
              isCompact ? "mt-1 text-[10px]" : "mt-2 text-xs",
            )}
          >
            {agent.model}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full bg-primary/10 font-medium text-primary",
            isCompact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
          )}
        >
          {agent.probeCount} probes
        </span>
      </div>

      {isCompact ? (
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {agent.keyStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-muted/70 px-2 py-1.5"
            >
              <dt className="truncate text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-0.5 truncate text-[11px] font-medium text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="mt-5 space-y-3 border-t border-border pt-4">
          {agent.keyStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <dt className="text-muted-foreground">{stat.label}</dt>
              <dd className="max-w-[10rem] truncate text-right font-medium text-foreground">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Link>
  );
}

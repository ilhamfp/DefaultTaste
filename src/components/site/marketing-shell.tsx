import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";

type MarketingShellProps = {
  children: ReactNode;
  current?: "visual-reports" | "intro";
  mainClassName?: string;
  compactHeader?: boolean;
  backgroundVariant?: "default" | "home";
};

export function MarketingShell({
  children,
  current,
  mainClassName,
  compactHeader = false,
  backgroundVariant = "default",
}: MarketingShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          backgroundVariant === "home"
            ? "bg-[radial-gradient(circle_at_50%_6%,rgba(0,120,111,0.24),transparent_28%),radial-gradient(circle_at_50%_20%,rgba(0,120,111,0.14),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(0,120,111,0.08),transparent_34%)]"
            : "bg-[radial-gradient(circle_at_top,_rgba(0,120,111,0.12),_transparent_48%),radial-gradient(circle_at_bottom,_rgba(0,120,111,0.08),_transparent_42%)]",
        )}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader current={current} compact={compactHeader} />
        <main id="main-content" className={cn("flex-1", mainClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}

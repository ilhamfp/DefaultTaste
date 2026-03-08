import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandLockup } from "./brand-lockup";

type SiteHeaderProps = {
  current?: "visual-reports" | "intro";
  compact?: boolean;
};

const navItems = [
  { href: "/visual-reports", label: "Visual Reports", key: "visual-reports" },
  { href: "/intro", label: "Tweets", key: "intro" },
] as const;

export function SiteHeader({ current, compact = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6",
          compact ? "h-14" : "h-16",
        )}
      >
        <BrandLockup
          href="/"
          markClassName={compact ? "size-8" : "size-9"}
          wordmarkClassName={compact ? "text-lg" : "text-xl"}
        />

        <nav
          aria-label="Primary"
          className={cn(
            "flex items-center",
            compact ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3",
          )}
        >
          {navItems.map((item) => {
            const isCurrent = current === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "rounded-full text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  compact ? "px-3 py-1.5" : "px-3 py-2",
                  isCurrent && "bg-muted/70 text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

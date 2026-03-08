import Link from "next/link";
import { cn } from "@/lib/utils";
import { BrandLockup } from "./brand-lockup";

type SiteHeaderProps = {
  current?: "visual-reports" | "intro";
};

const navItems = [
  { href: "/visual-reports", label: "Visual Reports", key: "visual-reports" },
  { href: "/intro", label: "Tweets", key: "intro" },
] as const;

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLockup
          href="/"
          markClassName="size-8"
          wordmarkClassName="text-lg"
        />

        <nav
          aria-label="Primary"
          className="flex items-center gap-1.5 sm:gap-2"
        >
          {navItems.map((item) => {
            const isCurrent = current === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-full px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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

import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandTone = "default" | "hero";

function BrandMark({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: BrandTone;
}) {
  const neutralFill =
    tone === "hero" ? "rgb(255 255 255 / 0.74)" : "var(--muted)";
  const outlineStroke =
    tone === "hero" ? "rgb(12 12 9 / 0.36)" : "var(--muted-foreground)";

  return (
    <svg
      viewBox="0 0 120 120"
      width="120"
      height="120"
      aria-hidden="true"
      className={cn("size-10 shrink-0", className)}
    >
      <rect x="15" y="15" width="36" height="36" rx="6" fill={neutralFill} />
      <rect x="57" y="15" width="36" height="36" rx="6" fill={neutralFill} />
      <rect x="15" y="57" width="36" height="36" rx="6" fill={neutralFill} />
      <rect
        x="57"
        y="57"
        width="36"
        height="36"
        rx="6"
        fill="none"
        stroke={outlineStroke}
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <rect
        x="67"
        y="67"
        width="36"
        height="36"
        rx="6"
        fill="var(--primary)"
        transform="rotate(-7 85 85)"
      />
    </svg>
  );
}

type BrandLockupProps = {
  href?: string;
  centered?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  tone?: BrandTone;
};

export function BrandLockup({
  href,
  centered = false,
  className,
  markClassName,
  wordmarkClassName,
  tone = "default",
}: BrandLockupProps) {
  const content = (
    <>
      <BrandMark className={markClassName} tone={tone} />
      <span
        className={cn(
          "font-serif tracking-tight text-foreground",
          centered ? "text-4xl sm:text-5xl" : "text-lg",
          wordmarkClassName,
        )}
      >
        Default<span className="text-primary">Taste</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          centered && "flex-col gap-4",
          className,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3",
        centered && "flex-col gap-4",
        className,
      )}
    >
      {content}
    </div>
  );
}

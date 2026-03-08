"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { BrandLockup } from "@/components/site/brand-lockup";
import { cn } from "@/lib/utils";

type ViewportSize = {
  width: number;
  height: number;
  isCompact: boolean;
};

type CardDimensions = {
  width: number;
  height: number;
};

type LayoutPoint = {
  xRatio: number;
  yRatio: number;
};

type SizeTier = "wideHero" | "wide" | "tall" | "tallHero";

type AnchorId =
  | "northWest"
  | "north"
  | "northEast"
  | "west"
  | "eastUpper"
  | "southWest"
  | "southEast";

type IntroTweetCard = {
  id: string;
  href?: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  sizeTier: SizeTier;
  anchorId: AnchorId;
  seed: number;
};

type DriftProfile = {
  directionX: 1 | -1;
  directionY: 1 | -1;
  orbitX: number;
  orbitY: number;
  rotateAmplitude: number;
  primaryFrequency: number;
  secondaryFrequency: number;
  tertiaryFrequency: number;
  phase: number;
  secondaryPhase: number;
  tertiaryPhase: number;
};

const SIZE_TIER_CLASSES: Record<SizeTier, string> = {
  wideHero:
    "w-[14.4rem] sm:w-[16.75rem] md:w-[19.5rem] lg:w-[23rem] xl:w-[25.25rem]",
  wide: "w-[12.75rem] sm:w-[14.4rem] md:w-[17rem] lg:w-[19.75rem] xl:w-[21.75rem]",
  tall: "w-[10rem] sm:w-[11.25rem] md:w-[13rem] lg:w-[14.75rem] xl:w-[16rem]",
  tallHero:
    "w-[11rem] sm:w-[12.4rem] md:w-[14.1rem] lg:w-[15.8rem] xl:w-[17.25rem]",
};

const SIZE_TIER_ORBIT: Record<
  SizeTier,
  { x: number; y: number; rotate: number }
> = {
  wideHero: { x: 28, y: 16, rotate: 0.85 },
  wide: { x: 24, y: 15, rotate: 0.8 },
  tall: { x: 15, y: 24, rotate: 1.05 },
  tallHero: { x: 17, y: 27, rotate: 1.15 },
};

const RING_ANCHORS: Record<
  AnchorId,
  { desktop: LayoutPoint; compact: LayoutPoint }
> = {
  northWest: {
    desktop: { xRatio: 0.2, yRatio: 0.2 },
    compact: { xRatio: 0.2, yRatio: 0.21 },
  },
  north: {
    desktop: { xRatio: 0.5, yRatio: 0.17 },
    compact: { xRatio: 0.5, yRatio: 0.18 },
  },
  northEast: {
    desktop: { xRatio: 0.81, yRatio: 0.21 },
    compact: { xRatio: 0.8, yRatio: 0.22 },
  },
  west: {
    desktop: { xRatio: 0.14, yRatio: 0.49 },
    compact: { xRatio: 0.14, yRatio: 0.45 },
  },
  eastUpper: {
    desktop: { xRatio: 0.84, yRatio: 0.36 },
    compact: { xRatio: 0.82, yRatio: 0.31 },
  },
  southWest: {
    desktop: { xRatio: 0.22, yRatio: 0.77 },
    compact: { xRatio: 0.21, yRatio: 0.73 },
  },
  southEast: {
    desktop: { xRatio: 0.78, yRatio: 0.73 },
    compact: { xRatio: 0.77, yRatio: 0.68 },
  },
};

const introTweets: IntroTweetCard[] = [
  {
    id: "gdb",
    href: "https://x.com/gdb/status/2023481258639286401?s=20",
    src: "/intro/tweets/gdb-2023481258639286401.png",
    alt: "Screenshot of an X post by @gdb.",
    width: 1194,
    height: 378,
    sizeTier: "wideHero",
    anchorId: "northWest",
    seed: 18,
  },
  {
    id: "yuchen-top",
    href: "https://x.com/Yuchenj_UW/status/2023481799335440792?s=20",
    src: "/intro/tweets/yuchenj-2023481799335440792.png",
    alt: "Screenshot of an X post by @Yuchenj_UW.",
    width: 1196,
    height: 1378,
    sizeTier: "tallHero",
    anchorId: "north",
    seed: 27,
  },
  {
    id: "yuchen-bottom",
    href: "https://x.com/Yuchenj_UW/status/2023519066825339364?s=20",
    src: "/intro/tweets/yuchenj-2023519066825339364.png",
    alt: "Screenshot of another X post by @Yuchenj_UW.",
    width: 1202,
    height: 936,
    sizeTier: "wide",
    anchorId: "southEast",
    seed: 34,
  },
  {
    id: "paulg",
    href: "https://x.com/paulg/status/2022604692178522562?s=20",
    src: "/intro/tweets/paulg-2022604692178522562.png",
    alt: "Screenshot of an X post by @paulg.",
    width: 1200,
    height: 562,
    sizeTier: "wideHero",
    anchorId: "southWest",
    seed: 41,
  },
  {
    id: "netcapgirl",
    href: "https://x.com/netcapgirl/status/2024140332963705342?s=20",
    src: "/intro/tweets/netcapgirl-2024140332963705342.png",
    alt: "Screenshot of an X post by @netcapgirl.",
    width: 1196,
    height: 1524,
    sizeTier: "tall",
    anchorId: "west",
    seed: 56,
  },
  {
    id: "extra-wide",
    src: "/intro/tweets/Screenshot%202026-03-07%20at%203.52.10%E2%80%AFPM.png",
    alt: "Screenshot of an additional X post.",
    width: 1194,
    height: 430,
    sizeTier: "wide",
    anchorId: "northEast",
    seed: 63,
  },
  {
    id: "extra-tall",
    src: "/intro/tweets/Screenshot%202026-03-07%20at%203.52.38%E2%80%AFPM.png",
    alt: "Screenshot of another additional X post.",
    width: 1194,
    height: 1062,
    sizeTier: "tallHero",
    anchorId: "eastUpper",
    seed: 72,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return function nextRandom() {
    value += 0x6d2b79f5;

    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveAnchorPoint(
  anchorId: AnchorId,
  isCompact: boolean,
): LayoutPoint {
  return isCompact ? RING_ANCHORS[anchorId].compact : RING_ANCHORS[anchorId].desktop;
}

function buildDriftProfile(tweet: IntroTweetCard): DriftProfile {
  const random = createSeededRandom(tweet.seed);
  const baseOrbit = SIZE_TIER_ORBIT[tweet.sizeTier];

  return {
    directionX: random() > 0.5 ? 1 : -1,
    directionY: random() > 0.5 ? 1 : -1,
    orbitX: baseOrbit.x * (0.94 + random() * 0.3),
    orbitY: baseOrbit.y * (0.92 + random() * 0.34),
    rotateAmplitude: baseOrbit.rotate * (0.9 + random() * 0.24),
    primaryFrequency: 0.00042 * (0.84 + random() * 0.34),
    secondaryFrequency: 0.00024 * (0.82 + random() * 0.38),
    tertiaryFrequency: 0.00018 * (0.86 + random() * 0.42),
    phase: random() * Math.PI * 2,
    secondaryPhase: random() * Math.PI * 2,
    tertiaryPhase: random() * Math.PI * 2,
  };
}

function useViewportSize(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 0,
    height: 0,
    isCompact: false,
  });

  useEffect(() => {
    function updateViewport() {
      const width = window.innerWidth;

      setViewport({
        width,
        height: window.innerHeight,
        isCompact: width < 1100,
      });
    }

    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return viewport;
}

function FloatingTweetCard({
  tweet,
  reducedMotion,
  viewport,
}: {
  tweet: IntroTweetCard;
  reducedMotion: boolean;
  viewport: ViewportSize;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardSizeRef = useRef<CardDimensions>({
    width: tweet.width / 5,
    height: tweet.height / 5,
  });
  const [drift] = useState(() => buildDriftProfile(tweet));

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  useEffect(() => {
    const element = cardRef.current;

    if (!element) {
      return;
    }

    function updateCardSize() {
      const nextRect = element!.getBoundingClientRect();

      if (nextRect.width > 0 && nextRect.height > 0) {
        cardSizeRef.current = {
          width: nextRect.width,
          height: nextRect.height,
        };
      }
    }

    updateCardSize();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateCardSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!viewport.width || !viewport.height) {
      return;
    }

    const anchorPoint = resolveAnchorPoint(tweet.anchorId, viewport.isCompact);
    const safePadding = viewport.isCompact ? 12 : 20;
    const maxX = viewport.width - cardSizeRef.current.width - safePadding;
    const maxY = viewport.height - cardSizeRef.current.height - safePadding;
    const anchorX =
      viewport.width * anchorPoint.xRatio - cardSizeRef.current.width / 2;
    const anchorY =
      viewport.height * anchorPoint.yRatio - cardSizeRef.current.height / 2;

    x.set(clamp(anchorX, safePadding, maxX));
    y.set(clamp(anchorY, safePadding, maxY));
    rotate.set(0);
  }, [
    rotate,
    tweet.anchorId,
    viewport.height,
    viewport.isCompact,
    viewport.width,
    x,
    y,
  ]);

  useAnimationFrame((time) => {
    if (reducedMotion || !viewport.width || !viewport.height) {
      return;
    }

    const motionScale = viewport.isCompact ? 0.76 : 1;
    const safePadding = viewport.isCompact ? 12 : 20;
    const anchorPoint = resolveAnchorPoint(tweet.anchorId, viewport.isCompact);
    const anchorX =
      viewport.width * anchorPoint.xRatio - cardSizeRef.current.width / 2;
    const anchorY =
      viewport.height * anchorPoint.yRatio - cardSizeRef.current.height / 2;
    const localX =
      Math.sin(time * drift.primaryFrequency + drift.phase) *
        drift.orbitX *
        drift.directionX *
        motionScale +
      Math.cos(time * drift.secondaryFrequency + drift.secondaryPhase) *
        drift.orbitX *
        0.3 *
        motionScale +
      Math.sin(time * drift.tertiaryFrequency + drift.tertiaryPhase) *
        drift.orbitX *
        0.16 *
        -drift.directionY *
        motionScale;
    const localY =
      Math.cos(time * drift.primaryFrequency * 0.94 + drift.phase) *
        drift.orbitY *
        drift.directionY *
        motionScale +
      Math.sin(time * drift.secondaryFrequency * 1.1 + drift.secondaryPhase) *
        drift.orbitY *
        0.26 *
        motionScale +
      Math.cos(time * drift.tertiaryFrequency * 1.18 + drift.tertiaryPhase) *
        drift.orbitY *
        0.14 *
        drift.directionX *
        motionScale;
    const nextX = clamp(
      anchorX + localX,
      safePadding,
      viewport.width - cardSizeRef.current.width - safePadding,
    );
    const nextY = clamp(
      anchorY + localY,
      safePadding,
      viewport.height - cardSizeRef.current.height - safePadding,
    );

    x.set(nextX);
    y.set(nextY);
    rotate.set(
      (Math.sin(time * drift.secondaryFrequency * 0.82 + drift.phase) +
        Math.cos(time * drift.tertiaryFrequency * 0.9 + drift.tertiaryPhase) *
          0.45) *
        drift.rotateAmplitude,
    );
  });

  const cardBody = (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_14px_36px_rgba(12,12,9,0.05)] transition-transform duration-300 group-hover:scale-[1.01]">
      <Image
        src={tweet.src}
        alt={tweet.alt}
        width={tweet.width}
        height={tweet.height}
        priority
        sizes="(max-width: 640px) 51vw, (max-width: 1024px) 36vw, 25vw"
        className="h-auto w-full object-contain"
      />
    </div>
  );

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "absolute left-0 top-0 z-10 will-change-transform",
        SIZE_TIER_CLASSES[tweet.sizeTier],
      )}
      style={{
        x,
        y,
        rotate,
        opacity: viewport.width ? 1 : 0,
      }}
    >
      {tweet.href ? (
        <a
          href={tweet.href}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Open original tweet on X"
        >
          {cardBody}
        </a>
      ) : (
        <div
          onClick={(event) => event.stopPropagation()}
          className="group relative block"
        >
          {cardBody}
        </div>
      )}
    </motion.div>
  );
}

export function IntroScene() {
  const reducedMotion = useReducedMotion() ?? false;
  const viewport = useViewportSize();
  const [isBrandVisible, setIsBrandVisible] = useState(false);

  return (
    <motion.section
      aria-label="DefaultTaste intro presentation"
      role="button"
      tabIndex={0}
      aria-pressed={isBrandVisible}
      onClick={() => setIsBrandVisible((visible) => !visible)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsBrandVisible((visible) => !visible);
        }
      }}
      className="relative isolate flex min-h-screen cursor-pointer items-center justify-center overflow-hidden bg-background px-4 py-6 text-foreground select-none sm:px-6 lg:px-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(0,120,111,0.1),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f7f8f4_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl sm:size-[24rem]"
      />

      <Link
        href="/"
        onClick={(e) => e.stopPropagation()}
        aria-label="Back to home"
        className="fixed left-4 top-4 z-40 flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:left-6 sm:top-6"
      >
        <ArrowLeft className="size-5" />
      </Link>

      {introTweets.map((tweet) => (
        <FloatingTweetCard
          key={tweet.id}
          tweet={tweet}
          reducedMotion={reducedMotion}
          viewport={viewport}
        />
      ))}

      <div className="pointer-events-none relative z-30 flex items-center justify-center px-6">
        <motion.div
          initial={false}
          animate={
            isBrandVisible
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.98, y: 8 }
          }
          transition={
            reducedMotion
              ? { duration: 0.12 }
              : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative flex flex-col items-center"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-[-7rem] inset-y-[-5.5rem] bg-[radial-gradient(circle_at_50%_44%,rgba(0,120,111,0.22),transparent_46%),linear-gradient(180deg,#ffffff_0%,#f0faf8_100%)] blur-2xl [mask-image:radial-gradient(ellipse_at_center,black_0%,black_50%,transparent_82%)]"
          />
          <div className="relative px-6 py-5 sm:px-8 sm:py-6">
            <BrandLockup
              centered
              className="drop-shadow-[0_12px_28px_rgba(0,120,111,0.08)]"
              markClassName="size-[4.5rem] sm:size-[5.5rem] lg:size-[6rem]"
              wordmarkClassName="text-[3rem] leading-none sm:text-[4.5rem] lg:text-[5.75rem]"
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

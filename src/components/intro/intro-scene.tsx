"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLockup } from "@/components/site/brand-lockup";
import { cn } from "@/lib/utils";

type DriftMotion = {
  x: number[];
  y: number[];
  rotate: number[];
  duration: number;
  delay: number;
};

type IntroTweetCard = {
  id: string;
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  anchorClassName: string;
  widthClassName: string;
  drift: DriftMotion;
};

const introTweets: IntroTweetCard[] = [
  {
    id: "gdb",
    href: "https://x.com/gdb/status/2023481258639286401?s=20",
    src: "/intro/tweets/gdb-2023481258639286401.png",
    alt: "Screenshot of an X post by @gdb.",
    width: 1194,
    height: 378,
    anchorClassName: "left-[3%] top-[8%] sm:left-[6%] sm:top-[8%]",
    widthClassName:
      "w-[9rem] sm:w-[11rem] md:w-[13rem] lg:w-[15.5rem] xl:w-[17rem]",
    drift: {
      x: [0, 16, 6, -10, 0],
      y: [0, -6, 10, 4, 0],
      rotate: [-1.4, 0.2, -0.8, 0.4, -1.4],
      duration: 23,
      delay: 0.4,
    },
  },
  {
    id: "yuchen-top",
    href: "https://x.com/Yuchenj_UW/status/2023481799335440792?s=20",
    src: "/intro/tweets/yuchenj-2023481799335440792.png",
    alt: "Screenshot of an X post by @Yuchenj_UW.",
    width: 1196,
    height: 1378,
    anchorClassName: "right-[4%] top-[5%] sm:right-[8%] sm:top-[6%]",
    widthClassName:
      "w-[7.4rem] sm:w-[8.5rem] md:w-[10rem] lg:w-[11.5rem] xl:w-[12.25rem]",
    drift: {
      x: [0, -12, 4, -8, 0],
      y: [0, 12, -10, 6, 0],
      rotate: [1.2, 0.3, 1.6, 0.5, 1.2],
      duration: 27,
      delay: 1.1,
    },
  },
  {
    id: "yuchen-bottom",
    href: "https://x.com/Yuchenj_UW/status/2023519066825339364?s=20",
    src: "/intro/tweets/yuchenj-2023519066825339364.png",
    alt: "Screenshot of another X post by @Yuchenj_UW.",
    width: 1202,
    height: 936,
    anchorClassName: "bottom-[7%] right-[10%] sm:bottom-[8%] sm:right-[13%]",
    widthClassName:
      "w-[7.75rem] sm:w-[9rem] md:w-[10.5rem] lg:w-[12rem] xl:w-[13rem]",
    drift: {
      x: [0, -10, 8, 12, 0],
      y: [0, 8, -12, 3, 0],
      rotate: [-0.8, 0.6, -1.2, 0.1, -0.8],
      duration: 25,
      delay: 0.8,
    },
  },
  {
    id: "paulg",
    href: "https://x.com/paulg/status/2022604692178522562?s=20",
    src: "/intro/tweets/paulg-2022604692178522562.png",
    alt: "Screenshot of an X post by @paulg.",
    width: 1200,
    height: 562,
    anchorClassName: "bottom-[9%] left-[6%] sm:bottom-[10%] sm:left-[8%]",
    widthClassName:
      "w-[9.5rem] sm:w-[11.25rem] md:w-[13rem] lg:w-[15rem] xl:w-[16rem]",
    drift: {
      x: [0, 12, -4, 14, 0],
      y: [0, -9, -3, 7, 0],
      rotate: [1, 0, 1.4, 0.2, 1],
      duration: 29,
      delay: 1.4,
    },
  },
  {
    id: "netcapgirl",
    href: "https://x.com/netcapgirl/status/2024140332963705342?s=20",
    src: "/intro/tweets/netcapgirl-2024140332963705342.png",
    alt: "Screenshot of an X post by @netcapgirl.",
    width: 1196,
    height: 1524,
    anchorClassName: "left-[1%] top-[31%] sm:left-[4%] sm:top-[27%]",
    widthClassName:
      "w-[6.75rem] sm:w-[7.5rem] md:w-[8.75rem] lg:w-[9.5rem] xl:w-[10rem]",
    drift: {
      x: [0, 8, -6, 10, 0],
      y: [0, 10, -8, 6, 0],
      rotate: [-1, -0.2, -1.4, -0.4, -1],
      duration: 31,
      delay: 0.2,
    },
  },
  {
    id: "malikules",
    href: "https://x.com/malikules/status/2024213443356586428?s=20",
    src: "/intro/tweets/malikules-2024213443356586428.png",
    alt: "Screenshot of an X post by @malikules.",
    width: 1198,
    height: 1030,
    anchorClassName: "right-[2%] top-[32%] sm:right-[6%] sm:top-[31%]",
    widthClassName:
      "w-[7.25rem] sm:w-[8.25rem] md:w-[9.75rem] lg:w-[11rem] xl:w-[11.5rem]",
    drift: {
      x: [0, -14, -4, -10, 0],
      y: [0, -8, 9, -4, 0],
      rotate: [0.8, 1.5, 0.4, 1.1, 0.8],
      duration: 26,
      delay: 1.7,
    },
  },
];

export function IntroScene() {
  const reducedMotion = useReducedMotion() ?? false;
  const [isBrandVisible, setIsBrandVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  function handleToggle() {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    setIsBrandVisible((current) => !current);
  }

  return (
    <motion.section
      aria-label="DefaultTaste intro presentation"
      onClick={handleToggle}
      className="relative isolate flex min-h-screen cursor-pointer items-center justify-center overflow-hidden bg-background px-4 py-6 text-foreground select-none sm:px-6 lg:px-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(0,120,111,0.18),transparent_28%),radial-gradient(circle_at_50%_50%,rgba(0,120,111,0.08),transparent_42%),radial-gradient(circle_at_50%_92%,rgba(0,120,111,0.12),transparent_32%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(232,232,227,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(232,232,227,0.45)_1px,transparent_1px)] bg-[size:4.75rem_4.75rem] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-3xl sm:size-[26rem]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 sm:size-[24rem]"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/12 sm:size-[18rem]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-[13%_22%] hidden rounded-[2.75rem] border border-primary/8 bg-background/35 sm:block"
      />

      {introTweets.map((tweet) => (
        <div
          key={tweet.id}
          className={cn("absolute z-10", tweet.anchorClassName)}
        >
          <motion.a
            href={tweet.href}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "group relative block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              tweet.widthClassName,
            )}
            aria-label="Open original tweet on X"
          >
            <motion.div
              animate={
                reducedMotion
                  ? undefined
                  : {
                      x: tweet.drift.x,
                      y: tweet.drift.y,
                      rotate: tweet.drift.rotate,
                    }
              }
              transition={
                reducedMotion
                  ? undefined
                  : {
                      duration: tweet.drift.duration,
                      delay: tweet.drift.delay,
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut",
                    }
              }
              className="will-change-transform"
            >
              <div className="overflow-hidden rounded-[1.55rem] border border-border/85 bg-card/95 shadow-[0_28px_64px_rgba(12,12,9,0.08)] backdrop-blur-[2px] transition-transform duration-300 group-hover:scale-[1.01]">
                <Image
                  src={tweet.src}
                  alt={tweet.alt}
                  width={tweet.width}
                  height={tweet.height}
                  priority
                  sizes="(max-width: 640px) 38vw, (max-width: 1024px) 24vw, 16vw"
                  className="h-auto w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.a>
        </div>
      ))}

      <div className="pointer-events-none relative z-20 flex items-center justify-center px-6">
        <motion.div
          initial={false}
          animate={
            isBrandVisible
              ? {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0,
                  scale: 0.97,
                  y: 8,
                  filter: "blur(10px)",
                }
          }
          transition={
            reducedMotion
              ? { duration: 0.12 }
              : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }
          className="relative flex flex-col items-center"
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-[-1.5rem] inset-y-[-1rem] rounded-[2rem] border border-border/60 bg-background/88 shadow-[0_22px_60px_rgba(12,12,9,0.06)] backdrop-blur-md"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-6 inset-y-2 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_10%,rgba(0,120,111,0.18),transparent_62%)]"
          />
          <div className="relative px-8 py-7 sm:px-10 sm:py-8">
            <BrandLockup
              centered
              markClassName="size-16 drop-shadow-[0_14px_28px_rgba(0,120,111,0.12)] sm:size-20 lg:size-24"
              wordmarkClassName="text-[2.7rem] leading-none sm:text-[4rem] lg:text-[5rem]"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate={
          hasInteracted
            ? { opacity: 0, y: 10 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-border/75 bg-background/88 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground shadow-[0_8px_24px_rgba(12,12,9,0.04)] backdrop-blur md:bottom-7"
      >
        Click to reveal
      </motion.div>
    </motion.section>
  );
}

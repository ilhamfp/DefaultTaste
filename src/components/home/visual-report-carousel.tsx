"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import Link from "next/link";

/* ── Animated SVG patterns ─────────────────────────────────────── */

function WavyLines({ color, looping }: { color: string; looping: boolean }) {
  return (
    <svg viewBox="0 0 312 192" fill="none" className="h-full w-full">
      {Array.from({ length: 24 }).map((_, i) => {
        const base = 8 + i * 8;
        const amp = 3 + (i % 3) * 2;
        return (
          <motion.path
            key={i}
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity={0.45 + (i % 4) * 0.08}
            d={`M0 ${base} Q78 ${base - amp},156 ${base + amp} T312 ${base}`}
            animate={
              looping
                ? {
                    d: [
                      `M0 ${base} Q78 ${base - amp},156 ${base + amp} T312 ${base}`,
                      `M0 ${base} Q78 ${base + amp},156 ${base - amp} T312 ${base}`,
                      `M0 ${base} Q78 ${base - amp},156 ${base + amp} T312 ${base}`,
                    ],
                  }
                : undefined
            }
            transition={
              looping
                ? {
                    duration: 2.4 + (i % 3) * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.04,
                  }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}

function VerticalBars({ color, looping }: { color: string; looping: boolean }) {
  return (
    <svg viewBox="0 0 312 192" fill="none" className="h-full w-full">
      {Array.from({ length: 52 }).map((_, i) => {
        const baseH = 30 + Math.abs(Math.sin(i * 0.4)) * 60;
        const peakH = 60 + Math.abs(Math.sin(i * 0.4)) * 120;
        return (
          <motion.rect
            key={i}
            x={i * 6}
            y={192 - baseH}
            width="3.5"
            height={baseH}
            rx="1"
            fill={color}
            fillOpacity={0.25 + Math.abs(Math.sin(i * 0.7)) * 0.25}
            animate={
              looping
                ? {
                    height: [baseH, peakH, baseH],
                    y: [192 - baseH, 192 - peakH, 192 - baseH],
                    fillOpacity: [
                      0.25 + Math.abs(Math.sin(i * 0.7)) * 0.25,
                      0.45 + Math.abs(Math.sin(i * 0.7)) * 0.4,
                      0.25 + Math.abs(Math.sin(i * 0.7)) * 0.25,
                    ],
                  }
                : undefined
            }
            transition={
              looping
                ? {
                    duration: 1.8 + (i % 5) * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.02,
                  }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}

function NestedRects({ color, looping }: { color: string; looping: boolean }) {
  return (
    <svg viewBox="0 0 312 192" fill="none" className="h-full w-full">
      {[0, 1, 2].map((col) =>
        [0, 1, 2].map((row) => {
          const x = 20 + col * 100;
          const y = 10 + row * 62;
          const idx = col * 3 + row;
          return (
            <g key={`${col}-${row}`}>
              {[
                { dx: 0, dy: 0, w: 80, h: 50, rx: 8, op: 0.25 },
                { dx: 10, dy: 8, w: 60, h: 34, rx: 5, op: 0.2 },
                { dx: 20, dy: 15, w: 40, h: 20, rx: 3, op: 0.15 },
              ].map((r, ri) => (
                <motion.rect
                  key={ri}
                  x={x + r.dx}
                  y={y + r.dy}
                  width={r.w}
                  height={r.h}
                  rx={r.rx}
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity={r.op}
                  fill="none"
                  animate={
                    looping
                      ? {
                          strokeOpacity: [r.op, r.op + 0.25, r.op],
                          scale: [1, 1.06, 1],
                        }
                      : undefined
                  }
                  style={{
                    transformOrigin: `${x + r.dx + r.w / 2}px ${y + r.dy + r.h / 2}px`,
                  }}
                  transition={
                    looping
                      ? {
                          duration: 2 + ri * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: idx * 0.12 + ri * 0.1,
                        }
                      : undefined
                  }
                />
              ))}
            </g>
          );
        }),
      )}
    </svg>
  );
}

/* ── Sizes ─────────────────────────────────────────────────────── */

const SMALL = { w: 170, h: 218 };
const LARGE = { w: 360, h: 460 };

/* ── Card definitions ──────────────────────────────────────────── */

type CardDef = {
  id: string;
  slug: string;
  title: string;
  description: string;
  bg: string;
  textColor: string;
  descColor: string;
  patternKey: "wavy" | "bars" | "rects";
  tx: number;
  ty: number;
  rotate: number;
  z: number;
  available: boolean;
};

const CARDS: CardDef[] = [
  {
    id: "claude",
    slug: "#",
    title: "Claude\nEvolution",
    description:
      "Tracing Claude's aesthetic defaults from Haiku to Opus — how its visual taste shifts across capability tiers.",
    bg: "#E54F10",
    textColor: "#FFECD6",
    descColor: "rgba(255,236,214,0.7)",
    patternKey: "bars",
    tx: -165,
    ty: -(SMALL.h / 2) + 10,
    rotate: -8,
    z: 1,
    available: false,
  },
  {
    id: "gemini",
    slug: "/visual-reports/gemini-evolution",
    title: "Gemini\nEvolution",
    description:
      "How Gemini's default aesthetic evolved across three model generations. Same prompt, three eras of taste.",
    bg: "#00786F",
    textColor: "#B8FFF5",
    descColor: "rgba(184,255,245,0.7)",
    patternKey: "wavy",
    tx: -(SMALL.w / 2),
    ty: -(SMALL.h / 2) - 10,
    rotate: -2,
    z: 3,
    available: true,
  },
  {
    id: "bigthree",
    slug: "#",
    title: "The Big\nThree",
    description:
      "OpenAI vs Claude vs Gemini — a side-by-side comparison of how the leading models express visual taste.",
    bg: "#0C0C09",
    textColor: "#E8E8E3",
    descColor: "rgba(232,232,227,0.7)",
    patternKey: "rects",
    tx: 5,
    ty: -(SMALL.h / 2) + 15,
    rotate: 6,
    z: 2,
    available: false,
  },
];

const spring = {
  type: "spring" as const,
  stiffness: 180,
  damping: 24,
};

/* ── Pattern renderer ──────────────────────────────────────────── */

function PatternRenderer({
  type,
  color,
  looping,
}: {
  type: "wavy" | "bars" | "rects";
  color: string;
  looping: boolean;
}) {
  if (type === "wavy") return <WavyLines color={color} looping={looping} />;
  if (type === "bars") return <VerticalBars color={color} looping={looping} />;
  return <NestedRects color={color} looping={looping} />;
}

/* ── Expanded card inner content ───────────────────────────────── */

function ExpandedCardContent({ card, looping }: { card: CardDef; looping: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl"
      style={{
        backgroundColor: card.bg,
        width: LARGE.w,
        height: LARGE.h,
      }}
    >
      <h3
        className="absolute font-serif"
        style={{
          color: card.textColor,
          whiteSpace: "pre-line",
          fontSize: 38,
          lineHeight: "40px",
          top: 20,
          left: 20,
        }}
      >
        {card.title}
      </h3>

      {!card.available && (
        <span
          className="absolute font-mono text-[10px] uppercase tracking-widest"
          style={{
            color: card.textColor,
            opacity: 0.5,
            top: 110,
            left: 20,
          }}
        >
          Coming soon
        </span>
      )}

      <motion.p
        className="absolute text-sm leading-relaxed"
        style={{
          color: card.descColor,
          left: 20,
          right: 20,
          top: card.available ? 108 : 134,
        }}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {card.description}
      </motion.p>

      {card.available && (
        <motion.span
          className="absolute z-10 font-mono text-xs tracking-wide"
          style={{
            color: card.textColor,
            left: 20,
            bottom: 20,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.25, delay: 0.25 }}
        >
          Click to view report →
        </motion.span>
      )}

      <div
        className="absolute overflow-hidden"
        style={{
          left: 16,
          right: 16,
          bottom: card.available ? 44 : 16,
          height: 200,
        }}
      >
        <PatternRenderer
          type={card.patternKey}
          color={card.textColor}
          looping={looping}
        />
      </div>
    </div>
  );
}

/* ── Exported carousel ─────────────────────────────────────────── */

export function VisualReportCarousel() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  const collapse = useCallback(() => setExpanded(null), []);

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapse();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [expanded, collapse]);

  const expandedCard = CARDS.find((c) => c.id === expanded) ?? null;

  return (
    <LayoutGroup>
      {/* Fan of small cards */}
      <div
        className="relative flex w-full items-center justify-center"
        style={{ height: 280 }}
      >
        <div className="relative h-full w-full max-w-[500px]">
          {CARDS.map((card) => {
            if (card.id === expanded) return null;

            return (
              <motion.button
                type="button"
                key={card.id}
                layoutId={`rcard-${card.id}`}
                className="absolute cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-2xl"
                aria-expanded={expanded === card.id}
                aria-label={card.title.replace("\n", " ")}
                style={{
                  left: "50%",
                  top: "50%",
                  x: card.tx,
                  y: card.ty,
                  rotate: card.rotate,
                  zIndex: card.z,
                }}
                initial={false}
                animate={{
                  scale: expanded !== null ? 0.9 : 1,
                  opacity: expanded !== null ? 0.4 : 1,
                }}
                transition={spring}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((prev) =>
                    prev === card.id ? null : card.id,
                  );
                }}
              >
                <div
                  className="relative overflow-hidden rounded-2xl shadow-lg"
                  style={{
                    backgroundColor: card.bg,
                    width: SMALL.w,
                    height: SMALL.h,
                  }}
                >
                  <h3
                    className="absolute font-serif"
                    style={{
                      color: card.textColor,
                      whiteSpace: "pre-line",
                      fontSize: 22,
                      lineHeight: "24px",
                      top: 16,
                      left: 16,
                    }}
                  >
                    {card.title}
                  </h3>

                  {!card.available && (
                    <span
                      className="absolute font-mono text-[9px] uppercase tracking-widest"
                      style={{
                        color: card.textColor,
                        opacity: 0.5,
                        top: 70,
                        left: 16,
                      }}
                    >
                      Coming soon
                    </span>
                  )}

                  <div
                    className="absolute overflow-hidden"
                    style={{ left: 14, right: 14, bottom: 14, height: 105 }}
                  >
                    <PatternRenderer
                      type={card.patternKey}
                      color={card.textColor}
                      looping={false}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Backdrop — fades in/out */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="backdrop"
            role="presentation"
            className="fixed inset-0 z-[99] bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={collapse}
          />
        )}
      </AnimatePresence>

      {/* Expanded card — layoutId drives the transition from fan position */}
      {expandedCard && (
        <div
          className="pointer-events-none fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
        >
          <motion.div
            layoutId={`rcard-${expandedCard.id}`}
            className="pointer-events-auto relative select-none"
            transition={spring}
          >
            {expandedCard.available ? (
              <Link
                href={expandedCard.slug}
                className="block cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ExpandedCardContent card={expandedCard} looping={!reducedMotion} />
              </Link>
            ) : (
              <ExpandedCardContent card={expandedCard} looping={!reducedMotion} />
            )}
          </motion.div>
        </div>
      )}
    </LayoutGroup>
  );
}

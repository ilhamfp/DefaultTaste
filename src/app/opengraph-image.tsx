import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "DefaultTaste — Revealing AI Aesthetic Defaults";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* ------------------------------------------------------------------ */
/*  Logo SVG — exact copy of logo/defaulttaste-logo.svg               */
/*  Uses "hero" tone colors matching brand-lockup.tsx:                  */
/*    neutral: rgba(255,255,255,0.74)  outline: rgba(12,12,9,0.36)     */
/*  Embedded as data URI because Satori cannot render                  */
/*  stroke-dasharray or transform on inline SVG elements.              */
/* ------------------------------------------------------------------ */
const LOGO_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">',
  '<rect x="15" y="15" width="36" height="36" rx="6" fill="rgba(255,255,255,0.74)"/>',
  '<rect x="57" y="15" width="36" height="36" rx="6" fill="rgba(255,255,255,0.74)"/>',
  '<rect x="15" y="57" width="36" height="36" rx="6" fill="rgba(255,255,255,0.74)"/>',
  '<rect x="57" y="57" width="36" height="36" rx="6" fill="none" stroke="rgba(12,12,9,0.36)" stroke-width="2" stroke-dasharray="6 4"/>',
  '<rect x="67" y="67" width="36" height="36" rx="6" fill="#00786F" transform="rotate(-7, 85, 85)"/>',
  "</svg>",
].join("");

export default async function OGImage() {
  const fontsDir = join(process.cwd(), "src/assets/fonts");
  const [notoSerifRegular, notoSerifItalic] = await Promise.all([
    readFile(join(fontsDir, "NotoSerif-Regular.ttf")),
    readFile(join(fontsDir, "NotoSerif-Italic.ttf")),
  ]);

  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          /* Adapted from MarketingShell "home" gradient — uses ellipse
             instead of circle so the glow spreads across the wide 1200×630
             aspect ratio, with larger spread percentages to fill the canvas */
          backgroundImage: [
            "radial-gradient(ellipse 130% 80% at 50% 32%, rgba(0,120,111,0.28), transparent 60%)",
            "radial-gradient(ellipse 150% 70% at 50% 50%, rgba(0,120,111,0.14), transparent 65%)",
            "radial-gradient(ellipse 120% 50% at 50% 100%, rgba(0,120,111,0.10), transparent 55%)",
          ].join(", "),
          position: "relative",
        }}
      >
        {/* Top border accent — matches marketing-shell's via-primary/30 gradient line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(to right, transparent, rgba(0,120,111,0.30), transparent)",
          }}
        />

        {/* Logo mark */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={130}
          height={130}
          alt=""
          style={{
            filter: "drop-shadow(0px 14px 28px rgba(0,120,111,0.12))",
          }}
        />

        {/* Wordmark — Noto Serif, matching BrandLockup centered wordmark */}
        <div
          style={{
            display: "flex",
            fontFamily: "Noto Serif",
            fontStyle: "normal",
            fontSize: 82,
            letterSpacing: "-0.025em",
            lineHeight: 1,
            marginTop: 20,
          }}
        >
          <span style={{ color: "#0C0C09" }}>Default</span>
          <span style={{ color: "#00786F" }}>Taste</span>
        </div>

        {/* Tagline — same copy as landing hero h1 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 28,
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "Noto Serif",
              fontSize: 38,
              letterSpacing: "-0.015em",
              color: "#0C0C09",
              lineHeight: 1.15,
            }}
          >
            Point us at an agent.
          </span>
          <span
            style={{
              fontFamily: "Noto Serif",
              fontStyle: "italic",
              fontSize: 38,
              letterSpacing: "-0.015em",
              color: "rgba(12,12,9,0.78)",
              lineHeight: 1.15,
            }}
          >
            Reveal the taste it defaults to.
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Serif",
          data: notoSerifRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Noto Serif",
          data: notoSerifItalic,
          style: "italic",
          weight: 400,
        },
      ],
    },
  );
}

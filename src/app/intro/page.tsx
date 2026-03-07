import type { Metadata } from "next";
import { IntroScene } from "@/components/intro/intro-scene";

export const metadata: Metadata = {
  title: "DefaultTaste Intro",
  description: "Presentation intro slide for DefaultTaste.",
};

export default function IntroPage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <IntroScene />
    </main>
  );
}

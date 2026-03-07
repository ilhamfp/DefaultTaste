import { Metadata } from "next";
import { getAgentProfile, getArtifactManifest } from "@/lib/data";
import { EvolutionReport } from "@/components/evolution/evolution-report";

export const metadata: Metadata = {
  title: "Gemini Evolution - How Gemini Learned to Feel | DefaultTaste",
  description:
    "A visual report of how Gemini's default aesthetic evolved across three model generations.",
};

const EVOLUTION_IDS = [
  "gemini-2-flash-lite",
  "gemini-flash",
  "gemini-flash-lite",
] as const;

export default async function GeminiEvolutionPage() {
  const [profiles, manifests] = await Promise.all([
    Promise.all(EVOLUTION_IDS.map((id) => getAgentProfile(id))),
    Promise.all(EVOLUTION_IDS.map((id) => getArtifactManifest(id))),
  ]);

  const validProfiles = profiles.filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );
  const validManifests = manifests.map((m) => m ?? []);

  return (
    <EvolutionReport profiles={validProfiles} manifests={validManifests} />
  );
}

import { AgentProfile, AgentSummary } from "./types";
import { mockProfiles } from "./mock";
import fs from "fs";
import path from "path";

export const KNOWN_AGENT_IDS = ["gemini-flash", "lyria"] as const;

export async function getAgentProfile(
  agentId: string,
): Promise<AgentProfile | null> {
  const dataDir = path.join(process.cwd(), "data");

  if (agentId === "gemini-flash") {
    const profilePath = path.join(dataDir, "websites", "profile.json");
    if (fs.existsSync(profilePath)) {
      const raw = fs.readFileSync(profilePath, "utf-8");
      return JSON.parse(raw) as AgentProfile;
    }
  }

  if (agentId === "lyria") {
    const profilePath = path.join(dataDir, "music", "profile.json");
    if (fs.existsSync(profilePath)) {
      const raw = fs.readFileSync(profilePath, "utf-8");
      return JSON.parse(raw) as AgentProfile;
    }
  }

  return mockProfiles[agentId] ?? null;
}

function formatTopColor(name: string | undefined) {
  if (!name) {
    return "Unknown";
  }

  return name.split("/")[0]?.trim() || name;
}

function toAgentSummary(profile: AgentProfile): AgentSummary {
  if (profile.probe_type === "website" && profile.website_profile) {
    return {
      id: profile.id,
      name: profile.name,
      model: profile.model,
      probeTypeLabel: "Website Taste",
      probeCount: profile.probe_count,
      keyStats: [
        {
          label: "Dark Mode",
          value: `${profile.website_profile.dark_mode_percentage}%`,
        },
        {
          label: "Top Color",
          value: formatTopColor(profile.website_profile.colors[0]?.name),
        },
        {
          label: "Top Font",
          value: profile.website_profile.fonts[0]?.name ?? "Unknown",
        },
      ],
    };
  }

  if (profile.probe_type === "music" && profile.music_profile) {
    return {
      id: profile.id,
      name: profile.name,
      model: profile.model,
      probeTypeLabel: "Music Taste",
      probeCount: profile.probe_count,
      keyStats: [
        {
          label: "Avg BPM",
          value: new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 1,
          }).format(profile.music_profile.bpm.avg),
        },
        {
          label: "Top Key",
          value: profile.music_profile.keys[0]?.name ?? "Unknown",
        },
        {
          label: "Top Genre",
          value: profile.music_profile.genres[0]?.name ?? "Unknown",
        },
      ],
    };
  }

  return {
    id: profile.id,
    name: profile.name,
    model: profile.model,
    probeTypeLabel: "Taste Profile",
    probeCount: profile.probe_count,
    keyStats: [],
  };
}

export async function getKnownAgentProfiles(): Promise<AgentProfile[]> {
  const profiles = await Promise.all(
    KNOWN_AGENT_IDS.map((agentId) => getAgentProfile(agentId)),
  );

  return profiles.filter(
    (profile): profile is AgentProfile => profile !== null,
  );
}

export async function getHomepageAgentSummaries(): Promise<AgentSummary[]> {
  const profiles = await getKnownAgentProfiles();

  return profiles.map(toAgentSummary);
}

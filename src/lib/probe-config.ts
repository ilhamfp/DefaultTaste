import type { ProbeDepth, ProbeMedia, ProbeRunStatus } from "./types";

export const PROBE_TRANSPORT_NOTES: Record<ProbeMedia, string> = {
  website:
    "Future integration target: Gemini-compatible HTTPS generate endpoint",
  music: "Future integration target: Lyria-compatible live/WebSocket endpoint",
};

export const PROBE_PROMPT_NOTE =
  "This demo keeps a fixed neutral prompt pack and stages the run from pre-generated artifacts. Your label and description are saved as metadata only and do not influence the prompts.";

export const PROBE_DEPTH_PRESETS: Record<
  ProbeMedia,
  Record<ProbeDepth, { label: string; runCount: number; description: string }>
> = {
  website: {
    quick: {
      label: "Quick",
      runCount: 12,
      description: "Fast read on layout, color, and typography defaults.",
    },
    standard: {
      label: "Standard",
      runCount: 30,
      description: "Balanced website probe with stronger pattern confidence.",
    },
    deep: {
      label: "Deep",
      runCount: 60,
      description: "Longer website probe for clearer repeated defaults.",
    },
  },
  music: {
    quick: {
      label: "Quick",
      runCount: 4,
      description: "Short music sweep for tempo, genre, and mood signals.",
    },
    standard: {
      label: "Standard",
      runCount: 8,
      description: "Balanced music probe with stronger key and mood trends.",
    },
    deep: {
      label: "Deep",
      runCount: 12,
      description: "Longer music probe for stronger recurring defaults.",
    },
  },
};

export const PROBE_STAGE_ORDER: ProbeRunStatus[] = [
  "queued",
  "validating",
  "probing",
  "analyzing",
  "aggregating",
  "generating_correction_prompt",
  "completed",
];

export const PROBE_STAGE_LABELS: Record<ProbeRunStatus, string> = {
  queued: "Queued",
  validating: "Checking setup",
  probing: "Staging probe pass",
  analyzing: "Inspecting demo artifacts",
  aggregating: "Assembling profile",
  generating_correction_prompt: "Writing correction prompt",
  completed: "Demo complete",
  failed: "Failed",
  interrupted: "Interrupted",
};

export const ACTIVE_PROBE_RUN_STATUSES: ProbeRunStatus[] = [
  "queued",
  "validating",
  "probing",
  "analyzing",
  "aggregating",
  "generating_correction_prompt",
];

export function getProbeRunCount(media: ProbeMedia, depth: ProbeDepth) {
  return PROBE_DEPTH_PRESETS[media][depth].runCount;
}

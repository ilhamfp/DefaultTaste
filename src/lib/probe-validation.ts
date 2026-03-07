import type { ProbeDepth, ProbeMedia, ProbeRunSettings } from "./types";

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function validateProbeEndpoint(endpointUrl: string, media: ProbeMedia) {
  try {
    const parsed = new URL(endpointUrl.trim());

    if (media === "website") {
      if (parsed.protocol !== "https:") {
        return {
          ok: false as const,
          message: "Website probes require an HTTPS endpoint.",
        };
      }
    }

    if (media === "music") {
      if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
        return {
          ok: false as const,
          message: "Music probes require a WebSocket-style endpoint.",
        };
      }
    }

    return { ok: true as const, url: parsed.toString() };
  } catch {
    return { ok: false as const, message: "Enter a valid endpoint URL." };
  }
}

export function normalizeProbeRunSettings(input: {
  endpointUrl: string;
  label?: string | null;
  description?: string | null;
  media: ProbeMedia;
  depth: ProbeDepth;
}) {
  const endpoint = validateProbeEndpoint(input.endpointUrl, input.media);

  if (!endpoint.ok) {
    return endpoint;
  }

  const settings: ProbeRunSettings = {
    endpointUrl: endpoint.url,
    label: normalizeOptionalText(input.label),
    description: normalizeOptionalText(input.description),
    media: input.media,
    depth: input.depth,
  };

  return { ok: true as const, settings };
}

import { NextResponse } from "next/server";
import {
  createProbeRun,
  startProbeRunWorker,
  updateProbeRun,
} from "@/lib/probe-runs";
import { normalizeProbeRunSettings } from "@/lib/probe-validation";
import type { ProbeDepth, ProbeMedia } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isProbeMedia(value: unknown): value is ProbeMedia {
  return value === "website" || value === "music";
}

function isProbeDepth(value: unknown): value is ProbeDepth {
  return value === "quick" || value === "standard" || value === "deep";
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;

  if (!isProbeMedia(body.media) || !isProbeDepth(body.depth)) {
    return NextResponse.json(
      { error: "Select a valid probe type and depth." },
      { status: 400 },
    );
  }

  const normalized = normalizeProbeRunSettings({
    endpointUrl: String(body.endpointUrl ?? ""),
    label: typeof body.label === "string" ? body.label : null,
    description: typeof body.description === "string" ? body.description : null,
    media: body.media,
    depth: body.depth,
  });

  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.message }, { status: 400 });
  }

  const run = await createProbeRun(normalized.settings);

  try {
    await startProbeRunWorker(run.id);
  } catch (error) {
    await updateProbeRun(run.id, (current) => ({
      ...current,
      status: "failed",
      error:
        error instanceof Error
          ? error.message
          : "The probe worker failed to start.",
      workerPid: null,
      progress: {
        ...current.progress,
        message: "The probe worker failed to start.",
      },
    }));

    return NextResponse.json(
      { error: "The probe worker failed to start." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { runId: run.id },
    { headers: { "Cache-Control": "no-store" } },
  );
}

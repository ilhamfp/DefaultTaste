import { NextResponse } from "next/server";
import { readProbeRunProfile, refreshProbeRunState } from "@/lib/probe-runs";
import type { ProbeRunResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const run = await refreshProbeRunState(runId);

  if (!run) {
    return NextResponse.json({ error: "Demo run not found." }, { status: 404 });
  }

  const profile =
    run.status === "completed" ? await readProbeRunProfile(run) : null;
  const response: ProbeRunResponse = { run, profile };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}

import { NextResponse } from "next/server";
import { getArtifactManifest } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const manifest = await getArtifactManifest(agentId);

  if (!manifest) {
    return NextResponse.json(
      { error: "Artifacts not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(manifest);
}

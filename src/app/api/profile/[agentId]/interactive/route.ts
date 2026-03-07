import { NextResponse } from "next/server";
import { getAgentInteractiveProfile } from "@/lib/data";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const interactiveProfile = await getAgentInteractiveProfile(agentId);

  if (!interactiveProfile) {
    return NextResponse.json(
      { error: "Interactive music data not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(interactiveProfile);
}

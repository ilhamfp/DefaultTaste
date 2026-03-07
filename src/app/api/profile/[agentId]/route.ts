import { NextResponse } from "next/server";
import { getAgentProfile } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const profile = await getAgentProfile(agentId);

  if (!profile) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProbeRunView } from "@/components/probe/probe-run-view";
import { MarketingShell } from "@/components/site/marketing-shell";
import { readProbeRunProfile, refreshProbeRunState } from "@/lib/probe-runs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Probe Run | DefaultTaste",
  description:
    "Track a DefaultTaste probe run as it stages each step of the pipeline.",
};

export default async function ProbeRunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const run = await refreshProbeRunState(runId);

  if (!run) {
    notFound();
  }

  const profile =
    run.status === "completed" ? await readProbeRunProfile(run) : null;

  return (
    <MarketingShell mainClassName="px-4 sm:px-6">
      <ProbeRunView initialResponse={{ run, profile }} />
    </MarketingShell>
  );
}

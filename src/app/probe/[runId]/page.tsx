import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProbeRunView } from "@/components/probe/probe-run-view";
import { MarketingShell } from "@/components/site/marketing-shell";
import { readProbeRunProfile, refreshProbeRunState } from "@/lib/probe-runs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Demo Run | DefaultTaste",
  description:
    "Track a simulated DefaultTaste probe walkthrough as it stages each step of the pipeline.",
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
    <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
      <ProbeRunView initialResponse={{ run, profile }} />
    </MarketingShell>
  );
}

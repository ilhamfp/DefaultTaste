import Link from "next/link";
import { ProfileReport } from "@/components/profile/profile-report";
import { MarketingShell } from "@/components/site/marketing-shell";
import { getAgentInteractiveProfile, getAgentProfile } from "@/lib/data";

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const [profile, interactiveData] = await Promise.all([
    getAgentProfile(agentId),
    getAgentInteractiveProfile(agentId),
  ]);

  if (!profile) {
    return (
      <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
          <p className="text-sm text-muted-foreground">Agent not found.</p>
          <Link
            href="/"
            className={`mt-3 inline-block text-sm text-primary transition-colors hover:text-primary/80 ${focusRingClass}`}
          >
            Back to home
          </Link>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
      <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
        <ProfileReport
          profile={profile}
          interactiveData={interactiveData}
          backLabel="Agents"
          footerNote="Fixed neutral prompt pack"
        />
      </div>
    </MarketingShell>
  );
}

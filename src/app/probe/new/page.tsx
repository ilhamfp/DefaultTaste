import type { Metadata } from "next";
import { ProbeSetupForm } from "@/components/probe/probe-setup-form";
import { MarketingShell } from "@/components/site/marketing-shell";
import type { ProbeDepth, ProbeMedia } from "@/lib/types";

export const metadata: Metadata = {
  title: "Set Up Demo | DefaultTaste",
  description:
    "Choose the medium and depth for a simulated DefaultTaste probe walkthrough.",
};

function pickParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseMedia(value: string, endpointUrl: string): ProbeMedia {
  if (value === "website" || value === "music") {
    return value;
  }

  try {
    const protocol = new URL(endpointUrl).protocol;
    return protocol === "ws:" || protocol === "wss:" ? "music" : "website";
  } catch {
    return "website";
  }
}

function parseDepth(value: string): ProbeDepth {
  if (value === "quick" || value === "standard" || value === "deep") {
    return value;
  }

  return "standard";
}

export default async function ProbeSetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const endpoint = pickParam(params.endpoint);
  const label = pickParam(params.label);
  const description = pickParam(params.description);
  const media = parseMedia(pickParam(params.media), endpoint);
  const depth = parseDepth(pickParam(params.depth));

  return (
    <MarketingShell compactHeader mainClassName="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl px-2 pb-16 pt-10 sm:px-0">
        <ProbeSetupForm
          initialEndpoint={endpoint}
          initialLabel={label}
          initialDescription={description}
          initialMedia={media}
          initialDepth={depth}
        />
      </div>
    </MarketingShell>
  );
}

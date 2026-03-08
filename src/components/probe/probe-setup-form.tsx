"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PROBE_DEPTH_PRESETS,
  PROBE_PROMPT_NOTE,
  PROBE_TRANSPORT_NOTES,
} from "@/lib/probe-config";
import { normalizeProbeRunSettings } from "@/lib/probe-validation";
import type { ProbeDepth, ProbeMedia } from "@/lib/types";

const mediaOptions: { value: ProbeMedia; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "music", label: "Music" },
];

const depthOptions: ProbeDepth[] = ["quick", "standard", "deep"];

type ProbeSetupFormProps = {
  initialEndpoint: string;
  initialLabel: string;
  initialDescription: string;
  initialMedia: ProbeMedia;
  initialDepth: ProbeDepth;
};

export function ProbeSetupForm({
  initialEndpoint,
  initialLabel,
  initialDescription,
  initialMedia,
  initialDepth,
}: ProbeSetupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [endpointUrl, setEndpointUrl] = useState(initialEndpoint);
  const [label, setLabel] = useState(initialLabel);
  const [description, setDescription] = useState(initialDescription);
  const [media, setMedia] = useState<ProbeMedia>(initialMedia);
  const [depth, setDepth] = useState<ProbeDepth>(initialDepth);
  const [error, setError] = useState<string | null>(null);

  const normalized = useMemo(
    () =>
      normalizeProbeRunSettings({
        endpointUrl,
        label,
        description,
        media,
        depth,
      }),
    [description, depth, endpointUrl, label, media],
  );
  const preset = PROBE_DEPTH_PRESETS[media][depth];

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();

        if (!normalized.ok) {
          setError(normalized.message);
          return;
        }

        setError(null);

        startTransition(async () => {
          const response = await fetch("/api/probe-runs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(normalized.settings),
          });

          const payload = (await response.json()) as
            | { runId: string }
            | { error?: string };

          if (!response.ok || !("runId" in payload)) {
            const message =
              "error" in payload
                ? (payload.error ?? "Unable to start the probe run.")
                : "Unable to start the probe run.";
            setError(message);
            return;
          }

          router.push(`/probe/${payload.runId}`);
        });
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-7">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Probe setup
            </p>
            <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Configure your probe run.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              DefaultTaste will run the probe pass against the target endpoint,
              walk through each pipeline stage, and produce a final taste
              profile.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="probe-endpoint"
                className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
              >
                Endpoint URL
              </label>
              <input
                id="probe-endpoint"
                name="endpointUrl"
                type="text"
                value={endpointUrl}
                onChange={(event) => setEndpointUrl(event.target.value)}
                placeholder="https://generativelanguage.googleapis.com/..."
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="probe-label"
                  className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
                >
                  Agent label
                </label>
                <input
                  id="probe-label"
                  name="label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Optional display name"
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Probe type
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {mediaOptions.map((option) => {
                    const selected = option.value === media;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMedia(option.value)}
                        className={`rounded-lg border px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          selected
                            ? "border-primary bg-primary/8 text-foreground"
                            : "border-border bg-white text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="probe-description"
                className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
              >
                Description
              </label>
              <textarea
                id="probe-description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional context saved with the run. This does not influence the prompts."
                rows={4}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>

            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Probe depth
              </span>
              <div className="grid gap-3 md:grid-cols-3">
                {depthOptions.map((option) => {
                  const optionPreset = PROBE_DEPTH_PRESETS[media][option];
                  const selected = option === depth;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDepth(option)}
                      className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        selected
                          ? "border-primary bg-primary/8"
                          : "border-border bg-white"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">
                        {optionPreset.label}
                      </p>
                      <p className="mt-1 text-xs text-primary">
                        {optionPreset.runCount} generations
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {optionPreset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              Transport
            </p>
            <p className="mt-3 text-base leading-7 text-foreground">
              {PROBE_TRANSPORT_NOTES[media]}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {media === "website"
                ? "In a future live integration, website probes would call an HTTPS endpoint that behaves like a Gemini generate target."
                : "In a future live integration, music probes would call a WebSocket-style endpoint compatible with the Lyria workflow."}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Probe pack
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {PROBE_PROMPT_NOTE}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              This run
            </p>
            <p className="mt-3 font-serif text-3xl tracking-tight text-foreground">
              {preset.runCount} generations
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {preset.description}
            </p>
          </div>
        </aside>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!normalized.ok || isPending}
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isPending ? "Starting..." : "Start Probe"}
        </button>
        <p className="text-sm text-muted-foreground">
          Output is stored locally and remains available at a permanent run URL
          for review.
        </p>
      </div>
    </form>
  );
}

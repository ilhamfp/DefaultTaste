"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ACTIVE_PROBE_RUN_STATUSES,
  PROBE_DEPTH_PRESETS,
  PROBE_STAGE_LABELS,
  PROBE_STAGE_ORDER,
} from "@/lib/probe-config";
import { ProfileReport } from "@/components/profile/profile-report";
import type { ProbeRun, ProbeRunResponse, ProbeRunStatus } from "@/lib/types";

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function isActiveStatus(status: ProbeRunStatus) {
  return ACTIVE_PROBE_RUN_STATUSES.includes(status);
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatRunTitle(run: ProbeRun) {
  if (run.settings.label) {
    return run.settings.label;
  }

  try {
    return new URL(run.settings.endpointUrl).host;
  } catch {
    return "Custom probe";
  }
}

function buildRetryHref(run: ProbeRun) {
  const params = new URLSearchParams({
    endpoint: run.settings.endpointUrl,
    media: run.settings.media,
    depth: run.settings.depth,
  });

  if (run.settings.label) {
    params.set("label", run.settings.label);
  }

  if (run.settings.description) {
    params.set("description", run.settings.description);
  }

  return `/probe/new?${params.toString()}`;
}

function stageState(
  currentStatus: ProbeRunStatus,
  stage: ProbeRunStatus,
): "done" | "current" | "upcoming" | "error" {
  if (currentStatus === "failed" || currentStatus === "interrupted") {
    return "upcoming";
  }

  const currentIndex = PROBE_STAGE_ORDER.indexOf(currentStatus);
  const stageIndex = PROBE_STAGE_ORDER.indexOf(stage);

  if (stageIndex < currentIndex) {
    return "done";
  }

  if (stageIndex === currentIndex) {
    return "current";
  }

  return "upcoming";
}

type ProbeRunViewProps = {
  initialResponse: ProbeRunResponse;
};

export function ProbeRunView({ initialResponse }: ProbeRunViewProps) {
  const [response, setResponse] = useState(initialResponse);
  const [pollError, setPollError] = useState<string | null>(null);
  const { profile, run } = response;
  const retryHref = useMemo(() => buildRetryHref(run), [run]);
  const isActive = isActiveStatus(run.status);
  const isErrored = run.status === "failed" || run.status === "interrupted";
  const isMissingProfile = run.status === "completed" && !profile;
  const progressWidth = isActive
    ? Math.max(run.progress.percent, 8)
    : run.progress.percent;

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const response = await fetch(`/api/probe-runs/${run.id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to refresh the run.");
        }

        const payload = (await response.json()) as ProbeRunResponse;

        if (cancelled) {
          return;
        }

        setResponse(payload);
        setPollError(null);

        if (isActiveStatus(payload.run.status)) {
          timeoutId = setTimeout(poll, 1200);
        }
      } catch {
        if (cancelled) {
          return;
        }

        setPollError("Lost contact with the run for a moment. Retrying...");
        timeoutId = setTimeout(poll, 2200);
      }
    };

    timeoutId = setTimeout(poll, 1200);

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, run.id]);

  if (run.status === "completed" && profile) {
    return (
      <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
        <section className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                Probe complete
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {run.progress.message ??
                  "The profile is ready and saved at this run URL."}
              </p>
            </div>
            <Link
              href="/probe/new"
              className={`inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${focusRingClass}`}
            >
              Start another probe
            </Link>
          </div>
        </section>

        <ProfileReport
          profile={profile}
          backLabel="Probe Run"
          footerNote="Fixed neutral prompt pack"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-2 pb-12 pt-10 sm:px-0">
      <section className="pb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Probe run
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-foreground">
          {formatRunTitle(run)}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          DefaultTaste probes the submitted endpoint repeatedly, aggregates
          patterns across outputs, and builds a taste profile.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <section className="rounded-xl border border-border bg-card p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Current stage
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-tight text-foreground">
                {PROBE_STAGE_LABELS[run.status]}
              </h2>
            </div>
            <div className="sm:text-right">
              <p className="font-mono text-4xl font-semibold tracking-tight text-primary">
                {run.progress.percent}%
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {run.progress.current} / {run.progress.total}
              </p>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                run.status === "failed" || run.status === "interrupted"
                  ? "bg-rose-500"
                  : "bg-primary"
              }`}
              style={{ width: `${Math.min(progressWidth, 100)}%` }}
            />
          </div>

          <p
            aria-live="polite"
            className="mt-4 text-sm leading-7 text-foreground"
          >
            {run.progress.message ?? "Preparing the probe run."}
          </p>

          {pollError ? (
            <p className="mt-3 text-sm text-muted-foreground">{pollError}</p>
          ) : null}

          {(isErrored || isMissingProfile) && run.error ? (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              {run.error}
            </div>
          ) : null}

          {isMissingProfile ? (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
              The run finished, but the saved profile could not be loaded.
            </div>
          ) : null}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Run settings
            </p>
            <dl className="mt-4 space-y-4 text-sm text-muted-foreground">
              <div>
                <dt className="uppercase tracking-[0.2em] text-[11px]">
                  Endpoint
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-foreground">
                  {run.settings.endpointUrl}
                </dd>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-[0.2em] text-[11px]">
                    Medium
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {run.settings.media === "website" ? "Website" : "Music"}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.2em] text-[11px]">
                    Depth
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {
                      PROBE_DEPTH_PRESETS[run.settings.media][
                        run.settings.depth
                      ].label
                    }
                  </dd>
                </div>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em] text-[11px]">
                  Transport
                </dt>
                <dd className="mt-1 text-foreground">{run.transportLabel}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em] text-[11px]">
                  Saved
                </dt>
                <dd className="mt-1 text-foreground">
                  {formatTimestamp(run.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.2em] text-[11px]">
                  Last update
                </dt>
                <dd className="mt-1 text-foreground">
                  {formatTimestamp(run.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>

          {run.settings.description ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Description
              </p>
              <p className="mt-3 text-sm leading-7 text-foreground">
                {run.settings.description}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">
              Note
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground">
              This run keeps its own URL, so you can refresh, leave, and come
              back to the same result later.
            </p>
          </div>
        </aside>
      </div>

      {!isErrored ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROBE_STAGE_ORDER.map((stage) => {
            const state = stageState(run.status, stage);

            return (
              <div
                key={stage}
                className={`rounded-xl border p-5 ${
                  state === "done"
                    ? "border-primary/20 bg-primary/5"
                    : state === "current"
                      ? "border-primary/30 bg-card"
                      : state === "error"
                        ? "border-rose-200 bg-rose-50"
                        : "border-border bg-card"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {state === "done"
                    ? "Done"
                    : state === "current"
                      ? "In progress"
                      : state === "error"
                        ? "Interrupted"
                        : "Upcoming"}
                </p>
                <h3 className="mt-3 font-serif text-2xl tracking-tight text-foreground">
                  {PROBE_STAGE_LABELS[stage]}
                </h3>
              </div>
            );
          })}
        </section>
      ) : null}

      {isErrored || isMissingProfile ? (
        <section className="mt-8 rounded-xl border border-border bg-card p-7">
          <h2 className="font-serif text-3xl tracking-tight text-foreground">
            {isMissingProfile
              ? "Start a fresh run"
              : "Try again with the same settings"}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            {isMissingProfile
              ? "The worker completed, but the saved result was missing when the page tried to load it. Reopen the setup form and start a fresh run."
              : "The run stopped before completion. You can reopen the setup form with the same endpoint, medium, and depth, then start a fresh run."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={retryHref}
              className={`inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${focusRingClass}`}
            >
              Reopen setup
            </Link>
            <Link
              href="/docs"
              className={`inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted ${focusRingClass}`}
            >
              Read the docs
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}

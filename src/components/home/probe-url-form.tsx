"use client";

import Link from "next/link";
import { useId, useState } from "react";

function parseAgentUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function ProbeUrlForm() {
  const statusId = useId();
  const [endpoint, setEndpoint] = useState("");
  const [submittedHost, setSubmittedHost] = useState<string | null>(null);

  const parsedUrl = parseAgentUrl(endpoint.trim());
  const isValid = parsedUrl !== null;

  return (
    <form
      className="w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();

        if (!parsedUrl) {
          return;
        }

        setSubmittedHost(parsedUrl.host);
      }}
    >
      <label htmlFor="agent-server-url" className="sr-only">
        Agent server URL
      </label>

      <div className="rounded-[1.35rem] border border-border/90 bg-white/90 p-1.5 shadow-[0_18px_60px_rgba(12,12,9,0.04)] backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="agent-server-url"
            name="agentServerUrl"
            type="url"
            value={endpoint}
            onChange={(event) => {
              setEndpoint(event.target.value);
              setSubmittedHost(null);
            }}
            autoComplete="off"
            inputMode="url"
            spellCheck={false}
            placeholder="https://agent.example.com/v1/generate…"
            aria-describedby={statusId}
            className="min-w-0 flex-1 rounded-[1rem] border border-transparent bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none"
          />

          <button
            type="submit"
            disabled={!isValid}
            className="rounded-[1rem] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Probe Agent
          </button>
        </div>
      </div>

      <p
        id={statusId}
        aria-live="polite"
        className="mt-2 min-h-5 text-xs text-muted-foreground"
      >
        {submittedHost ? (
          <>
            Custom probing for{" "}
            <span className="font-medium text-foreground">{submittedHost}</span>{" "}
            is coming soon. Read the{" "}
            <Link
              href="/docs"
              className="text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              documentation
            </Link>{" "}
            for the current flow.
          </>
        ) : (
          " "
        )}
      </p>
    </form>
  );
}

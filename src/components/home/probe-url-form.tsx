"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

function parseAgentUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "ws:" ||
      parsed.protocol === "wss:"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function ProbeUrlForm() {
  const router = useRouter();
  const helperId = useId();
  const [endpoint, setEndpoint] = useState("");

  const parsedUrl = parseAgentUrl(endpoint.trim());
  const isValid = parsedUrl !== null;

  return (
    <form
      className="mx-auto w-full max-w-[42rem]"
      onSubmit={(event) => {
        event.preventDefault();

        if (!parsedUrl) {
          return;
        }

        router.push(
          `/probe/new?endpoint=${encodeURIComponent(parsedUrl.toString())}`,
        );
      }}
    >
      <label htmlFor="agent-server-url" className="sr-only">
        Agent server URL
      </label>

      <div className="rounded-xl border border-border/90 bg-white/88 p-1.5 shadow-[0_20px_64px_rgba(12,12,9,0.045)] backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            id="agent-server-url"
            name="agentServerUrl"
            type="text"
            value={endpoint}
            onChange={(event) => {
              setEndpoint(event.target.value);
            }}
            autoComplete="off"
            inputMode="url"
            spellCheck={false}
            placeholder="https://agent.example.com/v1/generate or wss://agent.example.com/live"
            aria-describedby={helperId}
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-border focus:outline-none"
          />

          <button
            type="submit"
            disabled={!isValid}
            className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Set Up Demo
          </button>
        </div>
      </div>

      <p
        id={helperId}
        className="mt-2.5 text-center text-xs text-muted-foreground"
      >
        Open the demo setup for website or music and preview the intended probe
        flow.
      </p>
    </form>
  );
}

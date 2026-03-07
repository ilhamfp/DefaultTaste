"use client";

import { useState, useEffect, useCallback } from "react";
import type { ArtifactEntry } from "@/lib/types";

const PER_PAGE = 9;

function ArtifactCard({
  artifact,
  agentId,
  onExpand,
}: {
  artifact: ArtifactEntry;
  agentId: string;
  onExpand: () => void;
}) {
  return (
    <button
      onClick={onExpand}
      className="group w-full rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl border-b border-border bg-white">
        <iframe
          src={`/artifacts/${agentId}/${artifact.id}.html`}
          sandbox="allow-scripts"
          loading="lazy"
          title={`Artifact ${artifact.run_index}`}
          className="h-[600px] w-[800px] origin-top-left"
          style={{
            transform: "scale(0.375)",
            pointerEvents: "none",
          }}
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            #{artifact.run_index}
          </span>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            {artifact.theme}
          </span>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            {artifact.layout_type.replace(/-/g, " ")}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-foreground">{artifact.primary_font}</p>
        <div className="mt-2 flex gap-1">
          {artifact.dominant_colors.slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </button>
  );
}

function ArtifactModal({
  artifact,
  agentId,
  onClose,
}: {
  artifact: ArtifactEntry;
  agentId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">
              #{artifact.run_index}
            </span>
            <span className="text-sm text-foreground">
              {artifact.primary_font}
            </span>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {artifact.theme}
            </span>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {artifact.layout_type.replace(/-/g, " ")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <iframe
            src={`/artifacts/${agentId}/${artifact.id}.html`}
            sandbox="allow-scripts"
            title={`Artifact ${artifact.run_index}`}
            className="h-[70vh] w-full"
          />
        </div>
        {artifact.overall_impression && (
          <div className="border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {artifact.overall_impression}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ArtifactsViewer({ agentId }: { agentId: string }) {
  const [artifacts, setArtifacts] = useState<ArtifactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<ArtifactEntry | null>(null);

  useEffect(() => {
    fetch(`/api/artifacts/${agentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setArtifacts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agentId]);

  const totalPages = Math.ceil(artifacts.length / PER_PAGE);
  const pageArtifacts = artifacts.slice(
    page * PER_PAGE,
    (page + 1) * PER_PAGE,
  );

  const handleClose = useCallback(() => setExpanded(null), []);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading artifacts...</p>
    );
  }

  if (artifacts.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageArtifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.id}
            artifact={artifact}
            agentId={agentId}
            onExpand={() => setExpanded(artifact)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            Prev
          </button>
          <span className="font-mono text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {expanded && (
        <ArtifactModal
          artifact={expanded}
          agentId={agentId}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

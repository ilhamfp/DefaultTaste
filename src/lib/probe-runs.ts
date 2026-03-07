import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  ACTIVE_PROBE_RUN_STATUSES,
  PROBE_TRANSPORT_NOTES,
} from "./probe-config";
import type { AgentProfile, ProbeRun, ProbeRunSettings } from "./types";

const RUNS_ROOT = path.join(process.cwd(), "data", "runs");
const STALLED_RUN_MS = 20_000;

function getRunDir(runId: string) {
  return path.join(RUNS_ROOT, runId);
}

function getRunFilePath(runId: string) {
  return path.join(getRunDir(runId), "run.json");
}

async function ensureRunsRoot() {
  await fs.mkdir(RUNS_ROOT, { recursive: true });
}

async function writeJsonAtomic(filePath: string, value: unknown) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

function nowIso() {
  return new Date().toISOString();
}

function isActiveRunStatus(status: ProbeRun["status"]) {
  return ACTIVE_PROBE_RUN_STATUSES.includes(status);
}

export async function createProbeRun(settings: ProbeRunSettings) {
  await ensureRunsRoot();

  const runId = randomUUID().replace(/-/g, "");
  const createdAt = nowIso();
  const runDir = getRunDir(runId);

  const run: ProbeRun = {
    id: runId,
    settings,
    status: "queued",
    createdAt,
    updatedAt: createdAt,
    startedAt: null,
    completedAt: null,
    error: null,
    transportLabel: PROBE_TRANSPORT_NOTES[settings.media],
    workerPid: null,
    resultProfilePath: null,
    progress: {
      current: 0,
      total: 0,
      percent: 0,
      message: "Waiting to start.",
    },
  };

  await fs.mkdir(runDir, { recursive: true });
  await writeJsonAtomic(getRunFilePath(runId), run);

  return run;
}

export async function readProbeRun(runId: string) {
  try {
    const raw = await fs.readFile(getRunFilePath(runId), "utf8");
    return JSON.parse(raw) as ProbeRun;
  } catch {
    return null;
  }
}

export async function updateProbeRun(
  runId: string,
  updater: (run: ProbeRun) => ProbeRun,
) {
  const current = await readProbeRun(runId);

  if (!current) {
    return null;
  }

  const next = updater(current);
  next.updatedAt = nowIso();
  await writeJsonAtomic(getRunFilePath(runId), next);
  return next;
}

export async function readProbeRunProfile(run: ProbeRun) {
  if (!run.resultProfilePath) {
    return null;
  }

  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), run.resultProfilePath),
      "utf8",
    );
    return JSON.parse(raw) as AgentProfile;
  } catch {
    return null;
  }
}

export async function markProbeRunInterrupted(runId: string, error: string) {
  return updateProbeRun(runId, (run) => ({
    ...run,
    status: "interrupted",
    error,
    workerPid: null,
  }));
}

export async function refreshProbeRunState(runId: string) {
  const run = await readProbeRun(runId);

  if (!run || !isActiveRunStatus(run.status)) {
    return run;
  }

  if (run.workerPid) {
    try {
      process.kill(run.workerPid, 0);
      return run;
    } catch {
      return markProbeRunInterrupted(
        runId,
        "The background process stopped unexpectedly.",
      );
    }
  }

  if (Date.now() - new Date(run.updatedAt).getTime() > STALLED_RUN_MS) {
    return markProbeRunInterrupted(
      runId,
      "The probe run stalled before finishing.",
    );
  }

  return run;
}

export async function startProbeRunWorker(runId: string) {
  const python = process.env.PYTHON_BIN || "python3";
  const child = spawn(python, ["scripts/run_probe.py", "--run-id", runId], {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore",
  });

  child.unref();

  if (!child.pid) {
    throw new Error("Worker process failed to start.");
  }

  await updateProbeRun(runId, (run) => ({
    ...run,
    workerPid: child.pid ?? null,
  }));

  return child.pid;
}

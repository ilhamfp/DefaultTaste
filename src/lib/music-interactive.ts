import { promises as fs } from "node:fs";
import path from "node:path";
import type { LyriaInteractiveProfile } from "@/lib/types";

const MUSIC_ROOT = path.join(process.cwd(), "data", "music");
const RAW_DIR = path.join(MUSIC_ROOT, "raw");
const PARSED_DIR = path.join(MUSIC_ROOT, "parsed");
const AUDIO_FILE_ID_PATTERN = /^c\d+_s\d+$/;
const CHAIN_FILE_ID_PATTERN = /^(c\d+)_s(\d+)$/;
const SELECTION_REASON =
  "Closest to the aggregate default across tempo, brightness, density, and rolloff.";

type RawRunMetadata = {
  audio_duration_seconds?: number;
  evaluation?: {
    liked?: boolean;
  } | null;
};

type ParsedRunMetadata = {
  file_id?: string;
  bpm?: number;
  key?: string;
  spectral_centroid_hz?: number;
  rms_energy?: number;
  spectral_rolloff_hz?: number;
  genre?: string;
  sub_genre?: string;
  mood?: string;
  tempo_feel?: string;
  production_style?: string;
  cultural_origin?: string;
};

type SelectedRunCandidate = {
  fileId: string;
  chainId: string;
  step: number;
  liked: boolean;
  audioDurationSeconds: number;
  bpm: number;
  key: string;
  spectralCentroidHz: number;
  rmsEnergy: number;
  spectralRolloffHz: number;
  genre: string;
  subGenre: string;
  mood: string;
  tempoFeel: string;
  productionStyle: string;
  culturalOrigin: string;
};

function parseChainFileId(fileId: string) {
  const match = CHAIN_FILE_ID_PATTERN.exec(fileId);

  if (!match) {
    return null;
  }

  return {
    chainId: match[1],
    step: Number(match[2]),
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

async function listMatchingFiles(directoryPath: string, pattern: RegExp) {
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && pattern.test(entry.name))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

async function readJson<T>(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function selectParsedRunsByChain(items: SelectedRunCandidate[]) {
  const grouped = new Map<string, SelectedRunCandidate[]>();

  for (const item of items) {
    const current = grouped.get(item.chainId) ?? [];
    current.push(item);
    grouped.set(item.chainId, current);
  }

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([, chainItems]) => {
      const sorted = [...chainItems].sort(
        (a, b) => b.step - a.step || a.fileId.localeCompare(b.fileId),
      );
      const liked = sorted.find((item) => item.liked);
      return liked ?? sorted[0];
    });
}

function computeStats(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const standardDeviation = Math.sqrt(variance) || 1;

  return { mean, standardDeviation };
}

export async function getLyriaInteractiveProfile() {
  const [rawFiles, parsedFiles] = await Promise.all([
    listMatchingFiles(RAW_DIR, /^c\d+_s\d+\.json$/),
    listMatchingFiles(PARSED_DIR, /^c\d+_s\d+\.json$/),
  ]);

  if (parsedFiles.length === 0) {
    return null;
  }

  const parsedEntries = await Promise.all(
    parsedFiles.map(async (fileName) => {
      const parsedPath = path.join(PARSED_DIR, fileName);
      const rawPath = path.join(RAW_DIR, fileName);
      const parsed = await readJson<ParsedRunMetadata>(parsedPath);

      let raw: RawRunMetadata = {};
      try {
        raw = await readJson<RawRunMetadata>(rawPath);
      } catch {
        raw = {};
      }

      const fileId = parsed.file_id ?? fileName.replace(/\.json$/, "");
      const chain = parseChainFileId(fileId);

      if (!chain) {
        return null;
      }

      if (
        !isFiniteNumber(parsed.bpm) ||
        !isFiniteNumber(parsed.spectral_centroid_hz) ||
        !isFiniteNumber(parsed.rms_energy) ||
        !isFiniteNumber(parsed.spectral_rolloff_hz)
      ) {
        return null;
      }

      return {
        fileId,
        chainId: chain.chainId,
        step: chain.step,
        liked: raw.evaluation?.liked === true,
        audioDurationSeconds: isFiniteNumber(raw.audio_duration_seconds)
          ? raw.audio_duration_seconds
          : 0,
        bpm: parsed.bpm,
        key: parsed.key ?? "Unknown",
        spectralCentroidHz: parsed.spectral_centroid_hz,
        rmsEnergy: parsed.rms_energy,
        spectralRolloffHz: parsed.spectral_rolloff_hz,
        genre: parsed.genre ?? "Unknown",
        subGenre: parsed.sub_genre ?? "Unknown",
        mood: parsed.mood ?? "Unknown",
        tempoFeel: parsed.tempo_feel ?? "moderate",
        productionStyle: parsed.production_style ?? "Unknown",
        culturalOrigin: parsed.cultural_origin ?? "Unknown",
      } satisfies SelectedRunCandidate;
    }),
  );

  const selectedRuns = selectParsedRunsByChain(
    parsedEntries.filter((entry): entry is SelectedRunCandidate => entry !== null),
  );

  if (selectedRuns.length === 0) {
    return null;
  }

  const bpmStats = computeStats(selectedRuns.map((item) => item.bpm));
  const centroidStats = computeStats(
    selectedRuns.map((item) => item.spectralCentroidHz),
  );
  const energyStats = computeStats(selectedRuns.map((item) => item.rmsEnergy));
  const rolloffStats = computeStats(
    selectedRuns.map((item) => item.spectralRolloffHz),
  );

  const representativeRun = [...selectedRuns]
    .map((item) => {
      const distance = Math.sqrt(
        ((item.bpm - bpmStats.mean) / bpmStats.standardDeviation) ** 2 +
          ((item.spectralCentroidHz - centroidStats.mean) /
            centroidStats.standardDeviation) **
            2 +
          ((item.rmsEnergy - energyStats.mean) / energyStats.standardDeviation) **
            2 +
          ((item.spectralRolloffHz - rolloffStats.mean) /
            rolloffStats.standardDeviation) **
            2,
      );

      return { distance, item };
    })
    .sort(
      (a, b) =>
        a.distance - b.distance || a.item.fileId.localeCompare(b.item.fileId),
    )[0]?.item;

  if (!representativeRun) {
    return null;
  }

  return {
    agentId: "lyria",
    rawRunCount: rawFiles.length,
    parsedRunCount: parsedFiles.length,
    selectionMethod: "centroid_distance",
    representativeRun: {
      fileId: representativeRun.fileId,
      audioUrl: `/api/music/audio/${representativeRun.fileId}`,
      audioDurationSeconds: representativeRun.audioDurationSeconds,
      bpm: representativeRun.bpm,
      key: representativeRun.key,
      genre: representativeRun.genre,
      subGenre: representativeRun.subGenre,
      mood: representativeRun.mood,
      tempoFeel: representativeRun.tempoFeel,
      productionStyle: representativeRun.productionStyle,
      culturalOrigin: representativeRun.culturalOrigin,
      liked: representativeRun.liked,
      selectionReason: SELECTION_REASON,
    },
  } satisfies LyriaInteractiveProfile;
}

export function isValidMusicFileId(fileId: string) {
  return AUDIO_FILE_ID_PATTERN.test(fileId);
}

export function getMusicAudioFilePath(fileId: string) {
  return path.join(MUSIC_ROOT, "audio", `${fileId}.wav`);
}

export interface TasteEntry {
  name: string;
  count: number;
  percentage: number;
}

export interface ColorEntry {
  hex: string;
  name: string;
  count: number;
  percentage: number;
}

export interface BpmStats {
  avg: number;
  median: number;
  min: number;
  max: number;
  std_dev: number;
  histogram: { range: string; count: number }[];
}

export interface VisualFeatures {
  has_animations_pct: number;
  has_gradients_pct: number;
  has_shadows_pct: number;
  hover_effects_pct: number;
  avg_density: number;
  avg_whitespace: number;
  avg_code_quality: number;
}

export interface PersonalityProfile {
  boldness: number;
  originality: number;
  sophistication: number;
  playfulness: number;
  minimalism: number;
  warmth: number;
  professionalism: number;
  trendiness: number;
}

export interface WebsiteProfile {
  colors: ColorEntry[];
  fonts: TasteEntry[];
  layouts: TasteEntry[];
  layout_techniques: TasteEntry[];
  dark_mode_percentage: number;
  visual_features: VisualFeatures;
  color_warmth: TasteEntry[];
  emotional_mood: TasteEntry[];
  content_tone: TasteEntry[];
  design_philosophy: TasteEntry[];
  personality: PersonalityProfile;
  frameworks?: TasteEntry[];
  libraries?: TasteEntry[];
}

export interface MusicProfile {
  bpm: BpmStats;
  keys: TasteEntry[];
  genres: TasteEntry[];
  moods: TasteEntry[];
  instruments: TasteEntry[];
  cultural_origins: TasteEntry[];
  brightness: { avg: number; label: string };
  density: { avg: number; label: string };
}

export interface AgentProfile {
  id: string;
  name: string;
  model: string;
  probe_type: "website" | "music";
  probe_count: number;
  date: string;
  website_profile?: WebsiteProfile;
  music_profile?: MusicProfile;
  correction_prompt: string;
}

export interface LyriaRepresentativeRun {
  fileId: string;
  audioUrl: string;
  audioDurationSeconds: number;
  bpm: number;
  key: string;
  genre: string;
  subGenre: string;
  mood: string;
  tempoFeel: string;
  productionStyle: string;
  culturalOrigin: string;
  liked: boolean;
  selectionReason: string;
}

export interface LyriaInteractiveProfile {
  agentId: "lyria";
  rawRunCount: number;
  parsedRunCount: number;
  selectionMethod: "centroid_distance";
  representativeRun: LyriaRepresentativeRun;
}

export interface AgentSummaryStat {
  label: string;
  value: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  model: string;
  probeTypeLabel: string;
  probeCount: number;
  keyStats: AgentSummaryStat[];
}

export interface ArtifactEntry {
  id: string;
  run_index: number;
  overall_impression: string;
  primary_font: string;
  theme: string;
  layout_type: string;
  dominant_colors: string[];
}

export type ProbeMedia = "website" | "music";

export type ProbeDepth = "quick" | "standard" | "deep";

export type ProbeRunStatus =
  | "queued"
  | "validating"
  | "probing"
  | "analyzing"
  | "aggregating"
  | "generating_correction_prompt"
  | "completed"
  | "failed"
  | "interrupted";

export interface ProbeRunProgress {
  current: number;
  total: number;
  percent: number;
  message: string | null;
}

export interface ProbeRunSettings {
  endpointUrl: string;
  label: string | null;
  description: string | null;
  media: ProbeMedia;
  depth: ProbeDepth;
}

export interface ProbeRun {
  id: string;
  settings: ProbeRunSettings;
  status: ProbeRunStatus;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  transportLabel: string;
  workerPid: number | null;
  resultProfilePath: string | null;
  progress: ProbeRunProgress;
}

export interface ProbeRunResponse {
  run: ProbeRun;
  profile: AgentProfile | null;
}

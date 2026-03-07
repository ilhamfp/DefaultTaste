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

export interface WebsiteProfile {
  frameworks: TasteEntry[];
  css_frameworks: TasteEntry[];
  colors: ColorEntry[];
  fonts: TasteEntry[];
  layouts: TasteEntry[];
  libraries: TasteEntry[];
  dark_mode_percentage: number;
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

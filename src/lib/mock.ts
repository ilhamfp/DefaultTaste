import { AgentProfile } from "./types";

export const mockProfiles: Record<string, AgentProfile> = {
  "gemini-flash": {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash",
    probe_type: "website",
    probe_count: 94,
    date: "2026-03-07",
    website_profile: {
      colors: [
        { hex: "#f4f4f9", name: "Lavender Gray", count: 40, percentage: 14.2 },
        { hex: "#333333", name: "Charcoal", count: 35, percentage: 12.4 },
        { hex: "#007bff", name: "Blue", count: 28, percentage: 9.9 },
        { hex: "#ffffff", name: "White", count: 25, percentage: 8.9 },
        { hex: "#6366f1", name: "Indigo", count: 18, percentage: 6.4 },
        { hex: "#3498db", name: "Dodger Blue", count: 15, percentage: 5.3 },
      ],
      fonts: [
        { name: "Segoe UI", count: 40, percentage: 42.6 },
        { name: "Arial", count: 30, percentage: 31.9 },
        { name: "Roboto", count: 10, percentage: 10.6 },
        { name: "Inter", count: 8, percentage: 8.5 },
        { name: "System Default", count: 6, percentage: 6.4 },
      ],
      layouts: [
        { name: "Single Section", count: 50, percentage: 53.2 },
        { name: "Landing Page", count: 25, percentage: 26.6 },
        { name: "Card Grid", count: 12, percentage: 12.8 },
        { name: "Dashboard", count: 7, percentage: 7.4 },
      ],
      layout_techniques: [
        { name: "Flexbox", count: 70, percentage: 74.5 },
        { name: "Mixed", count: 15, percentage: 16.0 },
        { name: "None", count: 9, percentage: 9.6 },
      ],
      dark_mode_percentage: 15,
      visual_features: {
        has_animations_pct: 12,
        has_gradients_pct: 25,
        has_shadows_pct: 80,
        hover_effects_pct: 65,
        avg_density: 4.2,
        avg_whitespace: 6.5,
        avg_code_quality: 7.8,
      },
      color_warmth: [
        { name: "Cool", count: 45, percentage: 47.9 },
        { name: "Neutral", count: 35, percentage: 37.2 },
        { name: "Warm", count: 14, percentage: 14.9 },
      ],
      emotional_mood: [
        { name: "Calm", count: 55, percentage: 58.5 },
        { name: "Energetic", count: 15, percentage: 16.0 },
        { name: "Playful", count: 12, percentage: 12.8 },
        { name: "Serious", count: 8, percentage: 8.5 },
        { name: "Clinical", count: 4, percentage: 4.3 },
      ],
      content_tone: [
        { name: "Casual", count: 40, percentage: 42.6 },
        { name: "Professional", count: 30, percentage: 31.9 },
        { name: "Technical", count: 15, percentage: 16.0 },
        { name: "Marketing", count: 9, percentage: 9.6 },
      ],
      design_philosophy: [
        { name: "Minimalist", count: 70, percentage: 74.5 },
        { name: "Balanced", count: 24, percentage: 25.5 },
      ],
      personality: {
        boldness: 3.5,
        originality: 2.8,
        sophistication: 5.2,
        playfulness: 3.0,
        minimalism: 7.5,
        warmth: 4.0,
        professionalism: 7.0,
        trendiness: 4.5,
      },
    },
    correction_prompt: `When generating a website, DO NOT use the following defaults:
- DO NOT use Segoe UI as the primary font
- DO NOT default to Lavender Gray, Charcoal, Blue color palettes
- DO NOT default to light mode (85% of outputs use it)
- DO NOT always create single section layouts
- DO NOT rely only on flexbox for layout

INSTEAD, try:
- Varied fonts: serif faces, display fonts, geometric sans
- Bold color choices: warm earth tones, pastels, monochrome, or high-contrast palettes
- Both light and dark themes with intentional contrast
- Diverse layouts: dashboards, editorial, card grids, split-screen
- CSS Grid for complex layouts, not just flexbox`,
  },
  "gemini-flash-lite": {
    id: "gemini-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    model: "gemini-3.1-flash-lite-preview",
    probe_type: "website",
    probe_count: 99,
    date: "2026-03-07",
    website_profile: {
      colors: [
        { hex: "#f4f4f9", name: "Lavender Gray", count: 45, percentage: 15.2 },
        { hex: "#ffffff", name: "White", count: 40, percentage: 13.5 },
        { hex: "#333333", name: "Charcoal", count: 30, percentage: 10.1 },
        { hex: "#3498db", name: "Dodger Blue", count: 22, percentage: 7.4 },
        { hex: "#6366f1", name: "Indigo", count: 18, percentage: 6.1 },
      ],
      fonts: [
        { name: "Segoe UI", count: 55, percentage: 55.6 },
        { name: "Arial", count: 25, percentage: 25.3 },
        { name: "Roboto", count: 10, percentage: 10.1 },
        { name: "Inter", count: 9, percentage: 9.1 },
      ],
      layouts: [
        { name: "Single Section", count: 55, percentage: 55.6 },
        { name: "Landing Page", count: 22, percentage: 22.2 },
        { name: "Card Grid", count: 15, percentage: 15.2 },
        { name: "Dashboard", count: 7, percentage: 7.1 },
      ],
      layout_techniques: [
        { name: "Flexbox", count: 75, percentage: 75.8 },
        { name: "Mixed", count: 15, percentage: 15.2 },
        { name: "None", count: 9, percentage: 9.1 },
      ],
      dark_mode_percentage: 10,
      visual_features: {
        has_animations_pct: 8,
        has_gradients_pct: 20,
        has_shadows_pct: 85,
        hover_effects_pct: 70,
        avg_density: 3.8,
        avg_whitespace: 7.0,
        avg_code_quality: 7.5,
      },
      color_warmth: [
        { name: "Cool", count: 50, percentage: 50.5 },
        { name: "Neutral", count: 35, percentage: 35.4 },
        { name: "Warm", count: 14, percentage: 14.1 },
      ],
      emotional_mood: [
        { name: "Calm", count: 60, percentage: 60.6 },
        { name: "Energetic", count: 15, percentage: 15.2 },
        { name: "Playful", count: 12, percentage: 12.1 },
        { name: "Serious", count: 8, percentage: 8.1 },
        { name: "Clinical", count: 4, percentage: 4.0 },
      ],
      content_tone: [
        { name: "Casual", count: 50, percentage: 50.5 },
        { name: "Professional", count: 25, percentage: 25.3 },
        { name: "Technical", count: 15, percentage: 15.2 },
        { name: "Marketing", count: 9, percentage: 9.1 },
      ],
      design_philosophy: [
        { name: "Minimalist", count: 75, percentage: 75.8 },
        { name: "Balanced", count: 24, percentage: 24.2 },
      ],
      personality: {
        boldness: 3.0,
        originality: 2.5,
        sophistication: 4.8,
        playfulness: 3.2,
        minimalism: 7.8,
        warmth: 3.8,
        professionalism: 7.2,
        trendiness: 4.0,
      },
    },
    correction_prompt: `When generating a website, DO NOT use the following defaults:
- DO NOT use Segoe UI as the primary font
- DO NOT default to Lavender Gray, White, Charcoal color palettes
- DO NOT default to light mode (90% of outputs use it)
- DO NOT always create single section layouts
- DO NOT rely only on flexbox for layout

INSTEAD, try:
- Varied fonts: serif faces, display fonts, geometric sans
- Bold color choices: warm earth tones, pastels, monochrome, or high-contrast palettes
- Both light and dark themes with intentional contrast
- Diverse layouts: dashboards, editorial, card grids, split-screen
- CSS Grid for complex layouts, not just flexbox`,
  },
  lyria: {
    id: "lyria",
    name: "Lyria RealTime",
    model: "lyria-realtime-exp",
    probe_type: "music",
    probe_count: 20,
    date: "2026-03-07",
    music_profile: {
      bpm: {
        avg: 118.5,
        median: 120,
        min: 85,
        max: 145,
        std_dev: 14.2,
        histogram: [
          { range: "80-90", count: 1 },
          { range: "90-100", count: 2 },
          { range: "100-110", count: 3 },
          { range: "110-120", count: 6 },
          { range: "120-130", count: 5 },
          { range: "130-140", count: 2 },
          { range: "140-150", count: 1 },
        ],
      },
      keys: [
        { name: "C Major", count: 7, percentage: 35 },
        { name: "G Major", count: 4, percentage: 20 },
        { name: "A Minor", count: 3, percentage: 15 },
        { name: "D Major", count: 2, percentage: 10 },
        { name: "F Major", count: 2, percentage: 10 },
        { name: "E Minor", count: 2, percentage: 10 },
      ],
      genres: [
        { name: "Pop", count: 7, percentage: 35 },
        { name: "Electronic", count: 5, percentage: 25 },
        { name: "Ambient", count: 3, percentage: 15 },
        { name: "Lo-Fi", count: 3, percentage: 15 },
        { name: "Rock", count: 2, percentage: 10 },
      ],
      moods: [
        { name: "Uplifting", count: 8, percentage: 40 },
        { name: "Chill", count: 5, percentage: 25 },
        { name: "Energetic", count: 4, percentage: 20 },
        { name: "Melancholic", count: 2, percentage: 10 },
        { name: "Dark", count: 1, percentage: 5 },
      ],
      instruments: [
        { name: "Synth Pads", count: 14, percentage: 70 },
        { name: "Piano", count: 12, percentage: 60 },
        { name: "Drums (Electronic)", count: 11, percentage: 55 },
        { name: "Bass (Synth)", count: 10, percentage: 50 },
        { name: "Strings", count: 7, percentage: 35 },
        { name: "Guitar (Acoustic)", count: 4, percentage: 20 },
        { name: "Vocals (Choir)", count: 3, percentage: 15 },
      ],
      cultural_origins: [
        { name: "Western Pop", count: 17, percentage: 85 },
        { name: "Japanese", count: 1, percentage: 5 },
        { name: "Latin", count: 1, percentage: 5 },
        { name: "African", count: 1, percentage: 5 },
      ],
      brightness: { avg: 6.8, label: "Bright" },
      density: { avg: 5.5, label: "Medium" },
    },
    correction_prompt: `When generating music, DO NOT use the following defaults:
- DO NOT default to 115-125 BPM range
- DO NOT always use C Major or G Major
- DO NOT default to Pop or Electronic genres
- DO NOT overuse synth pads and electronic drums
- DO NOT default to "uplifting" or "chill" moods
- DO NOT default to Western pop conventions

INSTEAD, try:
- Varied tempos: slow (60-80 BPM) or fast (140-180 BPM)
- Uncommon keys: Bb Minor, F# Major, Db Major
- Underrepresented genres: Jazz, Classical, Afrobeat, Bossa Nova
- Acoustic instruments: tabla, koto, oud, marimba, cello
- Complex moods: bittersweet, nostalgic, unsettling, triumphant
- Non-Western musical traditions and scales`,
  },
};

import { AgentProfile } from "./types";

export const mockProfiles: Record<string, AgentProfile> = {
  "gemini-flash": {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    model: "gemini-2.5-flash-preview",
    probe_type: "website",
    probe_count: 100,
    date: "2026-03-07",
    website_profile: {
      frameworks: [
        { name: "React", count: 78, percentage: 78 },
        { name: "Vanilla HTML", count: 12, percentage: 12 },
        { name: "Vue", count: 6, percentage: 6 },
        { name: "Svelte", count: 4, percentage: 4 },
      ],
      css_frameworks: [
        { name: "Tailwind CSS", count: 65, percentage: 65 },
        { name: "Vanilla CSS", count: 18, percentage: 18 },
        { name: "Bootstrap", count: 10, percentage: 10 },
        { name: "Material UI", count: 7, percentage: 7 },
      ],
      colors: [
        { hex: "#7C3AED", name: "Purple / Violet", count: 34, percentage: 34 },
        { hex: "#3B82F6", name: "Blue", count: 28, percentage: 28 },
        { hex: "#6366F1", name: "Indigo", count: 18, percentage: 18 },
        { hex: "#10B981", name: "Green / Emerald", count: 12, percentage: 12 },
        { hex: "#F59E0B", name: "Amber / Yellow", count: 5, percentage: 5 },
        { hex: "#EF4444", name: "Red", count: 3, percentage: 3 },
      ],
      fonts: [
        { name: "Inter", count: 62, percentage: 62 },
        { name: "Roboto", count: 14, percentage: 14 },
        { name: "Space Grotesk", count: 9, percentage: 9 },
        { name: "Poppins", count: 8, percentage: 8 },
        { name: "System Default", count: 7, percentage: 7 },
      ],
      layouts: [
        { name: "Landing Page", count: 55, percentage: 55 },
        { name: "Dashboard", count: 22, percentage: 22 },
        { name: "Portfolio", count: 13, percentage: 13 },
        { name: "Blog", count: 10, percentage: 10 },
      ],
      libraries: [
        { name: "Framer Motion", count: 45, percentage: 45 },
        { name: "Lucide Icons", count: 38, percentage: 38 },
        { name: "React Icons", count: 22, percentage: 22 },
        { name: "Axios", count: 18, percentage: 18 },
        { name: "Zustand", count: 12, percentage: 12 },
      ],
      dark_mode_percentage: 72,
    },
    correction_prompt: `When generating a website, DO NOT use the following defaults:
- DO NOT use purple, violet, or indigo as primary colors
- DO NOT use Inter, Roboto, or Space Grotesk fonts
- DO NOT default to dark mode or dark backgrounds
- DO NOT use rounded-lg or rounded-xl border radius
- DO NOT add box shadows to cards
- DO NOT center the hero section with subtitle + CTA pattern
- DO NOT place 3 feature cards in a row with icons
- DO NOT use gradient text effects

INSTEAD, use:
- White and soft neutral surfaces with a restrained teal accent
- Noto Serif for headlines, Geist for interface copy, and Geist Mono for data labels
- Light backgrounds with subtle border-defined sections
- Medium radius cards and inputs (rounded-lg to rounded-xl)
- Minimal shadows and clear structure over decorative effects
- Research-forward layouts with concise content hierarchy`,
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

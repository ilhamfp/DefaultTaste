#!/usr/bin/env python3
"""Transform rawwebdata2/ into DefaultTaste profile format.

Reads rawwebdata2/experiment.json + HTML files, splits by model,
aggregates stats, and outputs profile.json + artifacts.json per model.
Also copies HTML files into public/artifacts/{agentId}/.
"""

import json
import os
import shutil
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "rawwebdata2"
DATA_DIR = ROOT / "data" / "websites"
PUBLIC_DIR = ROOT / "public" / "artifacts"

MODEL_TO_AGENT = {
    "google/gemini-2.0-flash-lite-001": {
        "id": "gemini-2-flash-lite",
        "name": "Gemini 2.0 Flash Lite",
        "model": "gemini-2.0-flash-lite-001",
    },
}

# Hex -> human-readable color name lookup
COLOR_NAMES = {
    "#000000": "Black",
    "#111111": "Near Black",
    "#1a1a1a": "Charcoal",
    "#1a1a2e": "Dark Navy",
    "#1e1e2e": "Dark Slate",
    "#1e3a5f": "Dark Blue",
    "#222222": "Dark Gray",
    "#2c2c2c": "Dark Gray",
    "#2c3e50": "Dark Teal",
    "#2d2d2d": "Dark Gray",
    "#2e86c1": "Steel Blue",
    "#2ecc71": "Emerald",
    "#333333": "Charcoal",
    "#333": "Charcoal",
    "#3498db": "Dodger Blue",
    "#4a00e0": "Electric Purple",
    "#4a4a4a": "Gray",
    "#4caf50": "Green",
    "#555555": "Medium Gray",
    "#6366f1": "Indigo",
    "#666666": "Gray",
    "#007bff": "Blue",
    "#00bcd4": "Cyan",
    "#e74c3c": "Red",
    "#e91e63": "Pink",
    "#f39c12": "Orange",
    "#f4f4f4": "Light Gray",
    "#f4f4f9": "Lavender Gray",
    "#f5f5f5": "White Smoke",
    "#f8f8f8": "Off White",
    "#f8f9fa": "Ghost White",
    "#f0f0f0": "Light Gray",
    "#ff5733": "Red Orange",
    "#ff6b6b": "Coral",
    "#ff6347": "Tomato",
    "#ffffff": "White",
    "#fff": "White",
    "#fafafa": "Snow",
    "#1a73e8": "Google Blue",
    "#e8eaf6": "Lavender",
    "#283593": "Deep Blue",
    "#0d6efd": "Bootstrap Blue",
    "#212529": "Ink",
    "#343a40": "Dark Slate",
    "#6c757d": "Slate Gray",
    "#198754": "Success Green",
    "#dc3545": "Danger Red",
    "#ffc107": "Warning Yellow",
    "#0dcaf0": "Info Cyan",
    "#8e44ad": "Purple",
    "#9b59b6": "Amethyst",
    "#1abc9c": "Turquoise",
    "#16a085": "Dark Turquoise",
    "#27ae60": "Nephritis Green",
    "#2980b9": "Belize Blue",
    "#8b5cf6": "Violet",
    "#10b981": "Emerald",
    "#3b82f6": "Blue",
    "#ef4444": "Red",
    "#f59e0b": "Amber",
    "#14b8a6": "Teal",
    "#ec4899": "Pink",
    "#a855f7": "Purple",
    "#64748b": "Slate",
    "#0ea5e9": "Sky Blue",
    "#22c55e": "Green",
    "#eab308": "Yellow",
    "#f97316": "Orange",
    "#06b6d4": "Cyan",
    "#7c3aed": "Violet",
    "#d946ef": "Fuchsia",
    "#84cc16": "Lime",
    "#0f172a": "Slate 900",
    "#1e293b": "Slate 800",
    "#334155": "Slate 700",
    "#475569": "Slate 600",
    "#94a3b8": "Slate 400",
    "#cbd5e1": "Slate 300",
    "#e2e8f0": "Slate 200",
    "#f1f5f9": "Slate 100",
}


def name_color(hex_val: str) -> str:
    """Return a human-readable name for a hex color."""
    h = hex_val.lower().strip()
    if h in COLOR_NAMES:
        return COLOR_NAMES[h]
    # Try to categorize by hue
    if len(h) == 4:  # #rgb -> #rrggbb
        h = "#" + h[1]*2 + h[2]*2 + h[3]*2
    try:
        r, g, b = int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)
    except (ValueError, IndexError):
        return hex_val
    brightness = (r + g + b) / 3
    if brightness > 240:
        return "White"
    if brightness < 30:
        return "Black"
    if abs(r - g) < 20 and abs(g - b) < 20:
        if brightness > 180:
            return "Light Gray"
        if brightness > 100:
            return "Gray"
        return "Dark Gray"
    max_c = max(r, g, b)
    if r == max_c and g < 100 and b < 100:
        return "Red"
    if r == max_c and g > 100:
        return "Orange" if g < 180 else "Yellow"
    if g == max_c and r < 100:
        return "Green"
    if g == max_c:
        return "Teal"
    if b == max_c and r > 100:
        return "Purple"
    if b == max_c:
        return "Blue"
    return hex_val


def normalize_font(raw: str) -> str:
    """Extract first family name from a font stack."""
    first = raw.split(",")[0].strip().strip("'\"")
    return first


def aggregate_model(artifacts: list[dict]) -> dict:
    """Aggregate evaluation data for a single model's artifacts."""
    evaluated = [a for a in artifacts if a.get("evaluation")]
    n = len(evaluated)
    if n == 0:
        return {}

    # Fonts
    font_counter: Counter = Counter()
    for a in evaluated:
        font = normalize_font(a["evaluation"]["typography"]["primary_font"])
        font_counter[font] += 1

    # Colors - flatten all dominant_colors
    color_counter: Counter = Counter()
    for a in evaluated:
        for hex_val in a["evaluation"]["color_scheme"].get("dominant_colors", []):
            color_counter[hex_val.lower()] += 1

    # Layouts
    layout_counter: Counter = Counter()
    technique_counter: Counter = Counter()
    for a in evaluated:
        layout = a["evaluation"]["layout"]
        layout_counter[layout["type"]] += 1
        technique_counter[layout.get("technique", "none")] += 1

    # Dark mode %
    dark_count = sum(
        1 for a in evaluated
        if a["evaluation"]["color_scheme"].get("theme") == "dark"
    )
    dark_mode_pct = round(dark_count / n * 100, 1)

    # Visual features
    anim_count = sum(1 for a in evaluated if a["evaluation"]["visual_style"].get("has_animations"))
    grad_count = sum(1 for a in evaluated if a["evaluation"]["visual_style"].get("has_gradients"))
    shadow_count = sum(1 for a in evaluated if a["evaluation"]["visual_style"].get("has_shadows"))
    hover_count = sum(1 for a in evaluated if a["evaluation"]["visual_style"].get("hover_effects"))
    avg_density = round(sum(a["evaluation"]["visual_style"].get("density", 5) for a in evaluated) / n, 1)
    avg_whitespace = round(sum(a["evaluation"]["spacing"].get("whitespace_amount", 5) for a in evaluated) / n, 1)
    avg_code_quality = round(sum(a["evaluation"]["code_quality"].get("overall", 5) for a in evaluated) / n, 1)

    # Color warmth
    warmth_counter: Counter = Counter()
    for a in evaluated:
        warmth_counter[a["evaluation"]["color_scheme"].get("warmth", "neutral")] += 1

    # Emotional mood
    mood_counter: Counter = Counter()
    for a in evaluated:
        mood_counter[a["evaluation"]["color_scheme"].get("emotional_mood", "neutral")] += 1

    # Content tone
    tone_counter: Counter = Counter()
    for a in evaluated:
        tone_counter[a["evaluation"]["content"].get("tone", "neutral")] += 1

    # Design philosophy
    philosophy_counter: Counter = Counter()
    for a in evaluated:
        philosophy_counter[a["evaluation"]["style_profile"].get("design_philosophy", "balanced")] += 1

    # Personality averages
    personality_keys = [
        "boldness", "originality", "sophistication", "playfulness",
        "minimalism", "warmth", "professionalism", "trendiness",
    ]
    personality = {}
    for key in personality_keys:
        vals = [a["evaluation"]["personality_profile"].get(key, 5) for a in evaluated]
        personality[key] = round(sum(vals) / len(vals), 1)

    def to_taste_entries(counter: Counter, total: int) -> list[dict]:
        return [
            {"name": name.replace("-", " ").replace("_", " ").title(), "count": count, "percentage": round(count / total * 100, 1)}
            for name, count in counter.most_common()
        ]

    def to_color_entries(counter: Counter, top_n: int = 8) -> list[dict]:
        total = sum(counter.values())
        return [
            {"hex": hex_val, "name": name_color(hex_val), "count": count, "percentage": round(count / total * 100, 1)}
            for hex_val, count in counter.most_common(top_n)
        ]

    # Build correction prompt from top defaults
    top_font = font_counter.most_common(1)[0][0] if font_counter else "system default"
    top_colors = [name_color(c) for c, _ in color_counter.most_common(3)]
    top_layout = layout_counter.most_common(1)[0][0].replace("-", " ").replace("_", " ") if layout_counter else "landing page"

    correction_prompt = f"""When generating a website, DO NOT use the following defaults:
- DO NOT use {top_font} as the primary font
- DO NOT default to {', '.join(top_colors)} color palettes
- DO NOT default to {'dark' if dark_mode_pct > 50 else 'light'} mode ({dark_mode_pct}% of outputs use it)
- DO NOT always create {top_layout} layouts
- DO NOT rely only on {technique_counter.most_common(1)[0][0] if technique_counter else 'flexbox'} for layout

INSTEAD, try:
- Varied fonts: serif faces, display fonts, geometric sans
- Bold color choices: warm earth tones, pastels, monochrome, or high-contrast palettes
- Both light and dark themes with intentional contrast
- Diverse layouts: dashboards, editorial, card grids, split-screen
- CSS Grid for complex layouts, not just flexbox"""

    return {
        "colors": to_color_entries(color_counter),
        "fonts": to_taste_entries(font_counter, n),
        "layouts": to_taste_entries(layout_counter, n),
        "layout_techniques": to_taste_entries(technique_counter, n),
        "dark_mode_percentage": dark_mode_pct,
        "visual_features": {
            "has_animations_pct": round(anim_count / n * 100, 1),
            "has_gradients_pct": round(grad_count / n * 100, 1),
            "has_shadows_pct": round(shadow_count / n * 100, 1),
            "hover_effects_pct": round(hover_count / n * 100, 1),
            "avg_density": avg_density,
            "avg_whitespace": avg_whitespace,
            "avg_code_quality": avg_code_quality,
        },
        "color_warmth": to_taste_entries(warmth_counter, n),
        "emotional_mood": to_taste_entries(mood_counter, n),
        "content_tone": to_taste_entries(tone_counter, n),
        "design_philosophy": to_taste_entries(philosophy_counter, n),
        "personality": personality,
        "correction_prompt": correction_prompt,
        "probe_count": n,
        "total_artifacts": len(artifacts),
    }


def build_artifact_manifest(artifacts: list[dict]) -> list[dict]:
    """Build lightweight artifact manifest for the viewer."""
    manifest = []
    for a in artifacts:
        entry = {
            "id": a["id"],
            "run_index": a["run_index"],
        }
        if a.get("evaluation"):
            ev = a["evaluation"]
            entry["overall_impression"] = ev.get("overall_impression", "")
            entry["primary_font"] = normalize_font(ev["typography"]["primary_font"])
            entry["theme"] = ev["color_scheme"].get("theme", "unknown")
            entry["layout_type"] = ev["layout"]["type"]
            entry["dominant_colors"] = ev["color_scheme"].get("dominant_colors", [])
        else:
            entry["overall_impression"] = "Evaluation unavailable"
            entry["primary_font"] = "Unknown"
            entry["theme"] = "unknown"
            entry["layout_type"] = "unknown"
            entry["dominant_colors"] = []
        manifest.append(entry)
    manifest.sort(key=lambda x: x["run_index"])
    return manifest


def main():
    experiment_path = RAW_DIR / "experiment.json"
    if not experiment_path.exists():
        print(f"Error: {experiment_path} not found")
        return

    with open(experiment_path) as f:
        experiment = json.load(f)

    artifacts_by_model: dict[str, list[dict]] = {}
    for artifact in experiment["artifacts"]:
        model = artifact["model"]
        artifacts_by_model.setdefault(model, []).append(artifact)

    for model, artifacts in artifacts_by_model.items():
        agent_info = MODEL_TO_AGENT.get(model)
        if not agent_info:
            print(f"Skipping unknown model: {model}")
            continue

        agent_id = agent_info["id"]
        print(f"\nProcessing {agent_info['name']} ({len(artifacts)} artifacts)...")

        # Aggregate profile
        agg = aggregate_model(artifacts)
        profile = {
            "id": agent_id,
            "name": agent_info["name"],
            "model": agent_info["model"],
            "probe_type": "website",
            "probe_count": agg["probe_count"],
            "date": "2026-03-07",
            "website_profile": {
                "colors": agg["colors"],
                "fonts": agg["fonts"],
                "layouts": agg["layouts"],
                "layout_techniques": agg["layout_techniques"],
                "dark_mode_percentage": agg["dark_mode_percentage"],
                "visual_features": agg["visual_features"],
                "color_warmth": agg["color_warmth"],
                "emotional_mood": agg["emotional_mood"],
                "content_tone": agg["content_tone"],
                "design_philosophy": agg["design_philosophy"],
                "personality": agg["personality"],
            },
            "correction_prompt": agg["correction_prompt"],
        }

        # Write profile.json
        profile_dir = DATA_DIR / agent_id
        profile_dir.mkdir(parents=True, exist_ok=True)
        profile_path = profile_dir / "profile.json"
        with open(profile_path, "w") as f:
            json.dump(profile, f, indent=2)
        print(f"  Wrote {profile_path}")

        # Write artifacts.json
        manifest = build_artifact_manifest(artifacts)
        manifest_path = profile_dir / "artifacts.json"
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"  Wrote {manifest_path} ({len(manifest)} entries)")

        # Copy HTML files to public/artifacts/{agentId}/
        html_dir = PUBLIC_DIR / agent_id
        html_dir.mkdir(parents=True, exist_ok=True)
        copied = 0
        for artifact in artifacts:
            src = RAW_DIR / f"{artifact['id']}.html"
            if src.exists():
                shutil.copy2(src, html_dir / f"{artifact['id']}.html")
                copied += 1
        print(f"  Copied {copied} HTML files to {html_dir}")

    print("\nDone!")


if __name__ == "__main__":
    main()

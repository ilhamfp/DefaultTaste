#!/usr/bin/env python3
"""DefaultTaste - Website Aggregation Script

Reads parsed website JSONs from data/websites/parsed/, computes frequency
distributions, and writes data/websites/profile.json matching the AgentProfile
TypeScript interface.

No API calls — pure data processing.
"""

import json
from collections import Counter
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PARSED_DIR = PROJECT_ROOT / "data" / "websites" / "parsed"
PROFILE_PATH = PROJECT_ROOT / "data" / "websites" / "profile.json"


def load_parsed_files() -> list[dict]:
    """Load all parsed JSON files."""
    files = sorted(PARSED_DIR.glob("*.json"))
    data = []
    for f in files:
        with open(f, "r", encoding="utf-8") as fh:
            data.append(json.load(fh))
    return data


def count_to_taste_entries(counter: Counter, total: int) -> list[dict]:
    """Convert a Counter to sorted TasteEntry list."""
    entries = []
    for name, count in counter.most_common():
        entries.append({
            "name": name,
            "count": count,
            "percentage": round(count / total * 100),
        })
    return entries


def aggregate_colors(items: list[dict]) -> list[dict]:
    """Aggregate colors across all files, counting per-file presence."""
    total = len(items)
    # Track unique (hex, name) pairs per file
    color_counter = Counter()
    for item in items:
        hexes = item.get("primary_colors", [])
        names = item.get("color_names", [])
        seen = set()
        for j, hex_val in enumerate(hexes):
            hex_lower = hex_val.lower()
            name = names[j] if j < len(names) else hex_val
            key = (hex_lower, name)
            if key not in seen:
                seen.add(key)
                color_counter[key] += 1

    entries = []
    for (hex_val, name), count in color_counter.most_common():
        entries.append({
            "hex": hex_val,
            "name": name,
            "count": count,
            "percentage": round(count / total * 100),
        })
    return entries


def generate_correction_prompt(profile: dict) -> str:
    """Auto-generate a correction prompt from observed defaults."""
    wp = profile
    lines = ["When generating a website, DO NOT use the following defaults:"]

    # Top colors
    if wp["colors"]:
        top_colors = [c["name"] for c in wp["colors"][:3]]
        lines.append(f"- DO NOT use {', '.join(top_colors)} as primary colors")

    # Top fonts
    if wp["fonts"]:
        top_fonts = [f["name"] for f in wp["fonts"][:3]]
        lines.append(f"- DO NOT use {', '.join(top_fonts)} fonts")

    # Dark mode
    if wp["dark_mode_percentage"] > 50:
        lines.append("- DO NOT default to dark mode or dark backgrounds")

    # Top framework
    if wp["frameworks"] and wp["frameworks"][0]["percentage"] > 50:
        lines.append(f"- DO NOT default to {wp['frameworks'][0]['name']}")

    # Top layout
    if wp["layouts"] and wp["layouts"][0]["percentage"] > 40:
        lines.append(f"- DO NOT default to {wp['layouts'][0]['name']} layout")

    lines.append("")
    lines.append("INSTEAD, try:")
    lines.append("- Warm earth tones, pastels, or monochrome palettes")
    lines.append("- Serif or display fonts like Playfair Display, DM Serif, or Bitter")
    lines.append("- Light backgrounds with subtle, border-defined sections")
    lines.append("- Varied layouts: magazine, documentation, e-commerce, or editorial")
    lines.append("- Minimal shadows and clear structure over decorative effects")

    return "\n".join(lines)


def run() -> None:
    """Main entry point."""
    items = load_parsed_files()
    total = len(items)

    if total == 0:
        print("No parsed files found. Run analyze_websites.py first.", flush=True)
        return

    print(f"DefaultTaste - Website Aggregation ({total} files)", flush=True)

    # Frameworks
    framework_counter = Counter(item.get("framework", "Unknown") for item in items)
    frameworks = count_to_taste_entries(framework_counter, total)

    # CSS frameworks
    css_counter = Counter(item.get("css_framework", "Unknown") for item in items)
    css_frameworks = count_to_taste_entries(css_counter, total)

    # Colors
    colors = aggregate_colors(items)

    # Fonts — take first font from each file's list
    font_counter = Counter()
    for item in items:
        fonts = item.get("fonts", [])
        if fonts:
            font_counter[fonts[0]] += 1
    fonts = count_to_taste_entries(font_counter, total)

    # Layouts
    layout_counter = Counter(item.get("layout_type", "Unknown") for item in items)
    layouts = count_to_taste_entries(layout_counter, total)

    # Libraries — flatten and count per-file presence
    lib_counter = Counter()
    for item in items:
        seen = set()
        for lib in item.get("libraries", []):
            if lib not in seen:
                seen.add(lib)
                lib_counter[lib] += 1
    libraries = count_to_taste_entries(lib_counter, total)

    # Dark mode percentage
    dark_count = sum(1 for item in items if item.get("has_dark_mode", False))
    dark_mode_percentage = round(dark_count / total * 100)

    website_profile = {
        "frameworks": frameworks,
        "css_frameworks": css_frameworks,
        "colors": colors,
        "fonts": fonts,
        "layouts": layouts,
        "libraries": libraries,
        "dark_mode_percentage": dark_mode_percentage,
    }

    correction_prompt = generate_correction_prompt(website_profile)

    profile = {
        "id": "gemini-flash",
        "name": "Gemini 2.5 Flash",
        "model": "gemini-2.5-flash",
        "probe_type": "website",
        "probe_count": total,
        "date": "2026-03-07",
        "website_profile": website_profile,
        "correction_prompt": correction_prompt,
    }

    # Write atomically
    tmp = PROFILE_PATH.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2, ensure_ascii=False)
    tmp.rename(PROFILE_PATH)

    print(f"Written: {PROFILE_PATH}", flush=True)
    print(f"  Frameworks: {[e['name'] for e in frameworks[:3]]}", flush=True)
    print(f"  Top font: {fonts[0]['name'] if fonts else 'none'} ({fonts[0]['percentage'] if fonts else 0}%)", flush=True)
    print(f"  Dark mode: {dark_mode_percentage}%", flush=True)
    print(f"  Colors: {len(colors)} unique", flush=True)


if __name__ == "__main__":
    run()

#!/usr/bin/env python3
"""Generate and verify website icon assets from the DefaultTaste SVG logo."""

from __future__ import annotations

import argparse
import shutil
import sys
from io import BytesIO
from pathlib import Path

missing_dependencies: list[str] = []

try:
    import cairosvg
except ImportError:
    missing_dependencies.append("CairoSVG")

try:
    from PIL import Image
except ImportError:
    missing_dependencies.append("Pillow")

if missing_dependencies:
    dep_list = ", ".join(missing_dependencies)
    print(f"ERROR: Missing required Python package(s): {dep_list}", file=sys.stderr)
    print("Install with: python3 -m pip install Pillow CairoSVG", file=sys.stderr)
    sys.exit(1)


PROJECT_ROOT = Path(__file__).resolve().parent.parent
PRIMARY_LOGO_SVG = PROJECT_ROOT / "logo" / "defaulttaste-logo.svg"
MONO_LOGO_SVG = PROJECT_ROOT / "logo" / "defaulttaste-logo-mono.svg"

PUBLIC_ICONS_DIR = PROJECT_ROOT / "public" / "icons"
FAVICON_ICO_PATH = PROJECT_ROOT / "src" / "app" / "favicon.ico"
SAFARI_PINNED_TAB_PATH = PUBLIC_ICONS_DIR / "safari-pinned-tab.svg"

JPG_BG_COLOR = (250, 250, 247, 255)  # #FAFAF7
MASKABLE_PADDING_RATIO = 0.20
ICO_SIZES = [16, 32, 48, 64, 128, 256]

STANDARD_PNG_SPECS: list[tuple[str, tuple[int, int]]] = [
    ("favicon-16x16.png", (16, 16)),
    ("favicon-32x32.png", (32, 32)),
    ("apple-touch-icon-120x120.png", (120, 120)),
    ("apple-touch-icon-152x152.png", (152, 152)),
    ("apple-touch-icon-167x167.png", (167, 167)),
    ("apple-touch-icon-180x180.png", (180, 180)),
    ("android-chrome-192x192.png", (192, 192)),
    ("android-chrome-512x512.png", (512, 512)),
    ("mstile-150x150.png", (150, 150)),
    ("icon-48x48.png", (48, 48)),
    ("icon-72x72.png", (72, 72)),
    ("icon-96x96.png", (96, 96)),
    ("icon-128x128.png", (128, 128)),
    ("icon-144x144.png", (144, 144)),
    ("icon-192x192.png", (192, 192)),
    ("icon-256x256.png", (256, 256)),
    ("icon-512x512.png", (512, 512)),
]

MASKABLE_PNG_SPECS: list[tuple[str, tuple[int, int]]] = [
    ("android-chrome-maskable-192x192.png", (192, 192)),
    ("android-chrome-maskable-512x512.png", (512, 512)),
]

JPG_SPECS: list[tuple[str, tuple[int, int]]] = [
    ("icon-512x512.jpg", (512, 512)),
    ("icon-1024x1024.jpg", (1024, 1024)),
    ("social-1200x630.jpg", (1200, 630)),
    ("social-1200x1200.jpg", (1200, 1200)),
]


def _relative(path: Path) -> str:
    return str(path.relative_to(PROJECT_ROOT))


def _all_generated_paths() -> list[Path]:
    paths = [FAVICON_ICO_PATH, SAFARI_PINNED_TAB_PATH]
    paths.extend(PUBLIC_ICONS_DIR / name for name, _ in STANDARD_PNG_SPECS)
    paths.extend(PUBLIC_ICONS_DIR / name for name, _ in MASKABLE_PNG_SPECS)
    paths.extend(PUBLIC_ICONS_DIR / name for name, _ in JPG_SPECS)
    return paths


def _render_svg(svg_path: Path, width: int, height: int) -> Image.Image:
    png_bytes = cairosvg.svg2png(url=str(svg_path), output_width=width, output_height=height)
    with Image.open(BytesIO(png_bytes)) as image:
        return image.convert("RGBA")


def _save_standard_png(file_name: str, width: int, height: int) -> None:
    icon = _render_svg(PRIMARY_LOGO_SVG, width, height)
    icon.save(PUBLIC_ICONS_DIR / file_name, format="PNG")


def _build_maskable_icon(size: int) -> Image.Image:
    inner = int(round(size * (1 - (2 * MASKABLE_PADDING_RATIO))))
    inner = max(inner, 1)

    foreground = _render_svg(PRIMARY_LOGO_SVG, inner, inner)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    offset_x = (size - inner) // 2
    offset_y = (size - inner) // 2
    canvas.alpha_composite(foreground, (offset_x, offset_y))
    return canvas


def _save_jpg(file_name: str, width: int, height: int) -> None:
    canvas = Image.new("RGBA", (width, height), JPG_BG_COLOR)
    side = min(width, height)
    logo = _render_svg(PRIMARY_LOGO_SVG, side, side)

    offset_x = (width - side) // 2
    offset_y = (height - side) // 2
    canvas.alpha_composite(logo, (offset_x, offset_y))

    rgb = canvas.convert("RGB")
    rgb.save(PUBLIC_ICONS_DIR / file_name, format="JPEG", quality=95, optimize=True)


def clean_outputs() -> None:
    removed = 0
    for path in _all_generated_paths():
        if path.exists():
            path.unlink()
            removed += 1

    if PUBLIC_ICONS_DIR.exists() and not any(PUBLIC_ICONS_DIR.iterdir()):
        PUBLIC_ICONS_DIR.rmdir()

    print(f"Clean complete: removed {removed} generated file(s).")


def generate_assets() -> None:
    if not PRIMARY_LOGO_SVG.exists():
        raise FileNotFoundError(f"Missing source logo: {_relative(PRIMARY_LOGO_SVG)}")
    if not MONO_LOGO_SVG.exists():
        raise FileNotFoundError(f"Missing mono logo: {_relative(MONO_LOGO_SVG)}")

    PUBLIC_ICONS_DIR.mkdir(parents=True, exist_ok=True)
    FAVICON_ICO_PATH.parent.mkdir(parents=True, exist_ok=True)

    # PNG outputs from canonical logo.
    for file_name, (width, height) in STANDARD_PNG_SPECS:
        _save_standard_png(file_name, width, height)

    # Maskable PNG outputs with 20% safe padding.
    for file_name, (width, height) in MASKABLE_PNG_SPECS:
        if width != height:
            raise ValueError(f"Maskable icon must be square: {file_name}")
        icon = _build_maskable_icon(width)
        icon.save(PUBLIC_ICONS_DIR / file_name, format="PNG")

    # JPG outputs flattened onto warm cream background.
    for file_name, (width, height) in JPG_SPECS:
        _save_jpg(file_name, width, height)

    # Safari pinned tab icon uses the monochrome source.
    shutil.copy2(MONO_LOGO_SVG, SAFARI_PINNED_TAB_PATH)

    # Multi-size favicon ICO for browser compatibility.
    largest = max(ICO_SIZES)
    base_icon = _render_svg(PRIMARY_LOGO_SVG, largest, largest)
    base_icon.save(
        FAVICON_ICO_PATH,
        format="ICO",
        sizes=[(size, size) for size in ICO_SIZES],
    )

    print("Generation complete.")
    print(f"  - Wrote favicon: {_relative(FAVICON_ICO_PATH)}")
    print(f"  - Wrote icon assets: {_relative(PUBLIC_ICONS_DIR)}")


def verify_assets() -> bool:
    errors: list[str] = []
    expected = _all_generated_paths()

    for path in expected:
        if not path.exists():
            errors.append(f"Missing file: {_relative(path)}")

    for file_name, expected_size in [*STANDARD_PNG_SPECS, *MASKABLE_PNG_SPECS]:
        path = PUBLIC_ICONS_DIR / file_name
        if not path.exists():
            continue
        with Image.open(path) as image:
            if image.size != expected_size:
                errors.append(
                    f"Wrong PNG size for {_relative(path)}: got {image.size}, expected {expected_size}"
                )

    for file_name, expected_size in JPG_SPECS:
        path = PUBLIC_ICONS_DIR / file_name
        if not path.exists():
            continue
        with Image.open(path) as image:
            if image.size != expected_size:
                errors.append(
                    f"Wrong JPG size for {_relative(path)}: got {image.size}, expected {expected_size}"
                )

    if FAVICON_ICO_PATH.exists():
        required_sizes = {(size, size) for size in ICO_SIZES}
        with Image.open(FAVICON_ICO_PATH) as image:
            ico_sizes = set()
            sizes_from_info = image.info.get("sizes")
            if sizes_from_info:
                ico_sizes = {tuple(size) for size in sizes_from_info}
            elif getattr(image, "ico", None):
                ico_sizes = {tuple(size) for size in image.ico.sizes()}

            missing_sizes = sorted(required_sizes - ico_sizes)
            if missing_sizes:
                errors.append(
                    f"ICO missing embedded sizes: {missing_sizes} in {_relative(FAVICON_ICO_PATH)}"
                )

    if errors:
        print("Verification failed:")
        for err in errors:
            print(f"  - {err}")
        return False

    print("Verification passed: all expected files and dimensions are correct.")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate and verify favicon/app icon assets from SVG sources."
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Remove generated icon files before generating.",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Run verification checks only (skip generation).",
    )
    args = parser.parse_args()

    if args.clean and args.verify:
        parser.error("--clean cannot be combined with --verify.")

    try:
        if args.clean:
            clean_outputs()

        if not args.verify:
            generate_assets()

        return 0 if verify_assets() else 1
    except Exception as exc:  # noqa: BLE001
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

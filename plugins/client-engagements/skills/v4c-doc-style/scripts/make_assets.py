"""Compose document brand assets from the v4c-deck-style source assets.

Logo and hero are placed as-is (scaled proportionally only): never recoloured,
cropped, stretched or rotated. Re-run only if the deck assets change.
Usage: python make_assets.py [deck_assets_dir] [out_dir]
The deck assets come from the first of: deck_assets_dir, V4C_DECK_ASSETS, and the
v4c-deck-style skill's assets/ beside this skill (sibling_skill.py). out_dir defaults
to this skill's assets/ only in this plugin's source repository; an installed copy
is read-only, so there it must be given. Pass "" as deck_assets_dir to give out_dir
alone. Needs Pillow.
"""
import os
import sys
from pathlib import Path

from sibling_skill import SiblingNotFound, find_sibling

HERE = Path(__file__).resolve().parent
DECK_FILES = ["darkbg.png", "hero-arch.png", "logo-white.png", "gradbar.png"]
S = 300  # px per inch


def deck_assets(arg=None):
    """Return the deck assets folder; raise SiblingNotFound if nothing qualifies."""
    return find_sibling(HERE.parent, "v4c-doc-style", "v4c-deck-style", "assets", DECK_FILES,
                        [("the deck_assets_dir argument", arg),
                         ("V4C_DECK_ASSETS", os.environ.get("V4C_DECK_ASSETS"))])


def in_repo_source():
    """True for <repo>/plugins/client-engagements/skills/v4c-doc-style/ in a git checkout of the
    marketplace repo, the one copy whose assets/ may be rewritten. Installed copies are read-only."""
    p = HERE.parents
    return (len(p) > 4 and p[1].name == "skills" and p[3].name == "plugins"
            and (p[4] / ".claude-plugin" / "marketplace.json").is_file() and (p[4] / ".git").exists())

def load(n): return Image.open(f"{SRC}/{n}").convert("RGBA")

def cover_banner(w_in=6.7, h_in=2.9):
    W, H = int(w_in*S), int(h_in*S)
    bg = load("darkbg.png")
    r = max(W/bg.width, H/bg.height)
    bg = bg.resize((int(bg.width*r)+1, int(bg.height*r)+1), Image.LANCZOS)
    bg = bg.crop((0, bg.height-H, W, bg.height))  # keep darkest bottom-left
    hero = load("hero-arch.png")
    hh = int(H*1.12); hw = int(hero.width*hh/hero.height)
    bg.alpha_composite(hero.resize((hw, hh), Image.LANCZOS), (W-int(hw*0.86), int(H*0.16)))
    logo = load("logo-white.png")
    lw = int(1.36*S); lh = int(logo.height*lw/logo.width)
    bg.alpha_composite(logo.resize((lw, lh), Image.LANCZOS), (int(0.42*S), int(0.42*S)))
    bar = load("gradbar.png").resize((W, int(0.06*S)), Image.LANCZOS)
    bg.alpha_composite(bar, (0, H-bar.height))
    tab = Image.new("RGBA", (int(0.5*S), int(0.055*S)), (0, 142, 232, 255))
    bg.alpha_composite(tab, (int(0.35*S), 0))
    bg.convert("RGB").save(f"{OUT}/cover-banner.png", optimize=True)

def gradbar(w_in=6.7):
    load("gradbar.png").resize((int(w_in*S), 12), Image.LANCZOS).convert("RGB").save(f"{OUT}/gradbar-doc.png")

def tab():
    Image.new("RGB", (150, 17), (0, 142, 232)).save(f"{OUT}/header-tab.png")

def logo_chip(h_in=0.30):
    """White logo on its intended navy ground, for light-page headers."""
    logo = load("logo-white.png")
    H = int(h_in*S); pad = int(H*0.2)
    lh = H-2*pad; lw = int(logo.width*lh/logo.height)
    W = lw+2*int(pad*1.4)
    chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(chip).rounded_rectangle((0, 0, W-1, H-1), radius=int(H*0.18), fill=(19, 23, 80, 255))
    chip.alpha_composite(logo.resize((lw, lh), Image.LANCZOS), (int(pad*1.4), pad))
    chip.save(f"{OUT}/logo-chip.png", optimize=True)

if __name__ == "__main__":
    try:
        SRC = deck_assets(sys.argv[1] if len(sys.argv) > 1 else None)
    except SiblingNotFound as e:
        sys.exit(str(e))
    if len(sys.argv) > 2 and sys.argv[2]:
        OUT = sys.argv[2]
    elif in_repo_source():
        OUT = HERE.parent / "assets"
    else:
        sys.exit("v4c-doc-style: pass an out_dir. This copy of the skill is installed, not the source in the "
                 "plugin's source repository, so its assets/ folder is read-only; brand assets are regenerated in the repo.\n"
                 'Usage: python make_assets.py [deck_assets_dir] out_dir. Pass "" as deck_assets_dir to find the '
                 "deck assets as usual.")
    from PIL import Image, ImageDraw
    cover_banner(); gradbar(); tab(); logo_chip()
    print("assets written to", OUT)

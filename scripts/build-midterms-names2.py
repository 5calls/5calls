#!/usr/bin/env python3
"""Draw each state's name for the week two share cards.

    pip install pillow
    python3 scripts/build-midterms-names2.py

Writes assets/images/midterms/week2-names/<crop>/<code>.png for both crops,
one per entry in data/midterms_voting.yml. Each is a transparent layer the
size of its card that layouts/partials/midterms-card-week2.html lays over the
plate at 0, 0.

Week one's build-midterms-names.py does the same job for that week's plates.
The treatment is the same one: the name stands on the plate's diagonal in
Bebas Neue, stretched tall, bottoms flat and tops running up along the
diagonal, so every letter tapers as well as each being taller than the last.
Hugo can draw text but not distort it, so the names are drawn here once and
checked in. Re-run after changing a state name or the layout numbers below.
Temporary, like the rest of /midterms.
"""

import os
import re

from PIL import Image, ImageDraw, ImageFont

STATES = "data/midterms_voting.yml"
FONT = "assets/fonts/BebasNeue-Regular.ttf"
OUT_DIR = "assets/images/midterms/week2-names"

ORANGE = (251, 134, 64, 255)

# Measured off each crop's designed California card, which spans ca_left to
# right and stands on base; its top edge runs along the line through top_a and
# top_b. Every name centers where California does. Longer names narrow to fit,
# but never reach past right or left of left, where the plate's own art is.
#
# California's card leaves almost no room to grow on the vertical crop — it
# runs from the URL's tail to the right margin already — so the long names
# there condense rather than widen.
LAYOUTS = {
    "vertical": dict(card=(1080, 1350), ca_left=475, right=1010, left=470,
                     base=657, top_a=(475, 545), top_b=(1010, 420)),
    "horizontal": dict(card=(1200, 630), ca_left=798, right=1149, left=735,
                       base=162, top_a=(798, 89), top_b=(1149, 4)),
}

# Drawn at twice the card's size and scaled down, for smooth edges.
SS = 2
DRAW_SIZE = 800


def states():
    """(code, name) pairs, read without a YAML dependency: the file is ours."""
    with open(STATES, encoding="utf-8") as fh:
        text = fh.read()
    return re.findall(r'^  ([A-Z]{2}):\n    code: "[A-Z]{2}"\n    name: "([^"]+)"', text, re.M)


def top_at(layout, x):
    """Where the name's top edge is at card column x."""
    (x0, y0), (x1, y1) = layout["top_a"], layout["top_b"]
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0)


def flat_name(font, name):
    """The name in orange, cropped to its capitals, at DRAW_SIZE."""
    width = int(font.getlength(name)) + 2
    ascent, descent = font.getmetrics()
    img = Image.new("RGBA", (width, ascent + descent), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((0, ascent), name, font=font, fill=ORANGE, anchor="ls")
    cap_top = ascent + font.getbbox("H", anchor="ls")[1]
    return img.crop((0, cap_top, width, ascent))


def draw(font, name, layout):
    left, right, base = layout["left"], layout["right"], layout["base"]
    card_w, card_h = layout["card"]
    flat = flat_name(font, name)
    ca_width = right - layout["ca_left"]
    width = min(ca_width * font.getlength(name) / font.getlength("CALIFORNIA"), right - left)
    center = (layout["ca_left"] + right) / 2
    x0 = min(max(center - width / 2, left), right - width)

    # Squeeze to the name's width on the (supersampled) card, then stretch
    # each column to the height of the top edge above it.
    cols = round(width * SS)
    squeezed = flat.resize((cols, flat.height), Image.LANCZOS)
    layer = Image.new("RGBA", (card_w * SS, card_h * SS), (0, 0, 0, 0))
    for i in range(cols):
        x = x0 + (i + 0.5) / SS
        height = round((base - top_at(layout, x)) * SS)
        column = squeezed.crop((i, 0, i + 1, squeezed.height)).resize((1, height), Image.LANCZOS)
        layer.alpha_composite(column, (round(x0 * SS) + i, round(base * SS) - height))
    return layer.resize((card_w, card_h), Image.LANCZOS)


def main():
    font = ImageFont.truetype(FONT, DRAW_SIZE)
    found = states()
    if not found:
        raise SystemExit("no states found in %s" % STATES)
    for crop, layout in LAYOUTS.items():
        out = os.path.join(OUT_DIR, crop)
        os.makedirs(out, exist_ok=True)
        for code, name in found:
            draw(font, name.upper(), layout).save(os.path.join(out, code.lower() + ".png"), optimize=True)
        print(f"Wrote {len(found)} {crop} names to {out}/")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Cut week six's share plates out of the designer's comps.

    pip install pillow
    python3 scripts/build-midterms-plates6.py DIR

DIR holds the four comps, as the designer named them:

    week 6A - I know where I'm voting-vert.png    -> share-vertical-week6.png
    Week 6A - I know where I'm voting-horiz.png   -> share-horizontal-week6.png
    week 6B - I voted early!-vert.png             -> share-vertical-week6-early.png
    Week 6B - I voted early!-horiz.png            -> share-horizontal-week6-early.png

Each comp is California's card. This paints out the two things that change by
state -- the orange name on the cream diagonal, and the rules in the orange
panel -- and writes the plate to assets/images/midterms/, where
layouts/partials/midterms-card-week2.html sets each state's own into the same
places (the names come from scripts/build-midterms-names6.py).

Only pixels that are the ink blended into its own background are painted: the
name's orange into cream, the rules' black into orange. So the art the name
and the rules sit beside (the megaphone, the sign, the mailbox) is left as it
was. Re-run if the comps change. Temporary, like the rest of /midterms.
"""

import os
import sys

from PIL import Image

ORANGE = (251, 134, 64)
CREAM = (255, 245, 232)
BLACK = (0, 0, 0)

COMPS = {
    "week 6A - I know where I'm voting-vert.png": ("vertical", "share-vertical-week6.png"),
    "Week 6A - I know where I'm voting-horiz.png": ("horizontal", "share-horizontal-week6.png"),
    "week 6B - I voted early!-vert.png": ("vertical", "share-vertical-week6-early.png"),
    "Week 6B - I voted early!-horiz.png": ("horizontal", "share-horizontal-week6-early.png"),
}

# Per crop, measured off the comps: the name's columns, its base, and two
# points on the line its tops run along; then the box the rules sit in.
CROPS = {
    "vertical": {
        "size": (1080, 1350),
        "name": (300, 992), "base": 875, "top_a": (543, 672), "top_b": (891, 594),
        "rules": (120, 935, 1075, 1215),
    },
    "horizontal": {
        "size": (1200, 630),
        "name": (700, 1180), "base": 339, "top_a": (870, 201), "top_b": (1108, 148),
        "rules": (150, 410, 1045, 615),
    },
}

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "midterms")


def on_blend(p, ink, ground, tol=14):
    """Whether p is ink laid over ground at some coverage, edges included."""
    # Coverage from the channel where the two differ most.
    ch = max(range(3), key=lambda i: abs(ink[i] - ground[i]))
    a = (ground[ch] - p[ch]) / (ground[ch] - ink[ch])
    if a < -0.02 or a > 1.04:
        return False
    return all(abs(p[i] - (ground[i] + (ink[i] - ground[i]) * a)) <= tol for i in range(3))


def top_at(c, x):
    (x0, y0), (x1, y1) = c["top_a"], c["top_b"]
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0)


def plate(comp, c):
    img = comp.copy()
    px = img.load()
    left, right = c["name"]
    for x in range(left, right + 1):
        for y in range(int(top_at(c, x)) - 4, c["base"] + 1):
            if on_blend(px[x, y], ORANGE, CREAM):
                px[x, y] = CREAM
    x0, y0, x1, y1 = c["rules"]
    for y in range(y0, y1):
        for x in range(x0, x1):
            if on_blend(px[x, y], BLACK, ORANGE):
                px[x, y] = ORANGE
    return img


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    for name, (crop, out) in COMPS.items():
        c = CROPS[crop]
        comp = Image.open(os.path.join(sys.argv[1], name)).convert("RGB")
        if comp.size != c["size"]:
            sys.exit(f"{name} is {comp.size}, expected {c['size']}")
        plate(comp, c).save(os.path.join(OUT, out), optimize=True)
        print("wrote", out)


if __name__ == "__main__":
    main()

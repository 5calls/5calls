#!/usr/bin/env python3
"""Cut week five's share plates out of the designer's comps.

    pip install pillow
    python3 scripts/build-midterms-plates5.py VERTICAL_COMP HORIZONTAL_COMP

The comps carry a sample plan sentence in the cream panel, under "I made a
plan to vote!". This paints that sentence out with the panel's own cream and
writes the result to assets/images/midterms/share-{vertical,horizontal}-week5.png,
where layouts/partials/midterms-card-week5.html sets each reader's plan into
the same space. Also writes the 1x1 swatch that card stretches into the
highlight behind each answer.

Only the panel is painted, row by row from its own left edge to its right, so
the art around it (the pin above, the car below, the panel's shadow) is left
as it was. Re-run if the comps change. Temporary, like the rest of /midterms.
"""

import os
import sys

from PIL import Image

CREAM = (255, 245, 232)
# The highlight behind the reader's answers: a light orange, so the answers
# stand out without reading as links.
HIGHLIGHT = (255, 205, 160)

# The body text's rows on each comp, below the headline's descenders and above
# the panel's bottom edge, and a column known to be inside the panel.
CROPS = {
    "vertical": {"size": (1080, 1350), "rows": (470, 805), "inside": 85},
    "horizontal": {"size": (1200, 630), "rows": (250, 396), "inside": 290},
}

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "midterms")


def near(p, q, tol=10):
    return all(abs(a - b) <= tol for a, b in zip(p, q))


def blank(path, crop):
    spec = CROPS[crop]
    im = Image.open(path).convert("RGB")
    if im.size != spec["size"]:
        sys.exit(f"{path}: expected {spec['size']}, got {im.size}")
    px = im.load()
    w = im.size[0]
    top, bottom = spec["rows"]
    for y in range(top, bottom):
        if not near(px[spec["inside"], y], CREAM):
            sys.exit(f"{path}: row {y} is outside the panel at x={spec['inside']}")
        # The panel's edges: walk out from the known-inside column until a
        # pixel is neither cream nor the sentence's black or blue ink.
        left = spec["inside"]
        while left > 0 and near(px[left - 1, y], CREAM):
            left -= 1
        right = w - 1
        while right > left and not near(px[right, y], CREAM):
            right -= 1
        for x in range(left, right + 1):
            px[x, y] = CREAM
    return im


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    for crop, path in zip(("vertical", "horizontal"), sys.argv[1:]):
        out = os.path.join(OUT, f"share-{crop}-week5.png")
        blank(path, crop).save(out, optimize=True)
        print("wrote", os.path.normpath(out))
    swatch = os.path.join(OUT, "week5-highlight.png")
    Image.new("RGB", (1, 1), HIGHLIGHT).save(swatch)
    print("wrote", os.path.normpath(swatch))


if __name__ == "__main__":
    main()

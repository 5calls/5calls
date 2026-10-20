#!/usr/bin/env python3
"""Draw each state's name for the week six share cards.

    pip install pillow
    python3 scripts/build-midterms-names6.py

Writes assets/images/midterms/week6-names/<crop>/<code>.png, one per state in
data/midterms_voting.yml, each a transparent layer the size of its card that
layouts/partials/midterms-card-week2.html lays over week six's plates at 0, 0.
Both of the week's sets ("I know where I'm voting" and "I voted early!") place
the name identically, so they share these.

The treatment is week two's -- Bebas Neue, flat-bottomed, tops running up the
diagonal -- and so is the code: this borrows build-midterms-names2.py's drawing
and changes only where the name sits, measured off week six's California
comps. Re-run after changing a state name or the layout numbers below.
Temporary, like the rest of /midterms.
"""

import importlib.util
import os

from PIL import ImageFont

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("names2", os.path.join(HERE, "build-midterms-names2.py"))
names2 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(names2)

OUT_DIR = "assets/images/midterms/week6-names"

# As in build-midterms-names2.py: California spans ca_left to right and stands
# on base, its tops along the line through top_a and top_b. Longer names
# narrow to fit, but never reach left of left, where the megaphone is.
LAYOUTS = {
    "vertical": dict(card=(1080, 1350), ca_left=310, right=981, left=200,
                     base=869, top_a=(543, 672), top_b=(891, 594)),
    "horizontal": dict(card=(1200, 630), ca_left=711, right=1170, left=670,
                       base=333, top_a=(870, 201), top_b=(1108, 148)),
}


def main():
    font = ImageFont.truetype(names2.FONT, names2.DRAW_SIZE)
    found = names2.states()
    if not found:
        raise SystemExit("no states found in %s" % names2.STATES)
    for crop, layout in LAYOUTS.items():
        out = os.path.join(OUT_DIR, crop)
        os.makedirs(out, exist_ok=True)
        for code, name in found:
            names2.draw(font, name.upper(), layout).save(os.path.join(out, code.lower() + ".png"), optimize=True)
        print(f"Wrote {len(found)} {crop} names to {out}/")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Draw each state's name for the week eight vertical share card.

    pip install pillow
    python3 scripts/build-midterms-names8.py

Writes assets/images/midterms/week8-names/vertical/<code>.png, one per state
in data/midterms_voting.yml, each a transparent layer the size of the card
that layouts/partials/midterms-card-week2.html lays over week eight's plate at
0, 0. The horizontal card places its name exactly where week two's does, so
it uses week2-names/horizontal/ rather than a copy here.

Week two's treatment and code, as build-midterms-names6.py borrows them, with
the name where week eight's California comp puts it. Temporary, like the rest
of /midterms.
"""

import importlib.util
import os

from PIL import ImageFont

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("names2", os.path.join(HERE, "build-midterms-names2.py"))
names2 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(names2)

OUT_DIR = "assets/images/midterms/week8-names"

LAYOUTS = {
    "vertical": dict(card=(1080, 1350), ca_left=310, right=981, left=200,
                     base=818, top_a=(347, 671), top_b=(964, 528)),
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

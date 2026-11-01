#!/usr/bin/env python3
"""Cut week eight's share plates out of the designer's comps.

    pip install pillow
    python3 scripts/build-midterms-plates8.py DIR

DIR holds the two comps, as the designer named them:

    week 8 - I voted (ig).png      -> share-vertical-week8.png
    Week 8 - I voted! (fb).png     -> share-horizontal-week8.png

Week eight's cards are week six's treatment on new art, so this is
build-midterms-plates6.py's painting with week eight's measurements. The
vertical name sits lower than week six's and gets its own layers from
build-midterms-names8.py; the horizontal one sits exactly where week two's
does, so it borrows those. Temporary, like the rest of /midterms.
"""

import importlib.util
import os
import sys

from PIL import Image

HERE = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("plates6", os.path.join(HERE, "build-midterms-plates6.py"))
plates6 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(plates6)

COMPS = {
    "week 8 - I voted (ig).png": ("vertical", "share-vertical-week8.png"),
    "Week 8 - I voted! (fb).png": ("horizontal", "share-horizontal-week8.png"),
}

# Measured off the California comps, as in build-midterms-plates6.py.
CROPS = {
    "vertical": {
        "size": (1080, 1350),
        "name": (300, 992), "base": 826, "top_a": (347, 665), "top_b": (964, 522),
        "rules": (40, 870, 1075, 1345),
    },
    "horizontal": {
        "size": (1200, 630),
        "name": (788, 1160), "base": 168, "top_a": (798, 89), "top_b": (1149, 4),
        "rules": (640, 215, 1195, 615),
    },
}


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    for name, (crop, out) in COMPS.items():
        c = CROPS[crop]
        comp = Image.open(os.path.join(sys.argv[1], name)).convert("RGB")
        if comp.size != c["size"]:
            sys.exit(f"{name} is {comp.size}, expected {c['size']}")
        plates6.plate(comp, c).save(os.path.join(plates6.OUT, out), optimize=True)
        print("wrote", out)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Cut week seven's share plates out of the designer's comps.

    pip install pillow
    python3 scripts/build-midterms-plates7.py DIR

DIR holds the four comps, as the designer named them (the horizontal crops
loose in Downloads, the vertical ones in the IG template folder, so gather
them into one directory first):

    week 7A - I tracked my ballot.png     -> share-vertical-week7.png
    Week 7A I tracked my ballot .png      -> share-horizontal-week7.png
    week 7B - I'm ready to vote.png       -> share-vertical-week7-early.png
    Week 7B I'm ready to vote .png        -> share-horizontal-week7-early.png

Week seven's cards are week six's layout on new art, so this is
build-midterms-plates6.py's painting with week seven's comps. The vertical crop
matches week six exactly; the horizontal one moves the footer bar to the
bottom, which lifts the rules about 48px. The name sits where week six's does,
so the cards reuse week six's name layers. The second set ("I'm ready to vote")
rides on week six's `early_cards` plumbing, hence the -early file names.
Temporary, like the rest of /midterms.
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
    "week 7A - I tracked my ballot.png": ("vertical", "share-vertical-week7.png"),
    "Week 7A I tracked my ballot .png": ("horizontal", "share-horizontal-week7.png"),
    "week 7B - I'm ready to vote.png": ("vertical", "share-vertical-week7-early.png"),
    "Week 7B I'm ready to vote .png": ("horizontal", "share-horizontal-week7-early.png"),
}

CROPS = {
    "vertical": plates6.CROPS["vertical"],
    "horizontal": dict(plates6.CROPS["horizontal"], rules=(150, 365, 1045, 575)),
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

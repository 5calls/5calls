#!/usr/bin/env python3
"""Cut week six's voter handbook plate out of the designer's comp.

    pip install pillow
    python3 scripts/build-midterms-plate6.py COMP

The comp is one state's handbook, 1080x1350: the orange frame, "2026 VOTER
HANDBOOK", the state's name, three sections of that state's rules under their
headings, and the 5calls.org/midterms footer with the logo. This writes:

- assets/images/midterms/handbook-plate.png, the comp with everything between
  the title and the footer painted out in the panel's cream, which
  layouts/partials/midterms-card-week6.html sets each state's name and rules
  into.
- assets/images/midterms/handbook-heading-{registration,voting,id}.png, each
  section heading as a full-width strip cut from the comp. The headings are the
  same in every state but sit wherever that state's rules push them, so the
  card lays the strips over the plate rather than the plate carrying them;
  cutting them keeps the comp's own heavy face, which Hugo has no font for.

Re-run if the comp changes. Temporary, like the rest of /midterms.
"""

import os
import sys

from PIL import Image

CREAM = (255, 245, 232)
SIZE = (1080, 1350)
# Inside the orange frame.
INNER = (9, 9, 1071, 1341)
# Painted out: from below the title's descenders to above the footer.
BODY = (115, 1255)
# Each heading's rows on the comp, with a few pixels of cream either side.
HEADINGS = {
    "registration": (250, 288),
    "voting": (491, 529),
    "id": (1130, 1173),
}

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images", "midterms")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    comp = Image.open(sys.argv[1]).convert("RGB")
    if comp.size != SIZE:
        sys.exit(f"comp is {comp.size}, expected {SIZE}")

    left, _, right, _ = INNER
    for key, (top, bottom) in HEADINGS.items():
        strip = comp.crop((left, top, right, bottom))
        strip.save(os.path.join(OUT, f"handbook-heading-{key}.png"), optimize=True)

    plate = comp.copy()
    plate.paste(CREAM, (left, BODY[0], right, BODY[1]))
    plate.save(os.path.join(OUT, "handbook-plate.png"), optimize=True)


if __name__ == "__main__":
    main()

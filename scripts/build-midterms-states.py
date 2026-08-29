#!/usr/bin/env python3
"""Turn the VoteAmerica week-one copy deck into a Hugo data file.

    python3 scripts/build-midterms-states.py [path/to/copy-deck-2026-general.tsv]

Writes data/midterms_states.yml, which layouts/partials/midterms-page.html reads
for any week flagged `state_deck: true` in data/midterms.yml. The deck is the
source of truth: re-run this after VoteAmerica publishes a new snapshot rather
than editing the generated file. Temporary, like the rest of /midterms.
"""

import csv
import os
import sys

DEFAULT_DECK = "../voteamerica-data/copy-deck-2026-general.tsv"
OUT = "data/midterms_states.yml"

# TSV column -> key in the generated file. Copy is reproduced verbatim; the
# deck's wording (including its all-caps headlines) is what ships.
FIELDS = [
    ("Headline", "headline"),
    ("Hero_date", "hero_date"),
    ("Channels", "channels"),
    ("Secondary_line", "secondary"),
    ("Mail_instruction", "mail"),
    ("Election_day", "election_day"),
    ("Official_URL", "url"),
]


def quote(value):
    """Double-quote every string: deck copy contains colons, commas and dashes."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    deck = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DECK
    with open(deck, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))

    rows.sort(key=lambda r: r["Code"])
    flagged = [r["Code"] for r in rows if r["Needs_review"].upper() == "TRUE"]

    out = [
        "# GENERATED FILE - do not edit by hand.",
        "# Source: %s" % os.path.basename(deck),
        "# Regenerate: python3 scripts/build-midterms-states.py",
        "#",
        "# One entry per jurisdiction (50 states + DC) of week-one registration",
        "# deadline copy. Archetypes: A uniform deadline, B same-day registration,",
        "# C deadlines that differ by channel, D no registration (ND only).",
        "# %d of %d entries are flagged needs_review upstream." % (len(flagged), len(rows)),
        "",
        "states:",
    ]

    for row in rows:
        out.append("  %s:" % row["Code"])
        out.append("    code: %s" % quote(row["Code"]))
        out.append("    name: %s" % quote(row["State"]))
        out.append("    archetype: %s" % quote(row["Archetype"]))
        for column, key in FIELDS:
            value = row[column].strip()
            if value:
                out.append("    %s: %s" % (key, quote(value)))
        if row["Needs_review"].upper() == "TRUE":
            out.append("    needs_review: true")
            reason = row["Review_reason"].strip()
            if reason:
                out.append("    review_reason: %s" % quote(reason))
        if row["Notes"].strip():
            out.append("    notes: %s" % quote(row["Notes"].strip()))

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(out) + "\n")

    print("wrote %s: %d jurisdictions, %d flagged for review (%s)"
          % (OUT, len(rows), len(flagged), ", ".join(flagged)))


if __name__ == "__main__":
    main()

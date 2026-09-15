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
import re
import sys
from datetime import date, timedelta

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


# The deck's deadlines are stored upstream as counts of days before Election
# Day. The website's copy names a date for each way to register, so they are
# worked out here from that count.
ELECTION_DAY = date(2026, 11, 3)
# The same short months the page uses elsewhere: September is "Sept", and the
# short months stay whole.
MONTHS = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept",
          "Oct", "Nov", "Dec"]
WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
# "Mail it by" leaves a week for the post.
MAIL_BY_DAYS = 7

# Deadlines the deck's editors moved off the upstream count, per the official
# calendars cited in those states' Notes. The API still has the raw count, so
# these win, and the deck's own copy is checked against the result.
DECK_OVERRIDES = {
    # Sunday deadline rolls to Monday.
    "TN": {"online": date(2026, 10, 5), "in_person": date(2026, 10, 5),
           "mail_date": date(2026, 10, 5)},
    "TX": {"in_person": date(2026, 10, 5), "mail_date": date(2026, 10, 5)},
    # Differs by channel, per scvotes.gov's 2026 calendar.
    "SC": {"online": date(2026, 10, 4), "in_person": date(2026, 10, 2),
           "mail_date": date(2026, 10, 5)},
}

# Deadlines checked against each state's own 2026 election calendar, website or
# statute, where counting back from Election Day lands on a weekend (or, for a
# few, where the state's date differs from the deck's count). A weekend date
# with no official guidance to move it stays as counted. These come after the
# deck check, since they are meant to differ from the deck. Checked 2026-09-14.
OFFICIAL_OVERRIDES = {
    # 2026 SOS calendar: Sunday deadline "extended to the following business
    # day, per Ark. Code § 7-1-108. The actual deadline will be Monday,
    # October 5, 2026." sos.arkansas.gov/uploads/elections/2026_Election_Calendar_Rev._6-2025_.pdf
    "AR": {"in_person": date(2026, 10, 5), "mail_date": date(2026, 10, 5)},
    # Paper registration deadline "General Election: October 26, 2026", the
    # Monday after the tenth day. elections.hawaii.gov/register-to-vote/registration/
    "HI": {"mail_date": date(2026, 10, 26)},
    # 2026 SOS calendar and election dates page: in person and by mail
    # October 5; GeauxVote online October 13. sos.la.gov/elections-voting/election-dates
    "LA": {"online": date(2026, 10, 13), "in_person": date(2026, 10, 5),
           "mail_date": date(2026, 10, 5)},
    # 2026 SOS calendar: "5th Voter Registration Deadline (General)" for in
    # person and postmarked mail. sos.ms.gov/content/documents/elections/2026%20Elections%20Calendar.pdf
    "MS": {"in_person": date(2026, 10, 5), "mail_date": date(2026, 10, 5)},
    # SOS 2026 schedule: "the deadline to register to vote is October 5", one
    # date for every channel (ORC 1.14 moves a Sunday deadline to Monday).
    # ohiosos.gov/elections/voters/current-voting-schedule/2026-schedule/
    "OH": {"online": date(2026, 10, 5)},
    # Mail registration counts from its postmark (RIGL 17-9.1-9), not receipt.
    # The date itself stays Sunday, Oct 4, per the 2026 calendar.
    "RI": {"mail_received": False},
    # Mail must be received by 5 p.m. 11 days before, the same as online (Utah
    # Code 20A-2-102.5); vote.utah.gov: "Registration Deadline October 23, 2026 by 5pm".
    "UT": {"mail_date": date(2026, 10, 23)},
}
# Checked and left on the weekend, per official sources: AK Sun Oct 4 (2026
# calendar, "Deadline always falls on a Sunday"), DE Sat Oct 10, IL online Sun
# Oct 18, MA Sat Oct 24, NC early-voting registration Sat Oct 31, NY Sat Oct
# 24, RI Sun Oct 4, SC online Sun Oct 4.


def fmt(day):
    return "%s, %s %d" % (WEEKDAYS[day.weekday()], MONTHS[day.month - 1], day.day)


def deadline(raw):
    """'15 days before Election Day (postmarked)' -> a date; 'N/A' -> None."""
    raw = raw.strip()
    if not raw or raw.upper().startswith("N/A"):
        return None
    m = re.match(r"(\d+)(?:-(\d+))? days? before (?:Election Day|election)", raw, re.I)
    if m:
        # A range (New Hampshire's 6-13 days) takes its earliest, safest date.
        return ELECTION_DAY - timedelta(days=int(m.group(2) or m.group(1)))
    if raw.lower().startswith("election day"):
        return ELECTION_DAY
    sys.exit("unreadable deadline: %r" % raw)


def schedule(row, warnings):
    """The website's tier for a state, and the dates its copy names.

    A: one deadline for every way to register. B: same-day registration.
    C1/C2: deadlines that differ by channel, with and without online
    registration. ND: no registration at all.
    """
    code = row["Code"]
    if row["Archetype"] == "D":
        return {"tier": "ND"}
    # The deck marks states where online registration shouldn't be offered,
    # which includes Texas, where first-time voters can't use it.
    no_online = "No online registration" in row["Notes"]
    # mail_date, not mail: the deck's own mail sentence already has that key,
    # and the week-one share card reads it.
    dates = {
        "online": None if no_online else deadline(row["Raw_online"]),
        "in_person": deadline(row["Raw_in_person"]),
        "mail_date": deadline(row["Raw_mail"]),
    }
    dates.update(DECK_OVERRIDES.get(code, {}))

    # Every date the deck's own copy names should be one of these, or the
    # computed dates have drifted from what the deck's editors checked.
    named = set(re.findall(r"(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \w+ \d+", " ".join(
        [row["Hero_date"], row["Secondary_line"], row["Mail_instruction"]])))
    known = {fmt(d) for d in dates.values() if d} | {fmt(ELECTION_DAY)}
    for missing in sorted(named - known):
        warnings.append("%s: deck names %s, not among computed %s"
                        % (code, missing, {k: fmt(v) for k, v in dates.items() if v}))

    official = dict(OFFICIAL_OVERRIDES.get(code, {}))
    received_override = official.pop("mail_received", None)
    dates.update(official)

    # One date for every way to register reads as tier A, whatever the deck's
    # archetype, once the official dates are in (Ohio's online deadline moving
    # to Monday puts it there). Without online registration it can't: tier A's
    # copy names online.
    tier = row["Archetype"]
    if tier == "A" and len(set(dates.values())) != 1:
        sys.exit("%s is archetype A but its deadlines differ: %s" % (code, dates))
    if tier == "C":
        if dates["online"] and len(set(dates.values())) == 1:
            tier = "A"
        else:
            tier = "C1" if dates["online"] else "C2"

    out = {"tier": tier}
    for key, day in dates.items():
        if day:
            out[key] = fmt(day)
    out["mail_by"] = fmt(dates["mail_date"] - timedelta(days=MAIL_BY_DAYS))
    # The deck already words receipt deadlines as "must arrive", including New
    # Hampshire's, whose upstream text doesn't say.
    out["mail_received"] = "must arrive" in row["Mail_instruction"]
    if received_override is not None:
        out["mail_received"] = received_override
    return out


def quote(value):
    """Double-quote every string: deck copy contains colons, commas and dashes."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main():
    deck = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DECK
    with open(deck, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))

    rows.sort(key=lambda r: r["Code"])
    warnings = []
    flagged = [r["Code"] for r in rows if r["Needs_review"].upper() == "TRUE"]

    out = [
        "# GENERATED FILE - do not edit by hand.",
        "# Source: %s" % os.path.basename(deck),
        "# Regenerate: python3 scripts/build-midterms-states.py",
        "#",
        "# One entry per jurisdiction (50 states + DC) of week-one registration",
        "# deadline copy. Archetypes: A uniform deadline, B same-day registration,",
        "# C deadlines that differ by channel, D no registration (ND only).",
        "#",
        "# tier and the dates after it drive the website's deadline copy: tier A",
        "# (one deadline), B (same-day), C1/C2 (differs by channel, with/without",
        "# online), ND. Dates are counted from Election Day, with the deck's own",
        "# corrections; mail_by is a week before the mail deadline.",
        "# %d of %d entries are flagged needs_review upstream." % (len(flagged), len(rows)),
        "",
        "states:",
    ]

    for row in rows:
        out.append("  %s:" % row["Code"])
        out.append("    code: %s" % quote(row["Code"]))
        out.append("    name: %s" % quote(row["State"]))
        out.append("    archetype: %s" % quote(row["Archetype"]))
        sched = schedule(row, warnings)
        out.append("    tier: %s" % quote(sched["tier"]))
        for key in ("online", "in_person", "mail_date", "mail_by"):
            if key in sched:
                out.append("    %s: %s" % (key, quote(sched[key])))
        if "mail_received" in sched:
            out.append("    mail_received: %s" % ("true" if sched["mail_received"] else "false"))
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
    for warning in warnings:
        print("warning:", warning)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Turn the voter-ID research into a Hugo data file.

    python3 scripts/build-midterms-id.py [voter-id-by-state.tsv] \
        [voter-id-buckets.tsv] [state-data-full.tsv]

Writes data/midterms_id.yml, which layouts/partials/midterms-id.html reads for
any week flagged `state_id: true` in data/midterms.yml. Temporary, like the
rest of /midterms.

The two siblings of this script, build-midterms-states.py and
build-midterms-voting.py, take a VoteAmerica snapshot straight through. This
one cannot: the snapshot lists *which* IDs a state accepts but never says what
happens to a voter who turns up without one, which is the half of the question
that decides whether someone's vote counts. So the in-person side comes from
voter-id-by-state.tsv and voter-id-buckets.tsv, compiled from the snapshot and
then checked against statutes and SOS pages on 2026-09-22. The mail side is
still raw snapshot prose (`id_laws_ballot_return`) and is marked as unchecked
upstream; see voter-id-requirements.md in the data repo.

Buckets, which drive the one-line summary on the share card:

    A  Strict photo                 photo, or your vote needs a return trip
    B  Photo requested              photo, but a form at the polls also works
    C  Strict ID, non-photo OK      some ID, or your vote needs a return trip
    D  ID requested, non-photo OK   some ID, but a form at the polls works
    E  No ID                        you give your name; first-timers may differ

"n/a", "None", "No" and "None found" all become an absent key, so the template
decides what to show by asking whether a key is there, never by matching
prose — the same contract the other two data files keep.
"""

import csv
import os
import re
import sys

DEFAULT_STATES = "../voteamerica-data/voter-id-by-state.tsv"
DEFAULT_BUCKETS = "../voteamerica-data/voter-id-buckets.tsv"
DEFAULT_FULL = "../voteamerica-data/state-data-full.tsv"
OUT = "data/midterms_id.yml"

# What each bucket asks for at the polling place, in one sentence. It opens
# the action box under "To vote in <state>", and is the share card's bold line.
#
# A and B collapse here, and so do C and D: the pairs differ only in what
# happens to a voter who turns up without ID, which the action box no longer
# carries. See the note on if_no_id below.
BUCKET_LEDE = {
    "A": "You must show a photo ID when you vote",
    "B": "You must show a photo ID when you vote",
    "C": "You must show ID when you vote",
    "D": "You must show ID when you vote",
    "E": "Only first-time voters must show ID when they vote",
}

# What to call the accepted-ID list, which depends on whether a photo is the
# only thing that counts.
# Only reached by the fallback path below, for a state whose VoteAmerica
# entry has no item markers to split on. The noun phrase only; the heading is
# closed with "include:" or the state's own qualifier in brackets.
ACCEPTED_LABEL = {
    "A": "Acceptable photo IDs",
    "B": "Acceptable photo IDs",
    "C": "Acceptable IDs",
    "D": "Acceptable IDs",
    "E": "Acceptable IDs",
}

# Values that mean "this does not apply here". An absent key, not the word.
EMPTY = {"", "n/a", "N/A", "none", "None", "no", "No", "none found", "None found",
         "not specified", "Not specified"}

# source_voter_id_info in the VoteAmerica snapshot is the right state's
# voter-facing page for 48 of 51 jurisdictions. These three are not, so they
# are replaced here rather than by hand-editing the generated file:
#
#   AR  points at azsos.gov — Arizona's Secretary of State, not Arkansas's.
#   AK  points at a statute on akleg.gov rather than anything a voter reads.
#   NY  points at vote.nyc, the New York *City* board, wrong for most of the
#       state.
#   ND  points into the vip.sos.nd.gov voter portal, behind a query string,
#       rather than the Secretary of State's own voter ID page -- which is
#       also the page week one links North Dakota to, in data/midterms.yml.
#
# The rest are cases where the snapshot points at a homepage, a general FAQ
# or the wrong subject, and the state publishes something specifically about
# voter ID:
#
#   GA  a Dept of Driver Services landing page, not the SOS's ID page. The
#       replacement is the "Learn more" link in VoteAmerica's own GA entry.
#   HI  a page about houseless voters. Hawaii publishes nothing about ID at
#       the polls, so this is the registration page that states the ID rule.
#   ID  the registration page; the in-person guide lists what to bring.
#   IL  an opaque NewDocDisplay query that force-downloads a PDF never using
#       the word "identification".
#   KS  the same ground as the Photo-ID-101 PDF, as a web page.
#   LA  the anchor the snapshot carries is dead, and so is every other one:
#       the accordion ids on that page are regenerated per build, so the
#       fragment is dropped rather than replaced.
#   WY  a general elections FAQ rather than the voter ID law page.
#   AR  a registration page that never lists an accepted ID; the SOS files
#       voter ID under "Voter Verification" in its FAQ.
#   DC  a page about live ballots that never says whether ID is needed.
#   FL  the older dos.myflorida.com host and a general FAQ.
#   MD  an orphaned 2002 HAVA explainer, off the site's own navigation.
#   ME  a legacy path that 301s to the page named here.
#   NE  a general election-day FAQ, written before the new photo ID law.
#   MA, NY  a generic "how do I vote" page and the homepage.
#
# Fourteen states keep what the snapshot gave them: AK, AZ, DE, KY, NH, NJ,
# NM, NV, OR, RI, SD, VT, WA and WV either have no page about ID at all, or
# the page they have is already it despite an unpromising URL -- Kentucky's
# sits under an absentee path, West Virginia's under "be registered and
# ready", and both are the state's own voter ID page.
#
# Every one loads, checked 2026-09-28. GA and NY sit behind Cloudflare and
# refuse scripted requests; GA is corroborated by the VoteAmerica snapshot.
URL_OVERRIDE = {
    "AR": "https://www.sos.arkansas.gov/frequently-asked-questions/71",
    "AK": "https://www.elections.alaska.gov/",
    "NY": "https://elections.ny.gov/",
    "ND": "https://www.sos.nd.gov/elections/voter/voting-north-dakota/forms-voter-id",
    "GA": "https://sos.ga.gov/page/georgia-voter-identification-requirements",
    "HI": "https://elections.hawaii.gov/register-to-vote/registration/",
    "ID": "https://voteidaho.gov/guide-to-vote-in-person/",
    "IL": "https://www.elections.il.gov/Main/FAQ.aspx#VoterRegistration-q04",
    "KS": "https://www.sos.ks.gov/elections/photo-id.html",
    "LA": "https://www.sos.la.gov/elections-voting/ways-to-vote",
    "WY": "https://sos.wyo.gov/Elections/VoterID/",
    "DC": "https://www.dcboe.org/faqs/early-voting-and-election-day",
    "FL": "https://dos.fl.gov/elections/for-voters/voting/election-day-voting/",
    "MA": "https://www.sec.state.ma.us/divisions/elections/voting-information/identification-requirements.htm",
    "MD": "https://elections.maryland.gov/voting/election_day_questions.html",
    "ME": "https://www.maine.gov/sos/elections-voting/your-right-to-vote-in-maine",
    "NE": "https://sos.nebraska.gov/voter-id",
    "NY": "https://elections.ny.gov/election-security#identity-confirmation",
}


def clean(value):
    """A stripped string, or None where the source meant "does not apply"."""
    text = (value or "").strip()
    if text in EMPTY:
        return None
    return text


def yaml_str(value):
    """A double-quoted scalar. The prose carries colons, quotes and commas."""
    return '"%s"' % value.replace("\\", "\\\\").replace('"', '\\"')


# Which documents a state accepts is the one thing this page deliberately does
# not answer: the lists run long, they are the part most likely to be out of
# date, and getting one wrong sends someone to the polls with the wrong card in
# their hand. The state's own page has them, and the button goes straight
# there. So everything below reduces the sources to the shape of a rule and
# drops the enumerations.
#
# The words that mark an aside as a list of documents rather than a note about
# how the rule works. "(also AL college student IDs)" goes; "(the day after the
# election)" and "(Vouching by another voter was repealed in 2026.)" stay.
DOC_WORDS = re.compile(
    r"\b(?:utility bill|bank statement|paycheck|passport|driver'?s? licen[cs]e"
    r"|birth certificate|social security|tribal|military|student|college"
    r"|ID card|voter card|registration card|government check|vehicle registration"
    r"|Medicare|Medicaid|concealed|handgun|naturalization|weapons permit"
    r"|employee ID|school|lease|pay stub|certificate)\b", re.I)

ASIDE = re.compile(r"\s*\(([^()]*)\)")

# The same lists where they are not bracketed but simply run on to the end of
# a clause: "add a bank statement, utility bill, pay stub or government
# check". Three or more items, so a rule that happens to name two documents in
# passing is left alone.
RUN_ON = re.compile(r"(?:[^,;:.()]+,\s+){2,}[^,;:.()]*?\b(?:or|and)\s+[^,;:.()]+")


def strip_examples(text):
    """Reduce a rule to its shape: drop the lists of documents, keep the rule.

    Two forms, both of which name specific cards a voter might carry. A
    bracketed aside goes entirely; a run-on list is replaced by the category
    it was illustrating, so the sentence it sits in still reads. An aside that
    is a note rather than a list -- "(the day after the election)" -- stays.
    """
    if not text:
        return text

    def keep(match):
        inner = match.group(1)
        if "," in inner and DOC_WORDS.search(inner):
            return ""
        return match.group(0)

    def collapse(match):
        run = match.group(0)
        # A list that opens the sentence is its subject, not an illustration:
        # Wyoming's "Passport, firearm permit, and Medicare/Medicaid cards must
        # be current" is the whole rule, and collapsing it leaves nothing.
        if match.start() == 0:
            return run
        if len(DOC_WORDS.findall(run)) >= 3:
            # The run may open with the space that followed a colon, and the
            # replacement has to put it back or the clause closes up.
            return ("%sa qualifying document"
                    % (" " if run[:1].isspace() else ""))
        return run

    out = RUN_ON.sub(collapse, ASIDE.sub(keep, text))
    # A stripped aside can leave a doubled space or a space before punctuation.
    return re.sub(r"\s+([.,;:])", r"\1", re.sub(r"\s{2,}", " ", out)).strip()


# Whether the photo ID has to have come from a government. Read off the
# source text, and only for the two photo buckets, where it makes the answer
# stricter rather than looser -- the safe direction for someone deciding what
# to put in their pocket. The photo/non-photo axis itself comes from the
# bucket, which is the checked classification, not from prose.
GOVERNMENT = re.compile(r"^Photo, (?:government-issued|issued by)")


def lede(bucket, id_type):
    """What the state asks for at the polls, in a sentence and with no list."""
    line = BUCKET_LEDE[bucket]
    if bucket in ("A", "B") and id_type and GOVERNMENT.match(id_type):
        line = line.replace("a photo ID", "a government-issued photo ID")
    # A no-ID state with an ID_type has an exception written into it --
    # Pennsylvania asks the first time you vote at a given polling place, and
    # is the only one -- and "only first-time voters" is not that rule.
    if bucket == "E" and id_type and id_type.startswith("None, except"):
        line = "You must show ID the first time you vote at a polling place"
    return line


LEADS_WITH_PHOTO = re.compile(r"^Photo[,:]\s+(?!or\b|and\b)")
# A no-ID state that asks anyway in one case states the rule, not the list:
# Pennsylvania's "None, except the first time you vote at a polling place
# (photo or non-photo)". The rule is already the lede and the bracket is a
# category, not documents, so the list has to come from somewhere else.
STATES_THE_RULE = re.compile(r"^None,\s*except\b", re.I)

# Where it comes from: upstream's own prose, which is the baseline the checked
# columns were compiled from. Its lead-in duplicates the label this sits under,
# its closing sentence repeats the rule, and it signs off with a markdown link.
UPSTREAM_LEAD = re.compile(r"^Acceptable forms of ID include:\s*", re.I)
UPSTREAM_TAIL = re.compile(r"\s*(?:This requirement applies\b.*?|\[Learn more\.?\]\([^)]*\))\s*$")


# VoteAmerica publishes each state's accepted IDs as one prose blob with the
# items marked by "-" or "*", which is what voteamerica.org/voter-id-laws/
# renders. It is richer than the checked ID_type column -- documents rather
# than categories -- so it is the list the page prints, and ID_type is kept
# only for the photo/non-photo reading of the lede.
VA_LINK = re.compile(r"\s*\[Learn more\.?\]\([^)]*\)\s*$")
VA_LEADIN = re.compile(r"(Accept(?:able|ed)[^:]{0,70}?includes?:)", re.I)
VA_MARKER = re.compile(r"(?:^|\s)[-*]\s*")
VA_NUMBER = re.compile(r"(?:^|\s)\d\)\s*")
# Prose run on to the last item with no stop before it. The lowercase letter
# is the test: "passport card. This ID must be current" is a sentence about
# that one card, "concealed carry license If your ID is expired" is not.
VA_GLUE = re.compile(r"(?<=[a-z0-9)\"])\s+(If|Alternatively|Acceptable|Note)\b")
# A rule about every ID rather than the one it is stuck to, which upstream
# writes with "The"/"Your" where an item's own note says "This".
VA_RULE = re.compile(r"\s+((?:The|Your)\s+ID\s+must\b.*)$", re.S)


# The checked columns and VoteAmerica's prose are the same research twice
# over: Must_be_current and More_than_one_form were compiled FROM this prose,
# so a note that restates either is the page saying it a second time in
# upstream's words. Arkansas had the four-year expiry rule at the top of the
# box and again at the bottom.
#
# Matched on the note's OPENING sentence, and the whole note goes with it --
# the sentences after it continue the same thought, and dropping only some
# leaves a dangling "These must be dated within one year."
#
# "expire" or a form of "be current"; never "current address" or "current
# utility bill", which are documents, not expiry windows.
NOTE_EXPIRY = re.compile(r"\bexpir|\b(?:must|be|is|are|remain)\s+current\b", re.I)
NOTE_SECOND = re.compile(
    r"\b(?:also|second|another|2 official|two |alongside|proof of residence"
    r"|in addition|combined)\b", re.I)
# A workaround for turning up without ID. The action box deliberately does not
# offer these: an affidavit or a provisional ballot is far harder at the polls
# than it sounds written down, so the page points everyone at bringing an ID.
NOTE_FALLBACK = re.compile(
    r"\b(?:instead|declaration|affidavit|provisional|sign a form)\b", re.I)


def keep_note(note, has_current, has_more):
    """Whether a note says anything the lines above it have not."""
    opening = re.split(r"(?<=[.!?])\s+", note)[0]
    if has_current and NOTE_EXPIRY.search(opening):
        return False
    if has_more and NOTE_SECOND.search(opening):
        return False
    return not NOTE_FALLBACK.search(opening)


def voteamerica_ids(prose):
    """(groups, notes) from VoteAmerica's accepted-ID prose for one state.

    A group is (heading, items) -- most states have one, but Colorado,
    Wyoming and Utah each publish a second list for non-photo documents or an
    alternative pair. Anything that is prose rather than a document comes back
    as a note: the currency rule, a first-time-voter proviso, an alternative
    to showing ID at all.

    Idaho's entry has no item markers in it at all, so it parses to a single
    run-on item; the caller treats fewer than two items as a failure and
    keeps the checked ID_type instead.
    """
    if not prose:
        return [], []
    text = VA_LINK.sub("", prose.strip())
    parts = VA_LEADIN.split(text)
    groups, notes = [], []
    for heading, body in zip(parts[1::2], parts[2::2]):
        body = body.strip()
        splitter = VA_NUMBER if VA_NUMBER.search(body) else VA_MARKER
        items = [i.strip() for i in splitter.split(body) if i.strip()]
        if not items:
            continue
        # A rule or a fresh sentence glued to the final item.
        for pattern in (VA_RULE, VA_GLUE):
            pieces = pattern.split(items[-1], 1)
            if len(pieces) > 1:
                items[-1] = pieces[0].strip()
                notes.append("".join(pieces[1:]).strip())
        merged = []
        for item in items:
            # A numbered list keeps the "; or" that joined its two options.
            item = re.sub(r"[;,]\s*or$", "", item.strip())
            item = item.strip().strip('"').rstrip(".").strip()
            if not item:
                continue
            # Upstream sometimes marks a second list as an item of the first,
            # and sometimes breaks a bracketed proviso onto its own marker.
            if item.lower().startswith("acceptable"):
                notes.append(item)
            elif item.startswith("(") and merged:
                merged[-1] = "%s %s" % (merged[-1], item)
            else:
                merged.append(item)
        if merged:
            groups.append((heading.strip(), merged))
    notes = [sentence(n) for n in notes if n]
    return groups, notes


def top_split(text, seps):
    """Split on separators that sit outside brackets."""
    out, buf, depth = [], "", 0
    for ch in text:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth = max(0, depth - 1)
        if depth == 0 and ch in seps:
            out.append(buf)
            buf = ""
        else:
            buf += ch
    out.append(buf)
    return [s.strip() for s in out if s.strip()]


# A bracket that adds to the category rather than enumerating it -- "(also AL
# college student IDs)". The addition is another accepted ID, so it earns a
# bullet of its own alongside the category, once the joining word is off.
ADDITION = re.compile(r"^(?:also|incl\.?|including)\s+", re.I)
BRACKETED = re.compile(r"^(.*?)\s*\(([^()]+)\)\s*(.*)$")
LIST_JOINER = re.compile(r"^(?:or|and)\s+", re.I)


def split_accepted(text):
    """One state's accepted IDs as (lead, items, notes), for a bulleted list.

    The source writes these five or six different ways, so the split works by
    shape rather than by state: a bracket holding a comma list is the list and
    what precedes it is the lead; otherwise a run of top-level commas is the
    list; a semicolon clause alongside either is a note. Brackets are honoured
    when splitting, so "driver's license (any state), NH ID" is two items and
    not three.

    Where no shape matches -- Ohio's bare "government-issued", Missouri's
    "issued by Missouri or the U.S. government" -- items comes back with the
    one string in it and the page prints a line rather than a list of one.
    """
    if not text:
        return None, [], []
    # Pennsylvania's upstream prose numbers its two options.
    if text.startswith("1)"):
        parts = re.split(r"\s*(?:;\s*)?or\s+\d\)\s*|^1\)\s*", text)
        return None, [p.strip(" .;") for p in parts if p.strip(" .;")], []

    lead, items, notes = None, [], []
    for segment in top_split(text, ";"):
        bracket = BRACKETED.match(segment)
        # Only a bracket that closes its segment is read as one: Oklahoma's
        # "Photo (government or tribal), or the free non-photo county voter ID
        # card" carries its own list outside the brackets.
        if bracket and not bracket.group(3).strip():
            before, inner = bracket.group(1).strip(), bracket.group(2).strip()
            if ADDITION.match(inner):
                # "(also GA public college IDs)" -- the category and the
                # addition are two things a voter could bring, so both are
                # bullets and neither is a heading.
                items = ([before] if before else []) + top_split(
                    ADDITION.sub("", inner), ",")
                continue
            if "," in inner:
                lead = before or lead
                items = top_split(inner, ",")
                continue
            # No list in it, so it qualifies rather than enumerates:
            # "(no student IDs)", "(TN or federal only; ...)".
            items = [before] if before else []
            notes.append(inner)
            continue
        if bracket and "," in bracket.group(2) and not ADDITION.match(bracket.group(2)):
            lead = bracket.group(1).strip() or lead
            items = top_split(bracket.group(2), ",")
            notes.append(bracket.group(3).strip().lstrip(",").strip())
            continue
        parts = top_split(segment, ",")
        if len(parts) > 1:
            items = parts
        elif items or lead is not None:
            notes.append(segment)
        else:
            lead = segment
    # The last item of a written-out list keeps the "or" that joined it.
    items = [LIST_JOINER.sub("", i) for i in items]
    if not items:
        return None, ([lead] if lead else []), notes
    return lead, items, notes


def accepted(id_type, upstream=None):
    """The documents a state accepts, as the tail of "Acceptable IDs include:".

    Printed from the source whole -- this is the one place the page does name
    specific cards. Only a "Photo," or "Photo:" opening comes off, and only
    when what follows reads as a list on its own: Iowa's "Photo, or the signed
    non-photo Voter ID Card" would be left starting on "or", and Florida's
    "Photo with signature" is a description rather than a list, so both keep
    their opening word.

    The checked ID_type column carries a list for every state that asks for ID
    outright. Pennsylvania is the exception -- it asks only of a first-time
    voter at a polling place, so its cell describes when rather than what --
    and there the list is taken from upstream's id_laws_in_person_voting.
    """
    if not id_type:
        return None
    if STATES_THE_RULE.match(id_type):
        if not upstream:
            return None
        text = UPSTREAM_LEAD.sub("", upstream.strip())
        for _ in range(2):
            text = UPSTREAM_TAIL.sub("", text)
        return text.rstrip(". ") + "."
    return LEADS_WITH_PHOTO.sub("", id_type)


def sentence(text):
    """Capitalised, and closed with a full stop."""
    text = text.strip()
    return text[:1].upper() + text[1:].rstrip(".") + "."


def mail_copy(prose):
    """Whether a mail envelope needs a photocopy of an ID, in a sentence.

    This is the only mail rule the page carries. A signature is checked
    everywhere and says nothing; a witness, a notary or an ID number written
    on the envelope are instructions printed on the envelope itself, which
    the voter is holding when they matter. Enclosing a copy of an ID is the
    one that has to be known in advance, because it cannot be done at the
    postbox. Seven states ask for one; the other 44 get no mail line at all.

    Derived from the snapshot's prose, which has not been checked against
    state sources.
    """
    text = prose.lower()
    copy = any(k in text for k in (
        "include a copy", "photocopy", "copy of a valid", "copy of an acceptable",
        "copy of one of the following", "include a photocopy"))
    if not copy:
        return None
    # Four states ask only of first-timers, or of voters sent a notice with
    # their ballot. Telling everyone in Colorado to enclose an ID would be
    # flatly wrong.
    if any(k in text for k in ("first-time voter", "first time voter",
                               "may receive a notice", "some voters")):
        return ("If you are voting by mail for the first time, you may need to"
                " enclose a copy of an ID with your ballot.")
    # Ohio takes the copy only from a voter who has neither ID number to
    # write on the envelope.
    if any(k in text for k in ("if you do not have either", "if you have neither")):
        return ("If you vote by mail and have neither an ID number nor a Social"
                " Security number to write on the envelope, you must enclose a"
                " copy of a photo ID.")
    return "If you vote by mail, you must enclose a copy of your ID."


def card_current(must_be_current):
    """The expiry rule as a sentence, for the share card.

    The page can label the line "Must it be current" and let the source answer
    "Yes" or "No. May be expired up to 4 years." A card has no labels, so the
    answer has to carry its own question.
    """
    if not must_be_current:
        return None
    # "Not specified" is the source's way of saying no rule was found, but a
    # couple of rows qualify it anyway. The qualification is the sentence.
    # "Not specified" is the source saying no rule was found. Two rows qualify
    # it anyway, and the qualification alone reads as the whole rule -- South
    # Dakota's "student IDs must be current" says nothing about the licence
    # most people actually bring.
    rest = re.sub(r"^Not specified[\s.;,]*", "", must_be_current)
    if rest != must_be_current:
        rest = rest.strip("() ")
        if not rest:
            return None
        return "No expiry rule is specified; %s%s." % (
            rest[:1].lower(), rest[1:].rstrip("."))
    # "Mostly" answers a question the card does not print.
    if must_be_current.startswith("Mostly"):
        rest = must_be_current[len("Mostly"):].lstrip(". ")
        return "Your ID must usually be current. " + sentence(rest)
    # A bare description of the window, with no subject to hang it on.
    if must_be_current.startswith("Current or expired"):
        return sentence("Your ID must be current, or expired"
                        + must_be_current[len("Current or expired"):])
    # \b so that "Not specified" does not answer to "No".
    match = re.match(r"(Yes|No)\b", must_be_current)
    if not match:
        # Already a sentence of its own, or close enough to one.
        return sentence(must_be_current)
    answer = match.group(1)
    opening = ("Your ID must be current" if answer == "Yes"
               else "Your ID does not have to be current")
    rest = must_be_current[len(answer):]
    if rest.startswith("."):
        return "%s.%s" % (opening, rest[1:])
    # "Yes, except ...", "Yes; must show ...", "Yes (if showing ID)", "Yes".
    return (opening + rest).rstrip(".") + "."


def main():
    states_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_STATES
    buckets_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_BUCKETS
    full_path = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_FULL

    for path in (states_path, buckets_path, full_path):
        if not os.path.exists(path):
            sys.exit("missing source: %s" % path)

    with open(states_path, newline="", encoding="utf-8") as fh:
        by_state = {r["Code"]: r for r in csv.DictReader(fh, delimiter="\t")}
    with open(buckets_path, newline="", encoding="utf-8") as fh:
        buckets = {r["Code"]: r for r in csv.DictReader(fh, delimiter="\t")}
    with open(full_path, newline="", encoding="utf-8") as fh:
        full = {r["Code"]: r for r in csv.DictReader(fh, delimiter="\t")}

    missing = sorted(set(by_state) ^ set(buckets) | set(by_state) ^ set(full))
    if missing:
        sys.exit("jurisdictions missing from one source: %s" % ", ".join(missing))

    lines = [
        "# GENERATED FILE - do not edit by hand.",
        "# Source: voter-id-by-state.tsv",
        "#         voter-id-buckets.tsv",
        "#         state-data-full.tsv (id_laws_ballot_return, source_voter_id_info)",
        "# Regenerate: python3 scripts/build-midterms-id.py",
        "#",
        "# One entry per jurisdiction (50 states + DC) of week-three voter ID",
        "# rules. Read by layouts/partials/midterms-id.html for any week flagged",
        "# state_id: true in data/midterms.yml.",
        "#",
        "# bucket is A-E, weakest requirement last: A strict photo, B photo",
        "# requested, C strict ID with non-photo OK, D ID requested with non-photo",
        "# OK, E no ID. card is the bucket's one-line summary, which is what the",
        "# share card carries; lede is the same thing as a sentence.",
        "#",
        "# A key is absent wherever the question does not apply to the state, so",
        "# the template shows a line by asking whether its key is there. The",
        "# in-person fields were checked against state sources on 2026-09-22; mail",
        "# is raw VoteAmerica prose and has not been.",
        "",
        "states:",
    ]

    reviewed = 0
    for code in sorted(by_state):
        row = by_state[code]
        bucket_row = buckets[code]
        full_row = full[code]
        bucket = row["Bucket"].strip()
        if bucket not in BUCKET_LEDE:
            sys.exit("%s: unknown bucket %r" % (code, bucket))

        url = URL_OVERRIDE.get(code) or clean(full_row.get("source_voter_id_info"))
        if not url:
            sys.exit("%s: no voter ID url" % code)

        id_type = clean(row.get("ID_type"))
        out = [
            ("code", yaml_str(code)),
            ("name", yaml_str(row["State"].strip())),
            ("bucket", yaml_str(bucket)),
            ("bucket_name", yaml_str(bucket_row["Bucket_name"].strip())),
            ("lede", yaml_str(lede(bucket, strip_examples(id_type)))),
        ]

        # The expiry rule as a sentence, so it answers on its own rather than
        # leaning on a label. One field for both the page and the card.
        current = card_current(strip_examples(clean(row.get("Must_be_current"))))
        if current:
            out.append(("current", yaml_str(current)))

        # A second document, where one is wanted. Its own examples stay: the
        # page names documents again now, so there is nothing to strip them
        # for.
        more = clean(row.get("More_than_one_form"))
        if more:
            out.append(("more_than_one_form", yaml_str(more)))

        # The accepted-ID list. The no-ID states mostly have none to give, but
        # Pennsylvania takes an ID from a first-time voter at a polling place
        # and says which kinds, so the bucket alone cannot decide this.
        # The accepted IDs, from VoteAmerica's own per-state lists. Where they
        # do not parse into a list -- Idaho's entry has no item markers at all
        # -- the checked ID_type column is bulleted instead, which gives
        # categories rather than documents but is better than one run-on line.
        groups, group_notes = voteamerica_ids(
            clean(full_row.get("id_laws_in_person_voting")))
        if sum(len(g[1]) for g in groups) < 2:
            groups, group_notes = [], []
            fallback = accepted(id_type)
            if fallback:
                lead, items, notes = split_accepted(fallback)
                heading = ACCEPTED_LABEL[bucket]
                heading = (
                    "%s (%s):" % (heading, lead[:1].lower() + lead[1:])
                    if lead else "%s include:" % heading)
                groups = [(heading, items)]
                group_notes = [sentence(re.sub(r"^but\s+", "", n, flags=re.I))
                               for n in notes]
        if groups:
            out.append(("accepted_groups", groups))
        group_notes = [n for n in group_notes
                       if keep_note(n, bool(current), bool(more))]
        if group_notes:
            out.append(("accepted_notes", [yaml_str(n) for n in group_notes]))

        # Not carried: what happens to a voter who turns up with nothing, and
        # how long they have to fix it. Neither the action box nor the share
        # card offers a workaround -- an affidavit or a provisional ballot is
        # far harder at the polls than it reads on a page, so both surfaces
        # say "bring your ID" and leave the fallback to the state's own site.
        # If_no_ID and Cure_window in the sources are deliberately unused.

        # The only mail rule the page carries is the one a voter has to know
        # before they seal the envelope.
        mail = clean(full_row.get("id_laws_ballot_return"))
        if mail:
            summary = mail_copy(mail)
            if summary:
                out.append(("mail", yaml_str(summary)))

        out.append(("url", yaml_str(url)))

        # Carried for previews only, the way midterms_states.yml carries its
        # own review notes: the compiler's caveats about a state, and whether
        # the upstream snapshot puts it in the wrong bucket.
        notes = clean(bucket_row.get("Notes"))
        flag = clean(bucket_row.get("Upstream_flag"))
        reasons = [r for r in (flag, notes) if r]
        if reasons:
            reviewed += 1
            out.append(("needs_review", "true"))
            out.append(("review_reason", yaml_str(" ".join(reasons))))

        lines.append("  %s:" % code)
        for key, value in out:
            if isinstance(value, list) and value and isinstance(value[0], tuple):
                lines.append("    %s:" % key)
                for heading, items in value:
                    lines.append("      - heading: %s" % yaml_str(heading))
                    lines.append("        items:")
                    lines.extend("          - %s" % yaml_str(i) for i in items)
            elif isinstance(value, list):
                lines.append("    %s:" % key)
                lines.extend("      - %s" % item for item in value)
            else:
                lines.append("    %s: %s" % (key, value))

    lines.insert(lines.index(""),
                 "# %d of %d entries carry a review note." % (reviewed, len(by_state)))
    lines.append("")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print("wrote %s (%d jurisdictions, %d with review notes)"
          % (OUT, len(by_state), reviewed))


if __name__ == "__main__":
    main()

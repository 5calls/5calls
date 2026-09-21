#!/usr/bin/env python3
"""Turn the VoteAmerica voting-access snapshot into a Hugo data file.

    python3 scripts/build-midterms-voting.py [state-voting-access.tsv] [state-data-full.tsv]

Writes data/midterms_voting.yml, which layouts/partials/midterms-voting.html
reads for any week flagged `state_voting: true` in data/midterms.yml. The
snapshot is the source of truth: re-run this after VoteAmerica publishes a new
one rather than editing the generated file. Temporary, like the rest of
/midterms.

Week one's sibling script, build-midterms-states.py, does the same job for
registration deadlines. This one covers the rest of a state's options: early
voting, same-day registration, and the two halves of voting by mail — asking
for a ballot and getting it back.

Upstream puts four different shapes in one column, so every cell goes through
parse_cell:

    Tue, Nov 3, 2026                     a plain date
    Tue, Nov 3, 2026 (received)          ... and whether it must arrive or
    Tue, Nov 3, 2026 (12PM, received)    be postmarked, sometimes by a time
    Tue, Oct 20, 2026 (business days;    ... or a note that qualifies it
      holidays not applied)
    Varies by county                     no statewide date
    You cannot hand-deliver your         prose where a date was expected
      mail-in ballot in Tennessee...
    Not available / Not listed upstream  the option does not exist

"Not available", "Not listed upstream" and "N/A" all become an absent key, so
the template decides what to show by asking whether a key is there, never by
matching prose.

state-voting-access.tsv caps its prose cells at 200 characters, which cuts
eight states' same-day registration directions and Wisconsin's in-person
request note mid-link — a dangling "[" that would render literally on the
page. Those two fields are therefore taken from state-data-full.tsv, which
carries them whole. The repair only ever replaces a value with a longer one
that starts the same way, so a snapshot that stops truncating needs no change
here.
"""

import csv
import os
import re
import sys
from datetime import date, datetime, timedelta

DEFAULT_SNAPSHOT = "../voteamerica-data/state-voting-access.tsv"
DEFAULT_FULL = "../voteamerica-data/state-data-full.tsv"
OUT = "data/midterms_voting.yml"

# The same short months the rest of /midterms uses: September is "Sept", and
# the short months stay whole. The snapshot writes "Sep".
MONTHS = {
    "Jan": "Jan", "Feb": "Feb", "Mar": "March", "Apr": "April",
    "May": "May", "Jun": "June", "Jul": "July", "Aug": "Aug",
    "Sep": "Sept", "Oct": "Oct", "Nov": "Nov", "Dec": "Dec",
}
WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

# "Mail it by" leaves a week for the post, as week one's registration card does.
MAIL_BY_DAYS = 7

# Every way upstream says "this does not exist here".
ABSENT = {"", "n/a", "not available", "not listed", "not listed upstream"}

# Prose upstream gives in place of a date, which is meant and not a parse
# failure. Anything else short enough to have been a date gets a warning.
KNOWN_PROSE = {"no specified deadline"}

DATE = r"[A-Z][a-z]{2}, [A-Z][a-z]{2,4} \d+, \d{4}"
CELL = re.compile(r"^(?P<date>" + DATE + r")(?:\s*\((?P<qual>[^)]*)\))?$")
# "12PM", "8pm", "4:30PM" — a time, as against a note like "business days".
TIME = re.compile(r"^\d{1,2}(?::\d{2})?\s*[AaPp][Mm]$")

# Fields the derived snapshot truncates, and the column holding them whole in
# state-data-full.tsv.
REPAIRS = {"SDR_locations": "sdr_locations",
           "Request_deadline_in_person": "absentee_deadline_in_person"}
# How much of a truncated value must match the full one for it to be the same
# sentence rather than a different field that happens to be longer.
REPAIR_PREFIX = 40
# state-voting-access.tsv caps prose at 200 characters; a cell at or near that,
# or one ending in an ellipsis, is the only kind worth repairing.
TRUNCATED_AT = 195

# Dates checked against the state's own 2026 election calendar, website or
# statute, and found to differ from the snapshot's. The snapshot counts back
# from Election Day and applies no weekend or holiday rollover, so a date that
# lands on a weekend is the usual reason to look; a date with no official
# guidance to move it stays as counted. These win over the snapshot.
# Last checked 2026-09-20.
#
# A value may be a date, a (date, time) pair, or None, which removes the field
# because the option exists but carries no deadline.
OFFICIAL_OVERRIDES = {
    # Alaska keys the deadline to how the BALLOT is delivered, not how the
    # application is sent, so one snapshot row cannot carry it. The 2026
    # calendar lists both, citing AS 15.20.081(b): 10/24 "Deadline to receive
    # absentee by-mail applications" and 11/02 "Deadline to receive absentee by
    # electronic transmission ballot applications", the latter at 5 p.m. Alaska
    # time. There is no in-person application deadline at all — absentee
    # in-person voting runs from Oct 19 through Election Day.
    # elections.alaska.gov/calendar/
    "AK": {"request_online": (date(2026, 11, 2), "5PM"),
           "request_in_person": None},
    # California mails a ballot to every ACTIVE registered voter — EC 3001 and
    # the SOS's own wording; inactive registrations are excluded by statute.
    # Returns close with the polls. sos.ca.gov/elections/voter-registration/vote-mail
    "CA": {"absentee_type": "Automatic mail ballot to every active registered voter",
           "return_in_person": (date(2026, 11, 3), "8PM"),
           # EC 3020(b): postmarked on or before election day and received
           # within seven days. sos.ca.gov key dates names Nov 10.
           "return_mail_received_by": date(2026, 11, 10)},
    # Florida's request deadlines close at 5 p.m. (§101.62(3)(c), "5 p.m. local
    # time on the 12th day before"). In person is NOT that day: office pickup
    # runs freely through Oct 23 (§101.62(3)(d)3), then only on an emergency
    # affidavit — a window this data cannot express, so the free date is what
    # we publish. files.floridados.gov 2026 Election Dates and Activities
    "FL": {"request_online": (date(2026, 10, 22), "5PM"),
           "request_mail": (date(2026, 10, 22), "5PM"),
           "request_in_person": date(2026, 10, 23)},
    # Alabama authorises a commercial carrier alongside the post and hand
    # delivery, and a hand-delivered ballot is due by close of business the day
    # before — 5 p.m., not election day. §§ 17-11-9, 17-11-7, 17-9-30.
    # sos.alabama.gov/alabama-votes/voter/absentee-voting
    "AL": {"return_methods": "local election office, commercial carrier",
           "return_in_person": (date(2026, 11, 2), "5PM")},
    # Mississippi sets no closing date for a mailed application at all — the
    # Nov 2 we carried was the snapshot's arithmetic, not a rule (§23-15-715(b)
    # opens a 45-day window with no end). In person closes at noon on the
    # Saturday before (§23-15-637(1)(b)). A ballot postmarked by election day
    # counts if it reaches the clerk within five business days, which the
    # Supreme Court upheld in Watson v. RNC in June 2026. And hand delivery is
    # barred, but a common carrier is expressly allowed (§23-15-631(1)(c)), so
    # upstream's "put it in the mailbox" was too narrow.
    # sos.ms.gov/content/documents/elections/2026 Elections Calendar.pdf
    "MS": {"request_mail": None,
           "request_in_person": (date(2026, 10, 31), "12PM"),
           "return_mail_received_by": date(2026, 11, 10),
           "return_methods": "common carrier such as UPS or FedEx",
           "return_in_person": {"note": "You cannot hand-deliver your ballot in "
                                        "Mississippi — return it by mail or a common "
                                        "carrier such as UPS or FedEx."}},
    # Hawaii mails a ballot to every voter, so nothing is requested. Oct 27 is
    # the deadline to have your ballot sent to an ALTERNATE ADDRESS, and there
    # is no in-person request channel at all — replacements go by phone or the
    # county website with no published deadline. Hawaii's term for an early
    # voting place is a voter service center.
    # elections.hawaii.gov/voting/absentee-voting/
    "HI": {"request_mail": None, "request_in_person": None,
           "return_methods": "drop box, voter service center",
           "return_mail": (date(2026, 11, 3), "7PM"),
           "return_in_person": (date(2026, 11, 3), "7PM")},
    # Iowa's early voting is statewide, not county-set: Iowa Code 53.10(1)
    # opens it 20 days out and 53.2(1)(a) runs it to the day before. The
    # in-person channel runs the whole window, not to the mailed-request
    # deadline. Ballots arriving after the polls close still count if they were
    # mailed in time, up to the county canvass on Nov 10 (53.17A(3)(a), 50.24).
    "IA": {"ev_start": date(2026, 10, 14), "ev_end": (date(2026, 11, 2), "5PM"),
           "request_mail": (date(2026, 10, 19), "5PM"),
           "request_in_person": (date(2026, 11, 2), "5PM"),
           "return_mail": (date(2026, 11, 3), "8PM"),
           "return_mail_received_by": date(2026, 11, 10),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Illinois counts a ballot postmarked by election day that arrives within
    # 14 days. 10 ILCS 5/19-8(c) with 18A-15(a); the SBE calendar dates it.
    "IL": {"return_mail_received_by": date(2026, 11, 17)},
    # Kansas repealed its postmark grace: 2025 SB 4 struck it from K.S.A.
    # 25-1132(b), which now reads "the deadline for the receipt by mail ...
    # shall be 7:00 p.m. on the date of the election", effective Jan 1 2026.
    # A Douglas County injunction currently requires postmarked ballots to be
    # counted if they arrive by the Friday after, and the Secretary's motion to
    # stay is pending — so this is contested. We publish the statute, because
    # "get it in by election day" is safe under either outcome and "a postmark
    # is enough" is not. Advance voting is also a statewide window, earliest
    # Oct 14, every county open by Oct 27, closing at noon the day before.
    # ksrevisor.gov/statutes/chapters/ch25/025_011_0032.html
    "KS": {"return_mail": {"date": date(2026, 11, 3), "time": "7PM", "received": True},
           "ev_start": date(2026, 10, 14),
           "request_in_person": (date(2026, 11, 2), "12PM"),
           "return_methods": "drop box, local election office, polling place"},
    # New Hampshire checked out entirely; only the hour was missing. RSA
    # 657:15, I: the clerk provides a ballot in person "up until 5:00 p.m. on
    # the day before the election". Not expressible here, but worth knowing:
    # since Sept 2025 an absentee application must carry photo ID or a
    # notarised signature (RSA 657:17-c) or no ballot is issued.
    "NH": {"request_in_person": (date(2026, 11, 2), "5PM")},
    # North Dakota's county-set early voting is real — counties choose whether
    # to offer it at all, and most do not. Its postmark rule was repealed by
    # HB 1165 in 2025, so received-by-close-of-polls is right and there is
    # deliberately no backstop; the widely cited "postmarked the day before"
    # is the old law. Only the hour was missing. ndlegis.gov/cencode/t16-1c01.pdf
    "ND": {"return_mail": (date(2026, 11, 3), "7PM"),
           "return_in_person": (date(2026, 11, 3), "7PM")},
    # DC's request channels are all real, unlike the other automatic-ballot
    # states — though every active voter is mailed a ballot regardless, so Oct
    # 19 is for redirecting it rather than a prerequisite to voting. A
    # postmarked ballot counts until the tenth day after: DC Code
    # § 1-1001.05(a)(10B). Ballots also go to the Board's own office.
    "DC": {"absentee_type": "Automatic mail ballot to every active registered voter",
           "return_methods": "drop box, early voting site, polling place, Board's office",
           "return_mail_received_by": date(2026, 11, 13),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Minnesota's drop boxes are a county or city option and only about a
    # dozen jurisdictions have one, so listing them flat overstated them. Its
    # in-person return really does close at 5 p.m. while the polls run to 8 —
    # a 2025 change we happened to have right. Not expressible: what we show as
    # early voting is its 46-day in-person absentee window; Minnesota's own
    # Early Voting is a separate channel opening Oct 16, new this year.
    "MN": {"request_online": (date(2026, 11, 2), "5PM"),
           "request_mail": (date(2026, 11, 2), "5PM"),
           "request_in_person": (date(2026, 11, 2), "5PM"),
           "return_methods": "local election office, drop box in some counties and cities",
           "return_mail": (date(2026, 11, 3), "8PM")},
    # Massachusetts keeps a three-day window for a mailed ballot (c. 54
    # § 25B(a)(13) and § 93) and its drop boxes are "where provided", not
    # mandated, so listing them flatly overstated them. Early voting locations
    # take ballots too. Its same-day registration "no" is right: the VOTES Act
    # moved the deadline from twenty days to ten, it did not create SDR.
    "MA": {"request_online": (date(2026, 10, 27), "5PM"),
           "request_mail": (date(2026, 10, 27), "5PM"),
           "request_in_person": (date(2026, 10, 27), "5PM"),
           "return_methods": "drop box where your town provides one, local election office, "
                             "early voting site",
           "return_mail_received_by": (date(2026, 11, 6), "5PM"),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Maryland's postmarked ballots run the longest of any state checked: the
    # local board may receive them until 10 a.m. on the second Friday after the
    # election, and a missing postmark falls back to the date on the voter's
    # oath. COMAR 33.11.03.08B(2). Not expressible: its early voting sites stop
    # taking ballots when early voting ends on Oct 29, not on election day.
    "MD": {"return_mail_received_by": (date(2026, 11, 13), "10AM"),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Virginia's postmarked ballots must reach the registrar by noon on the
    # third day. Careful reading the statute: 2026 cc. 61 and 62 move that to
    # 5 p.m., but not until Jan 1 2027, so the version in force for this
    # election is the noon one. § 24.2-709(B), 1VAC20-70-20(F).
    "VA": {"ev_end": (date(2026, 10, 31), "5PM"),
           "request_online": (date(2026, 10, 23), "5PM"),
           "request_mail": (date(2026, 10, 23), "5PM"),
           "request_in_person": (date(2026, 10, 23), "5PM"),
           "return_mail_received_by": (date(2026, 11, 6), "noon"),
           "return_in_person": (date(2026, 11, 3), "7PM")},
    # New Jersey is the opposite of the phantom-channel problem: it gained an
    # online mail-in application this cycle (N.J.S.A. 19:63-3(b)(2), operative
    # Jan 1 2026) and we were not showing it. A postmarked ballot counts for
    # 144 hours after the polls close, 19:63-22. Not expressible: an
    # unpostmarked one delivered by USPS gets only 48 hours, to Nov 5.
    "NJ": {"absentee_type": "No-excuse vote-by-mail",
           "request_online": date(2026, 10, 27),
           "return_mail_received_by": (date(2026, 11, 9), "8PM"),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Connecticut no longer requires an excuse at all: Public Act 26-42 struck
    # the six-reason list from § 9-135, effective from passage, carrying out
    # the 2024 referendum. The reason this was missed is worth remembering —
    # cga.ct.gov's "current" statutes are revised to January 1 2026 and still
    # print the old list verbatim, so the codified text says the opposite of
    # the law. A drop box there counts as mailed, so it runs to 8 p.m. on
    # election day even though handing the clerk a ballot stops the day before,
    # and same-day registration happens at a designated town location rather
    # than at the polls. portal.ct.gov/sots/election-services/voter-information
    "CT": {"absentee_type": "No-excuse absentee",
           "return_methods": "drop box open through 8PM on election day, local election office",
           "return_mail": (date(2026, 11, 3), "8PM"),
           "sdr_locations": "Go to your town’s designated same-day registration location — "
                            "not your polling place. It is open during early voting and from "
                            "6 a.m. to 8 p.m. on Election Day."},
    # South Carolina is the fourth, and its statute is the plainest of them:
    # § 7-13-25(A) lets a qualified elector vote early "without excuse", and
    # Act 150 of 2022 abolished in-person absentee altogether, so the excuse
    # now gates the mailed ballot alone. A ballot may also go back to an early
    # voting centre while early voting runs; § 7-15-385's "only by" list rules
    # out drop boxes and election-day polling places both.
    "SC": {"absentee_type": "Excuse required by mail; no excuse needed in person",
           "request_mail": (date(2026, 10, 23), "5PM"),
           "request_in_person": (date(2026, 10, 23), "5PM"),
           "return_methods": "local election office, early voting center through Oct 31",
           "return_mail": (date(2026, 11, 3), "7PM"),
           "return_in_person": (date(2026, 11, 3), "7PM")},
    # Louisiana is the third state whose excuse gates the mail ballot only:
    # R.S. 18:1303(A) lets "any person who is qualified to vote" vote early in
    # person, and it is (B) that carries the list. Everything closes at
    # 4:30 p.m. there — requests on Oct 30 and, unusually, the mail return on
    # Nov 2, the day before the election, which is real and not an artifact.
    # A commercial courier is a permitted route; a drop box is not.
    # Not expressible: early voting runs 8:30 to 6 and skips Sunday Oct 25.
    "LA": {"absentee_type": "Excuse required by mail; no excuse needed in person",
           "request_online": (date(2026, 10, 30), "4:30PM"),
           "request_mail": (date(2026, 10, 30), "4:30PM"),
           "request_in_person": (date(2026, 10, 30), "4:30PM"),
           "return_methods": "local election office, commercial courier",
           "return_mail": (date(2026, 11, 2), "4:30PM")},
    # Nebraska's Oct 23 is the last day to have a ballot POSTED to you, not the
    # last day to ask for one. In person you obtain and vote a ballot at the
    # county office through the day before (§ 32-942), so we were closing a
    # channel ten days early — the same conflation Idaho had. Its Oct 23 really
    # is also the in-person registration deadline, but by two independent
    # statutes both landing on the second Friday, so that part is coincidence.
    # Nebraska spans Central and Mountain time, so its election-day hours carry
    # both. sos.nebraska.gov/sites/default/files/doc/elections/2026/2026_Election_Calendar.pdf
    "NE": {"request_mail": (date(2026, 10, 23), "6PM"),
           "request_in_person": date(2026, 11, 2),
           "return_methods": "drop box, local election office, agent or courier",
           "return_mail": (date(2026, 11, 3), "8PM CT / 7PM MT"),
           "return_in_person": (date(2026, 11, 3), "8PM CT / 7PM MT")},
    # Oklahoma sets one request deadline for every channel, 5 p.m. on the third
    # Monday before (26 O.S. § 14-103). Its hand-delivery cutoff is not the
    # 5 p.m. we were publishing: the statute says "end of regular business
    # hours" and the state says "close of business", which varies by county, so
    # asserting a clock time claimed a precision no source supports. Its return
    # list is exhaustive and holds no drop box, so omitting one is right.
    # Not expressible: a standard absentee ballot there must be notarized.
    "OK": {"request_online": (date(2026, 10, 19), "5PM"),
           "request_mail": (date(2026, 10, 19), "5PM"),
           "request_in_person": (date(2026, 10, 19), "5PM"),
           "return_methods": "local election office, private mail service",
           "return_mail": (date(2026, 11, 3), "7PM"),
           "return_in_person": (date(2026, 11, 2), "close of business")},
    # Wisconsin's drop boxes are lawful again — the state Supreme Court
    # overruled Teigen in July 2024 — but each municipal clerk decides whether
    # to offer one, so they are named as a maybe rather than a fact. Its
    # in-person request does have a statutory outer date, the Sunday before
    # (6.86(1)(b)); upstream's "varies by municipality" prose implied none
    # existed. Upstream's own note also offered a Monday that cannot happen,
    # since in-person absentee ends that Sunday.
    "WI": {"request_online": (date(2026, 10, 29), "5PM"),
           "request_mail": (date(2026, 10, 29), "5PM"),
           "request_in_person": date(2026, 11, 1),
           "return_methods": "local election office, polling place, "
                             "drop box where your municipality offers one",
           "return_mail": (date(2026, 11, 3), "8PM"),
           "return_in_person": (date(2026, 11, 3), "8PM"),
           "sdr_locations": "You may register and vote at all [polling places]"
                            "(https://myvote.wi.gov/en-us/Find-My-Polling-Place) on Election "
                            "Day. You can register to vote in person at the [clerk’s office]"
                            "(https://myvote.wi.gov/en-us/My-Municipal-Clerk) until 5 p.m. on "
                            "the Friday before. Same-day registration is not available at an "
                            "early voting site in the three days before Election Day."},
    # Idaho's in-person request runs a week longer than the other two: the same
    # subsection sets mail and online at the eleventh day but in-person "not
    # later than 5:00 p.m. on the Friday before the election" (34-1002(7)).
    # Both land on a Friday, which is how it went unnoticed. Its Oct 23 really
    # is the registration deadline too — two statutes independently say the
    # eleventh day — so that coincidence is genuine, unlike Washington's.
    # Idaho takes no postmark at all: a ballot must be in hand by 8 p.m.
    # (34-1005), so it gets no arrival date. Not expressible: early voting is
    # county-optional there, and drop boxes have no statutory guarantee.
    "ID": {"ev_end": (date(2026, 10, 30), "5PM"),
           "request_online": (date(2026, 10, 23), "5PM"),
           "request_mail": (date(2026, 10, 23), "5PM"),
           "request_in_person": (date(2026, 10, 30), "5PM"),
           "return_methods": "drop box where your county provides one, local election office",
           "return_mail": (date(2026, 11, 3), "8PM"),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Indiana's early voting does not end on Oct 31 — that is only the date
    # its clerks must open on a Saturday, which upstream mistook for the close.
    # It runs to noon the day before the election (IC 3-11-10-26), so we were
    # cutting two days off. Its excuse gates the by-mail ballot only; in-person
    # early voting is open to any registered voter. Mail ballots must be in
    # hand by 6 p.m. with no postmark grace, and applications close at 11:59
    # p.m. in.gov/sos/elections/voter-information/ways-to-vote/absentee-voting/
    "IN": {"absentee_type": "Excuse required by mail; no excuse needed in person",
           "ev_end": (date(2026, 11, 2), "12PM"),
           "request_online": (date(2026, 10, 22), "11:59PM"),
           "request_mail": (date(2026, 10, 22), "11:59PM"),
           "request_in_person": (date(2026, 10, 22), "11:59PM"),
           "return_mail": (date(2026, 11, 3), "6PM")},
    # Missouri needs an excuse to vote by mail but none to vote absentee in
    # person from the second Tuesday before — § 115.277.1 — so the flat label
    # was talking people out of an option they have. Its in-person period also
    # closes at 5 p.m. the day before rather than with the polls (§ 115.279.4).
    # Deliberately not published: its noon Nov 6 backstop is military and
    # overseas only, and showing it as a general arrival date would give
    # ordinary voters three days they do not have. Drop boxes are banned
    # outright by § 115.291.5, so leaving them off is correct.
    "MO": {"absentee_type": "Excuse required by mail; no excuse needed in person",
           "ev_end": (date(2026, 11, 2), "5PM"),
           "request_mail": (date(2026, 10, 21), "5PM"),
           "return_mail": (date(2026, 11, 3), "7PM"),
           "return_in_person": (date(2026, 11, 3), "7PM")},
    # North Carolina's request deadline is a week earlier than upstream had it,
    # and this is the one error so far that would make somebody act too late
    # rather than merely confuse them. S.B. 747 moved it in 2023 from the first
    # Tuesday before the election to the second — G.S. 163-230.1, "not later
    # than 5:00 P.M. on the second Tuesday before the election" — and the
    # snapshot kept the old seven-day offset. Same-day registration runs during
    # early voting only: the state says plainly it "is not available for most
    # voters on Election Day", so claiming both would send people to the polls
    # to register. ncsbe.gov/voting/upcoming-election
    "NC": {"request_online": (date(2026, 10, 20), "5PM"),
           "request_mail": (date(2026, 10, 20), "5PM"),
           "request_in_person": (date(2026, 10, 20), "5PM"),
           "sdr_election_day": False,
           "return_mail": (date(2026, 11, 3), "7:30PM"),
           "return_in_person": (date(2026, 11, 3), "7:30PM")},
    # Nevada repealed ballot requests outright when it went all-mail in 2021 —
    # NRS ch. 293 has no application section at all — so both request rows were
    # phantom. Oct 20 is the cutoff to register and still be posted a ballot
    # automatically (NRS 293.269911(1)), not a request deadline. A postmarked
    # ballot counts until 5 p.m. on the fourth day after (NRS 293.269921(1)(b)).
    # That day is a Saturday and NRS 293.1275(2) may or may not push it to the
    # Monday; the statute's own date is what we publish.
    "NV": {"request_mail": None, "request_in_person": None,
           "absentee_type": "Automatic mail ballot to every active registered voter",
           "return_mail_received_by": (date(2026, 11, 7), "5PM"),
           "return_in_person": (date(2026, 11, 3), "7PM")},
    # Vermont's early voting opens 45 days out for a statewide election, not
    # the 20 days that governs local ones — upstream took the local rule, and
    # Oct 14 is in fact Vermont's deadline for clerks to post sample ballots.
    # Its request channels are all real (there is a fourth, by phone, this data
    # cannot hold), and towns may provide drop boxes. Not expressible: the
    # clerk's office stops taking ballots the day before, so Nov 3 belongs to
    # the polling place alone.
    # outside.vermont.gov/dept/sos/.../vermont_election_procedures.pdf
    "VT": {"ev_start": date(2026, 9, 19),
           "absentee_type": "Automatic mail ballot to every active registered voter",
           "return_methods": "local election office, polling place, drop box where your town provides one",
           "request_online": (date(2026, 11, 2), "5PM"),
           "request_mail": (date(2026, 11, 2), "5PM"),
           "request_in_person": (date(2026, 11, 2), "5PM"),
           "return_mail": (date(2026, 11, 3), "7PM"),
           "return_in_person": (date(2026, 11, 3), "7PM")},
    # Washington issues a ballot to every active voter automatically
    # (RCW 29A.40.010) and its own FAQ says "there is no need to request a
    # ballot" — so both request rows were phantom, and Oct 26 was the online
    # and mail REGISTRATION deadline wearing the wrong label. Its voting period
    # runs through 8 p.m. on election day itself (RCW 29A.40.160), so ending it
    # Nov 2 clipped the busiest day. A postmarked ballot counts until the day
    # before certification, 21 days out (RCW 29A.60.190).
    "WA": {"request_mail": None, "request_in_person": None,
           "ev_end": (date(2026, 11, 3), "8PM"),
           "return_methods": "drop box, county elections office, voting center",
           "return_mail_received_by": date(2026, 11, 23),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Utah's Oct 23 was never a ballot deadline — it is the voter registration
    # deadline, which upstream filed under "request". The real one is Oct 27 at
    # 5 p.m., seven days out, when the last ballots go in the post
    # (20A-3a-202(2)(a)); the Lt. Governor's calendar names it "last day to
    # request a ballot". Early voting is statewide too, not county-set:
    # 20A-3a-601(2) runs it from 14 days out through the Friday before, with
    # counties free to pick at least four days inside that. HB 300's opt-in
    # switch is 2029, so the automatic ballot still reaches every ACTIVE voter
    # in 2026. vote.utah.gov/current-election-information/
    "UT": {"ev_start": date(2026, 10, 20), "ev_end": date(2026, 10, 30),
           "absentee_type": "Automatic mail ballot to every active registered voter",
           "request_online": (date(2026, 10, 27), "5PM"),
           "request_mail": (date(2026, 10, 27), "5PM"),
           "request_in_person": (date(2026, 10, 27), "5PM")},
    # Oregon has no ballot request either — those rows described replacement
    # ballots. ORS 254.470(6)(e)(B) counts a ballot postmarked by election day
    # that arrives within seven days, and an unpostmarked one is presumed
    # timely if it arrives by then. sos.oregon.gov current-elections-calendar
    "OR": {"request_mail": None, "request_in_person": None,
           "return_mail_received_by": date(2026, 11, 10),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Georgia's drop boxes live inside early voting sites and close when
    # advance voting ends, so on Election Day the registrar's office is the
    # only in-person return. O.C.G.A. § 21-2-382(c): "All drop boxes shall be
    # closed when the advance voting period ends."
    "GA": {"return_methods": "drop box (inside early voting sites, through Oct 30), "
                             "local election office"},
    # Michigan's early voting is a statewide constitutional minimum, not a
    # county choice: Const. Art. II §4(1)(m), nine consecutive days from the
    # second Saturday before the election. Communities may add days, which
    # this data cannot express. michigan.gov/sos/elections/voting
    "MI": {"ev_start": date(2026, 10, 24), "ev_end": date(2026, 11, 1),
           "request_online": (date(2026, 10, 30), "5PM"),
           "request_mail": (date(2026, 10, 30), "5PM"),
           "request_in_person": (date(2026, 11, 2), "4PM"),
           "return_mail": (date(2026, 11, 3), "8PM"),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Ohio has no early voting site return — ballots may not go to a polling
    # place — but it does have a drop box at each board office, which upstream
    # missed entirely. ORC 3509.05. Applications close at 8:30 p.m. and the
    # polls at 7:30 p.m. codes.ohio.gov/ohio-revised-code/section-3509.05
    "OH": {"return_methods": "drop box, local election office",
           "request_mail": (date(2026, 10, 27), "8:30PM"),
           "request_in_person": (date(2026, 10, 27), "8:30PM"),
           "return_mail": (date(2026, 11, 3), "7:30PM"),
           "return_in_person": (date(2026, 11, 3), "7:30PM")},
    # Pennsylvania has no early voting at all: "there are no polling places
    # open for in-person voting before Election Day". What it offers is
    # on-demand mail voting at a county office, which is not the same thing
    # and is not this field. Applications close at 5 p.m. (25 P.S.
    # § 3146.2a(a)), returns at 8 p.m. with no postmark grace.
    # pa.gov/agencies/vote/elections/fact-checking-pa-related-election-claims
    "PA": {"early_voting": False,
           "absentee_type": "No-excuse mail-in ballot",
           "request_online": (date(2026, 10, 27), "5PM"),
           "request_mail": (date(2026, 10, 27), "5PM"),
           "request_in_person": (date(2026, 10, 27), "5PM"),
           "return_mail": (date(2026, 11, 3), "8PM"),
           "return_in_person": (date(2026, 11, 3), "8PM")},
    # Texas counts the POSTMARK, not receipt: a ballot postmarked by 7 p.m. on
    # Election Day is valid if it arrives by 5 p.m. the next day. Publishing
    # "received by Nov 3" was wrong in the direction that loses ballots. The
    # Nov 4 receipt backstop cannot be expressed here. SOS form 6-26.
    "TX": {"return_mail": {"date": date(2026, 11, 3), "time": "7PM", "received": False},
           # Postmarked by 7 p.m. on election day, received by 5 p.m. the next
           # day. Publishing the postmark without this reads as though a ballot
           # arriving Nov 4 is lost, when it is the rule that saves it.
           "return_mail_received_by": date(2026, 11, 4)},
}
# Checked against official sources and left exactly as the snapshot counted:
#
# AK  by-mail request, Sat Oct 24. AS 01.10.080 excludes only holidays from
#     the count and AS 44.12.010 makes Sunday a holiday but not Saturday, so
#     nothing moves it. The Division's own calendar notes "Absentee Office is
#     open" that day, and its REAA entry spells out the same reasoning.
# NY  online and by-mail request, Sat Oct 24, receipt-based. Election Law
#     §8-400(2)(c) and §8-700 both set the tenth day before the election and
#     both say "must be received"; §1-106(1)'s weekend rollover governs
#     candidate filings, not ballot applications. In person is Nov 2, which is
#     what the snapshot already carried. nysenate.gov/legislation/laws/ELN/8-400
# TN  by-mail and in-person request, Sat Oct 24, receipt-based. The state's own
#     "Key Dates for the 2026 Election Cycle" prints the registration deadline
#     rolled off Sunday to "Monday, October 5" while printing the absentee one
#     as "Saturday, October 24" — and does the same for the May 2026 election —
#     so leaving it on the Saturday is deliberate. sos.tn.gov/elections/calendar
USED_OVERRIDES = set()


def absent(value):
    return value.strip().lower() in ABSENT


def fmt(day):
    """A date the way the page writes them: "Mon, Oct 5", with no year."""
    return "%s, %s %d" % (WEEKDAYS[day.weekday()], MONTHS[day.strftime("%b")], day.day)


def repair(value, full, warnings, code, column):
    """The untruncated value, where the full snapshot has one.

    Only a cell that looks cut off is repaired. The two snapshots disagree by
    design everywhere else — this one carries deadlines as dates, the full one
    as text counted from Election Day — so comparing them generally would
    report every state as a mismatch.

    Only replaces a value with a longer one that starts the same way, so this
    cannot quietly swap in a different field.
    """
    value = value.strip()
    if not (value.endswith("...") or len(value) >= TRUNCATED_AT):
        return value
    full = (full or "").strip()
    if not full or len(full) <= len(value):
        warnings.append("%s: %s looks truncated and the full snapshot has no longer value"
                        % (code, column))
        return value
    if not full.startswith(value[:REPAIR_PREFIX]):
        warnings.append("%s: %s looks truncated but the full snapshot starts differently; "
                        "keeping the short one" % (code, column))
        return value
    return full


def override(code, prefix, cell):
    """The checked date where we have one, else the cell as the snapshot had it.

    The receipt basis survives an override, since correcting a date says
    nothing about whether the thing must arrive or be postmarked.
    """
    fixes = OFFICIAL_OVERRIDES.get(code, {})
    if prefix not in fixes:
        return cell
    USED_OVERRIDES.add((code, prefix))
    fix = fixes[prefix]
    if fix is None:
        return None
    # A date, a (date, time) pair, or a dict for the rest — {"date", "time",
    # "received"} — since correcting Texas means changing the receipt basis,
    # not just the day.
    # Prose in place of a date, where upstream's own prose is wrong rather
    # than merely absent.
    if isinstance(fix, dict) and "note" in fix and "date" not in fix:
        return {"note": fix["note"]}
    if isinstance(fix, dict):
        day, when, basis = fix.get("date"), fix.get("time"), fix.get("received")
    elif isinstance(fix, tuple):
        day, when, basis = fix[0], fix[1], None
    else:
        day, when, basis = fix, None, None
    out = {"date": fmt(day), "iso": day.isoformat()}
    if when:
        out["time"] = when
    elif cell and "time" in cell:
        out["time"] = cell["time"]
    if basis is not None:
        out["received"] = basis
    elif cell and "received" in cell:
        out["received"] = cell["received"]
    return out


def scalar(code, key, value):
    """A checked flag, type or method list, else what the snapshot carried.

    The companion to override() for the fields that are not deadlines: whether
    a state has early voting at all, what kind of mail voting it offers, and
    where a ballot may be returned.
    """
    fixes = OFFICIAL_OVERRIDES.get(code, {})
    if key not in fixes:
        return value
    USED_OVERRIDES.add((code, key))
    return fixes[key]


def parse_cell(value, warnings, code, column):
    """One cell as a dict, or None where the option does not exist.

    Returns some of: date, time, received, note, varies. Anything that is not
    a date is carried through as prose for the template to set as its own
    line — Mississippi's and Tennessee's in-person return cells explain that
    you cannot hand-deliver at all, and Wisconsin's asks you to call your
    clerk.
    """
    value = value.strip()
    if absent(value):
        return None
    if value.lower().startswith("varies"):
        return {"varies": True}
    match = CELL.match(value)
    if not match:
        # Prose. Expected for the few states that explain themselves instead
        # of naming a date; anything short enough to have been a date is worth
        # a look, since it more likely means the snapshot changed shape.
        if len(value) < 40 and value.lower() not in KNOWN_PROSE:
            warnings.append("%s: %s is %r, neither a date nor prose" % (code, column, value))
        return {"note": value}

    day = datetime.strptime(match.group("date"), "%a, %b %d, %Y").date()
    # iso is for the calendars only; the YAML emitter never writes it.
    out = {"date": fmt(day), "iso": day.isoformat()}
    for part in (match.group("qual") or "").split(","):
        part = part.strip()
        if not part:
            continue
        low = part.lower()
        if low in ("received", "postmarked"):
            out["received"] = low == "received"
        elif TIME.match(part):
            out["time"] = part
        else:
            # Hawaii's "business days; holidays not applied". Kept whole, and
            # joined if upstream ever splits one across commas.
            out["note"] = (out.get("note", "") + ", " + part).lstrip(", ")
    return out


def quote(value):
    """Double-quote every string: this copy contains colons, commas and dashes."""
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def emit(out, key, value):
    if value is None:
        return
    if isinstance(value, bool):
        out.append("    %s: %s" % (key, "true" if value else "false"))
    else:
        out.append("    %s: %s" % (key, quote(value)))


def emit_cell(out, prefix, cell):
    """A parsed cell as its own keys, so the template never splits strings."""
    if not cell:
        return
    emit(out, prefix, cell.get("date"))
    emit(out, prefix + "_time", cell.get("time"))
    if "received" in cell:
        emit(out, prefix + "_received", cell["received"])
    emit(out, prefix + "_note", cell.get("note"))


# --------------------------------------------------------------- calendars
#
# One .ics per jurisdiction, written straight into static/ so Hugo serves them
# without a custom output format. The week-two page links the reader's own
# state's file; the state switcher rewrites the link.
#
# Every event is an all-day VEVENT. Several states put a time on a deadline
# (Alabama's ballots must arrive by 12PM) and states span time zones — two of
# them span two — so a timed event would need a TZID per state and would move
# someone's deadline if it were wrong. The time is named in the event instead.

CAL_DIR = "static/midterms/calendar"
PRODID = "-//5 Calls//5 Minute Midterms//EN"
# Fixed, so regenerating from an unchanged snapshot rewrites an identical file
# rather than showing a diff on every run. It is the day the snapshot was taken.
DTSTAMP = "20260828T000000Z"
ELECTION_DAY = date(2026, 11, 3)
MIDTERMS_URL = "https://5calls.org/midterms/"
# The absentee_type of a state that mails a ballot to every voter unasked.
AUTOMATIC = "Automatic mail ballot to every voter"
# Read fresh each run, so regenerating never writes an event that has already
# happened. Early voting is open in five states before week two even ships --
# Maine's opened on September 4 -- and an .ics carrying that date would import
# a dead event whose reminder fires overdue.
TODAY = date.today()


def esc(text):
    """Escape a text value, per RFC 5545."""
    return (text.replace("\\", "\\\\").replace(";", "\\;")
                .replace(",", "\\,").replace("\n", "\\n"))


def fold(line):
    """Fold a content line to 75 octets, continuations led by a space."""
    raw = line.encode("utf-8")
    if len(raw) <= 75:
        return line
    pieces, limit = [], 75
    while raw:
        cut = min(limit, len(raw))
        # Never split a character in half.
        while cut < len(raw) and (raw[cut] & 0xC0) == 0x80:
            cut -= 1
        pieces.append(raw[:cut].decode("utf-8"))
        raw = raw[cut:]
        limit = 74          # a continuation loses one octet to its own space
    return "\r\n ".join(pieces)


def vevent(uid, day, summary, description=None, alarm=False):
    """One all-day event, or nothing at all once the day has passed.

    DTEND is exclusive, so it is the following day.
    """
    if day < TODAY:
        return []
    lines = ["BEGIN:VEVENT",
             "UID:%s" % uid,
             "DTSTAMP:%s" % DTSTAMP,
             "DTSTART;VALUE=DATE:%s" % day.strftime("%Y%m%d"),
             "DTEND;VALUE=DATE:%s" % (day + timedelta(days=1)).strftime("%Y%m%d"),
             "SUMMARY:%s" % esc(summary),
             "URL:%s" % MIDTERMS_URL,
             "TRANSP:TRANSPARENT"]
    if description:
        lines.append("DESCRIPTION:%s" % esc(description))
    if alarm:
        lines += ["BEGIN:VALARM", "ACTION:DISPLAY",
                  "DESCRIPTION:%s" % esc(summary), "TRIGGER:-P1D", "END:VALARM"]
    return lines + ["END:VEVENT"]


def calendar(code, name, cells):
    """One state's deadlines as an iCalendar document.

    UIDs are deterministic, so importing the file twice updates the events
    rather than doubling them.
    """
    low = code.lower()

    def day_of(key):
        cell = cells.get(key)
        return date.fromisoformat(cell["iso"]) if cell and "iso" in cell else None

    events = []

    # Early voting. A county-set state has no statewide date to put in a
    # calendar, so it gets no event and the page carries the explanation.
    start = day_of("ev_start")
    if start and not cells.get("ev_varies"):
        note = None
        if cells.get("ev_end"):
            note = "Early voting runs through %s." % cells["ev_end"]["date"]
        events += vevent("wk2-%s-early@5calls.org" % low, start,
                         "Early voting opens in %s" % name, note)

    # Asking for a mail ballot. One event, on the earliest deadline of any
    # channel, with every channel's own date in the description — so a reader
    # who acts that day is inside all of them.
    channels = []
    for key, label in (("request_online", "Online"), ("request_mail", "By mail"),
                       ("request_in_person", "In person")):
        when = day_of(key)
        if when:
            channels.append((when, "%s: %s" % (label, cells[key]["date"])))
    # The automatic-ballot states send one to every voter without being asked,
    # so telling a reader there to request one would be wrong. Upstream still
    # lists request deadlines for them — those are for replacements — but that
    # is not this week's action, so they get no request event.
    if channels and cells.get("absentee_type") != AUTOMATIC:
        events += vevent(
            "wk2-%s-request@5calls.org" % low, min(c[0] for c in channels),
            "Request your mail ballot in %s" % name,
            "Deadlines:\n" + "\n".join(line for _, line in sorted(channels)),
            alarm=True)

    # Getting it back.
    posted = day_of("return_mail_by")
    if posted:
        events += vevent("wk2-%s-mailby@5calls.org" % low, posted,
                         "Mail your ballot today (%s)" % name,
                         "Leaves a week for the post before the return deadline.",
                         alarm=True)
    back = day_of("return_mail")
    if back:
        cell = cells["return_mail"]
        word = "postmarked" if cell.get("received") is False else "received"
        note = "Deadline is %s." % cell["time"] if cell.get("time") else None
        events += vevent("wk2-%s-return@5calls.org" % low, back,
                         "Ballot must be %s today (%s)" % (word, name), note,
                         alarm=True)

    events += vevent("wk2-%s-election@5calls.org" % low, ELECTION_DAY, "Election Day",
                     "Polls are open today. Find yours at 5calls.org/vote/locate/.")

    head = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:%s" % PRODID,
            "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
            "X-WR-CALNAME:%s voting deadlines" % name]
    return "\r\n".join(fold(l) for l in head + events + ["END:VCALENDAR"]) + "\r\n"


def main():
    snapshot = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SNAPSHOT
    full_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_FULL
    with open(snapshot, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh, delimiter="\t"))

    full = {}
    if os.path.exists(full_path):
        with open(full_path, newline="", encoding="utf-8") as fh:
            full = {r["Code"]: r for r in csv.DictReader(fh, delimiter="\t")}

    rows.sort(key=lambda r: r["Code"])
    warnings = []
    if not full:
        warnings.append("no %s; prose fields may be truncated mid-link"
                        % os.path.basename(full_path))
    repaired = 0

    out = [
        "# GENERATED FILE - do not edit by hand.",
        "# Source: %s" % os.path.basename(snapshot),
        "#         %s (untruncated prose)" % os.path.basename(full_path),
        "# Regenerate: python3 scripts/build-midterms-voting.py",
        "#",
        "# One entry per jurisdiction (50 states + DC) of week-two voting options:",
        "# in-person early voting, same-day registration, requesting a mail ballot",
        "# and returning it. Read by layouts/partials/midterms-voting.html for any",
        "# week flagged state_voting: true in data/midterms.yml.",
        "#",
        "# A key is absent wherever the option does not exist, so the template shows",
        "# a line by asking whether its key is there. Dates carry no year. Alongside",
        "# a date there may be a _time it falls at, a _received flag saying whether",
        "# the date is when the ballot must arrive (true) or be postmarked (false),",
        "# and a _note qualifying it. A _note with no date is prose upstream gave in",
        "# place of one. ev_varies marks a state whose early voting dates are set by",
        "# the county. return_mail_by is a week before the mail return deadline.",
        "",
        "states:",
    ]

    counts = {"early_voting": 0, "same_day_reg": 0, "request_online": 0, "varies": 0}
    calendars = []
    for row in rows:
        code = row["Code"]
        # The parsed cells, kept so the calendars can read real dates off them
        # rather than parsing the display strings back out of the YAML.
        cells = {}
        # Put the untruncated prose back before anything reads these cells.
        for column, source in REPAIRS.items():
            fixed = repair(row[column], full.get(code, {}).get(source), warnings, code, column)
            if fixed != row[column].strip():
                repaired += 1
            row[column] = fixed

        out.append("  %s:" % code)
        emit(out, "code", code)
        emit(out, "name", row["State"])

        # In-person early voting. Six states leave the dates to the county, so
        # the period exists but has no statewide window; the template says so
        # rather than dropping the line, since the reader still has the option.
        if scalar(code, "early_voting", row["Early_voting"].strip().lower() == "yes"):
            counts["early_voting"] += 1
            emit(out, "early_voting", True)
            # Overriding a start or end date with a checked one also clears the
            # county-set flag, since the override replaces the whole cell.
            start = override(code, "ev_start",
                             parse_cell(row["EV_start"], warnings, code, "EV_start"))
            end = override(code, "ev_end",
                           parse_cell(row["EV_end"], warnings, code, "EV_end"))
            # Upstream qualifies Hawaii's start date with "business days;
            # holidays not applied", which describes how it counted the date
            # rather than anything the reader acts on. The date is the point.
            for cell in (start, end):
                if cell:
                    cell.pop("note", None)
            if (start and start.get("varies")) or (end and end.get("varies")):
                counts["varies"] += 1
                cells["ev_varies"] = True
                emit(out, "ev_varies", True)
            start = start if start and not start.get("varies") else None
            end = end if end and not end.get("varies") else None
            cells["ev_start"], cells["ev_end"] = start, end
            emit_cell(out, "ev_start", start)
            emit_cell(out, "ev_end", end)

        # Same-day registration. The two windows are separate: New Hampshire
        # registers on Election Day but has no early voting period at all, so
        # neither flag can be inferred from the other.
        if row["Same_day_reg"].strip().lower() == "yes":
            counts["same_day_reg"] += 1
            emit(out, "same_day_reg", True)
            emit(out, "sdr_election_day", scalar(code, "sdr_election_day",
                 row["SDR_election_day"].strip().lower() == "yes"))
            emit(out, "sdr_early_voting", scalar(code, "sdr_early_voting",
                 row["SDR_during_early_voting"].strip().lower() == "yes"))
            where = scalar(code, "sdr_locations",
                           None if absent(row["SDR_locations"]) else row["SDR_locations"].strip())
            if where:
                emit(out, "sdr_locations", where)

        # Asking for a mail ballot. Colorado and the other automatic-ballot
        # states have no request deadlines at all, so this block collapses to
        # nothing and the template shows only how to send it back.
        cells["absentee_type"] = scalar(code, "absentee_type",
                                        row["Absentee_type"].strip() or None)
        emit(out, "absentee_type", cells["absentee_type"])
        if not absent(row["Request_deadline_online"]):
            counts["request_online"] += 1
        for column, prefix in (("Request_deadline_online", "request_online"),
                               ("Request_deadline_mail", "request_mail"),
                               ("Request_deadline_in_person", "request_in_person")):
            cells[prefix] = override(code, prefix,
                                     parse_cell(row[column], warnings, code, column))
            emit_cell(out, prefix, cells[prefix])

        # Sending it back.
        methods = scalar(code, "return_methods",
                         None if absent(row["Return_methods"]) else row["Return_methods"].strip())
        if methods:
            emit(out, "return_methods", methods)
        mail_back = override(code, "return_mail",
                             parse_cell(row["Return_deadline_mail"], warnings, code,
                                        "Return_deadline_mail"))
        cells["return_mail"] = mail_back
        emit_cell(out, "return_mail", mail_back)
        if mail_back and mail_back.get("date"):
            raw = re.match(DATE, row["Return_deadline_mail"].strip()).group(0)
            by = datetime.strptime(raw, "%a, %b %d, %Y").date() - timedelta(days=MAIL_BY_DAYS)
            cells["return_mail_by"] = {"date": fmt(by), "iso": by.isoformat()}
            emit(out, "return_mail_by", fmt(by))
        # The arrival deadline behind a postmark rule. Upstream does not carry
        # one at all, so it only ever comes from a checked source: a state that
        # counts the postmark almost always also sets a date by which the
        # ballot must actually turn up, and "postmarked by Nov 3" alone reads
        # as though late arrival is fatal when it is not.
        backstop = scalar(code, "return_mail_received_by", None)
        if backstop:
            # The hour matters here as much as the day: Maryland's cutoff is
            # 10 a.m. and Virginia's is noon, so a ballot posted late misses by
            # hours rather than days.
            day, when = backstop if isinstance(backstop, tuple) else (backstop, None)
            cells["return_mail_received_by"] = {"date": fmt(day), "iso": day.isoformat()}
            emit(out, "return_mail_received_by", fmt(day))
            emit(out, "return_mail_received_by_time", when)
        cells["return_in_person"] = override(
            code, "return_in_person",
            parse_cell(row["Return_deadline_in_person"], warnings, code,
                       "Return_deadline_in_person"))
        emit_cell(out, "return_in_person", cells["return_in_person"])

        calendars.append((code, row["State"], cells))

    # An override that never fires is a typo in a state code or field name, and
    # would otherwise sit here looking like a correction that had been applied.
    for state, fixes in OFFICIAL_OVERRIDES.items():
        for prefix in fixes:
            if (state, prefix) not in USED_OVERRIDES:
                warnings.append("%s: override for %s never applied — check the "
                                "state code and field name" % (state, prefix))

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(out) + "\n")

    # newline="" so the CRLFs iCalendar requires reach the file intact.
    os.makedirs(CAL_DIR, exist_ok=True)
    for code, name, cells in calendars:
        path = os.path.join(CAL_DIR, code.lower() + ".ics")
        with open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(calendar(code, name, cells))
    print("wrote %d calendars to %s/" % (len(calendars), CAL_DIR))

    print("wrote %s: %d jurisdictions (%d with early voting, %d of those county-set, "
          "%d with same-day registration, %d with an online ballot request); "
          "%d truncated cell(s) restored from the full snapshot"
          % (OUT, len(rows), counts["early_voting"], counts["varies"],
             counts["same_day_reg"], counts["request_online"], repaired))
    for warning in warnings:
        print("warning:", warning)


if __name__ == "__main__":
    main()

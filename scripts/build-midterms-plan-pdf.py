#!/usr/bin/env python3
"""Build the printable voting plan worksheet: week five's plan as questions on
paper, black and white, four to a US letter page to cut along the dashes.

    pip install reportlab fonttools pillow
    python3 scripts/build-midterms-plan-pdf.py [--up 2]

Writes static/midterms/voting-plan.pdf. --up 2 sets two larger worksheets to a
page instead. The questions are ROWS below; the rows spread out to fill each
worksheet, so adding or removing one needs no other change unless they stop
fitting (the script prints the room left, negative when they overflow).

The questions are the same for every state, so state-specific choices (early
voting, drop boxes) stay on the sheet for everyone. Temporary, like the rest
of /midterms.
"""

import io
import os
import sys

from fontTools.ttLib import TTFont as FTFont
from PIL import Image
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
OUT = os.path.join(ROOT, "static", "midterms", "voting-plan.pdf")
FONTS = os.path.join(ROOT, "assets", "fonts")

URL = "5calls.org/midterms"
CAP = 0.70   # DM Sans cap height, in ems


def black_logo():
    """The 5 Calls logotype, stars and all, recoloured black on its own alpha."""
    im = Image.open(os.path.join(ROOT, "static", "img", "5calls-logotype.png")).convert("RGBA")
    out = Image.new("RGBA", im.size, (0, 0, 0, 255))
    out.putalpha(im.getchannel("A"))
    return out


def renamed(path, name):
    """A font with its own PostScript and family names. The repo's bold carries
    the regular's names, so the two collide once embedded and the bold prints
    as regular."""
    font = FTFont(path)
    for rec in font["name"].names:
        if rec.nameID in (1, 3, 4, 6):
            rec.string = name
    buf = io.BytesIO()
    font.save(buf)
    buf.seek(0)
    return buf


LOGO = black_logo()
LOGO_W, LOGO_H = LOGO.size
pdfmetrics.registerFont(TTFont("DM", os.path.join(FONTS, "DMSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("DMB", renamed(os.path.join(FONTS, "DMSans-Bold.ttf"), "DMSans-Bold")))
pdfmetrics.registerFont(TTFont("DMBI", os.path.join(FONTS, "DMSans-BoldItalic.ttf")))
pdfmetrics.registerFont(TTFont("Bebas", os.path.join(FONTS, "BebasNeue-Regular.ttf")))

# Each row: ("q", question, answer) where answer is "line" for a blank to write
# on, or a list of checkbox labels; ("h", heading); ("note", text).
ROWS = [
    ("way", "How I am voting:", ["In person", "By mail"]),
    ("h", "IF IN PERSON"),
    ("q", "When I'm voting:", ["Early", "Election Day, Nov 3"]),
    ("q", "Day and time I'll go:", "line"),
    ("q", "Where I'll vote:", "line"),
    ("q", "How I'll get there:", ["Walk", "Drive", "Bike", "Bus", "Other"]),
    ("q", "Who's going with me:", "line"),
    ("q", "Do I need an ID?", ["Yes, I have it", "Yes, still getting it", "No"]),
    ("h", "IF BY MAIL"),
    ("q", "I'll fill out my ballot by:", "line"),
    ("q", "Day and time I'll return it:", "line"),
    ("note", "If returning via US Postal Service, mail it at least a week before the deadline."),
    ("q", "How I'll return it:", ["Mail", "Drop box", "County election office"]),
    ("q", "I will sign and date my ballot and envelope:", ["Yes", "No"]),
]


def card(c, x, y, w, h, s, extra=0):
    """One worksheet in the box with bottom-left corner x, y. s scales type;
    extra is added above each row, to spread the rows down the card."""
    pad = 0.28 * inch * s
    left, right, top = x + pad, x + w - pad, y + h - pad
    c.setFillColorRGB(0, 0, 0)
    c.setStrokeColorRGB(0, 0, 0)

    # The title with the URL under it, and a QR code to the same URL in the
    # top corner, all above the rule.
    qr = 44 * s
    code = QrCodeWidget("https://" + URL, barLevel="M")
    x0, y0, x1, y1 = code.getBounds()
    d = Drawing(qr, qr, transform=[qr / (x1 - x0), 0, 0, qr / (y1 - y0), 0, 0])
    d.add(code)
    renderPDF.draw(d, c, right - qr + 3 * s, top - qr + 3 * s)
    cy = top - 22 * s
    c.setFont("Bebas", 26 * s)
    c.drawString(left, cy, "MAKE YOUR VOTING PLAN")
    # The 5 Calls logotype in black, with the URL beside it.
    # The wordmark's baseline sits about a twelfth of the way up the image.
    lh = 13 * s
    lw = lh * LOGO_W / LOGO_H
    c.drawImage(ImageReader(LOGO), left, cy - 15.5 * s, lw, lh, mask="auto")
    c.setFont("DM", 8 * s)
    c.drawString(left + lw + 6 * s, cy - 14.4 * s, URL)
    cy = top - qr - 2 * s
    c.setLineWidth(1.2)
    c.line(left, cy, right, cy)

    q = 8.6 * s       # question size
    box = 7.5 * s     # checkbox size
    write = 21 * s    # room above a blank to write in

    def boxes(labels, at_y, start):
        bx = start
        c.setFont("DM", q)
        c.setLineWidth(0.7)
        for label in labels:
            lw = c.stringWidth(label, "DM", q)
            if bx + box + 4 * s + lw > right:   # wrap to a second row
                at_y -= q + 6 * s
                bx = start
            # Centred on the label's cap height.
            c.rect(bx, at_y + (CAP * q - box) / 2, box, box)
            c.drawString(bx + box + 4 * s, at_y, label)
            bx += box + 4 * s + lw + 11 * s
        return at_y

    after_note = False
    for row in ROWS:
        kind = row[0]
        after_note, prev_note = kind == "note", after_note
        if kind == "way":
            cy -= 19 * s + extra
            c.setFont("DMB", 10 * s)
            c.drawString(left, cy, row[1])
            start = left + c.stringWidth(row[1], "DMB", 10 * s) + 10 * s
            c.setFont("DMB", 10 * s)
            bx = start
            for label in row[2]:
                c.rect(bx, cy + (CAP * 10 * s - box - 1) / 2, box + 1, box + 1)
                c.drawString(bx + box + 6 * s, cy, label)
                bx += box + 6 * s + c.stringWidth(label, "DMB", 10 * s) + 16 * s
        elif kind == "h":
            cy -= 21 * s + extra
            # Section headings divide the two ways to vote: heavier than the
            # questions, with a rule heavier than the one under the title.
            c.setFont("DMB", 10 * s)
            c.drawString(left, cy, row[1])
            c.setLineWidth(1.6)
            c.line(left + c.stringWidth(row[1], "DMB", 10 * s) + 6 * s, cy + 3.5 * s, right, cy + 3.5 * s)
        elif kind == "note":
            cy -= 13 * s + extra
            c.setFont("DMBI", 7.2 * s)
            c.drawString(left, cy, row[1])
        else:
            question, answer = row[1], row[2]
            # A question stays close under the note that leads into it.
            cy -= 17 * s + (0 if prev_note else extra)
            c.setFont("DM", q)
            if answer == "line":
                # The blank runs on from the question, with a row's height
                # above it to write in.
                cy -= write - 17 * s
                c.drawString(left, cy, question)
                c.setLineWidth(0.6)
                c.line(left + c.stringWidth(question, "DM", q) + 6 * s, cy - 2 * s, right, cy - 2 * s)
            else:
                qw = c.stringWidth(question, "DM", q)
                start = left + qw + 8 * s
                # Options beside the question when they fit, else on the row below.
                need = sum(box + 4 * s + c.stringWidth(l, "DM", q) + 11 * s for l in answer)
                if start + need > right:
                    c.drawString(left, cy, question)
                    cy -= q + 6 * s
                    start = left + 6 * s
                else:
                    c.drawString(left, cy, question)
                cy = boxes(answer, cy, start)
    return cy - (y + pad)   # room left at the bottom; negative means it overflowed


def build(out, up):
    W, H = letter
    c = canvas.Canvas(out, pagesize=letter)
    c.setTitle("Make your voting plan")
    c.setAuthor("5 Calls")
    if up == 4:
        cells = [(0, H / 2), (W / 2, H / 2), (0, 0), (W / 2, 0)]
        cw, ch, s = W / 2, H / 2, 1.0
    else:
        cells = [(0, H / 2), (0, 0)]
        cw, ch, s = W, H / 2, 1.45
    # Lay a card out once to see how much room is left, then spread that room
    # evenly between the rows so the card fills down to its bottom margin.
    spare = card(canvas.Canvas(io.BytesIO()), 0, 0, cw, ch, s)
    gaps = sum(1 for i, r in enumerate(ROWS) if i == 0 or ROWS[i - 1][0] != "note")
    left = min(card(c, x, y, cw, ch, s, spare / gaps) for x, y in cells)
    # Cut lines.
    c.setDash(4, 4)
    c.setLineWidth(0.4)
    c.setStrokeGray(0.5)
    c.line(0, H / 2, W, H / 2)
    if up == 4:
        c.line(W / 2, 0, W / 2, H)
    c.save()
    print(f"{os.path.normpath(out)}: {up}-up, {left:.1f}pt spare at the bottom of each")


if __name__ == "__main__":
    build(OUT, 2 if sys.argv[1:] == ["--up", "2"] else 4)

# V4C document style guide

The document counterpart to `v4c-deck-style/style-guide.md`. Same brand, adapted for
portrait pages that will be opened, edited and shared in Google Docs. Where this file
is silent, the deck guide's palette and do-not list apply.

A V4C document is **white pages with one dark moment**: the cover banner. Everything
after it is light. Navy appears inside the body only as a table header row, a
or a decision callout.

---

## 1. Page

| Setting | Value | Why |
|---|---|---|
| Size | US Letter, portrait | Client base is US; A4 clients: change `PAGE_W/PAGE_H` |
| Margins | 0.9in left/right, 0.8in top/bottom | Content width 6.7in |
| Header / footer distance | 0.35in / 0.29in | Keeps furniture clear of body |
| Mode in Google Docs | **Pages**, not Pageless | Pageless hides headers, footers and page numbers |

## 2. Colour

Tokens are the deck tokens. No new colours.

| Token | Value | Used for in documents |
|---|---|---|
| `text.primary` | `#3E3E3E` | Body, titles, H1, H2. Never `#000000` |
| `text.secondary` | `#616972` | Lead paragraph, subtitle, captions, labels, header/footer text |
| `border.subtle` | `#B9B9C2` | Table rules, metric cards, cover metadata dividers |
| `bg.tint` | `#F4F4F6` | Note callouts, label cells. Within the deck's white-to-`#EEEEEE` range |
| `accent.primary` | `#916DF9` | H3, bullets and list numbers, key callout border, first metric, draft status |
| `accent.secondary` | `#2AB1AC` | Kickers (section numbers, labels), second metric |
| `accent.tertiary` | `#008EE8` | Links, third metric, header tab |
| `accent.deep` | `#1B335F` | Table header rows, decision callout |
| `gradient.brand` | `#008EE8` → `#916DF9` → `#E87EFA` | Cover banner bar and footer bar only |

## 3. Brand furniture

| Element | Where | Asset |
|---|---|---|
| Cover banner | Page 1, full content width, 6.7in × 2.9in | `assets/cover-banner.png`: navy gradient, hero arch, white logo, gradient bar, tab |
| Logo | Header, right, every page after the cover | `assets/logo-color.png`: the full-colour logo on a transparent ground, 0.62in × 0.23in |
| Footer bar | Footer, every page including the cover | `assets/gradbar-doc.png` |
| Confidentiality line | Footer, left | Text, 6pt |
| Draft marker | Footer, after the confidentiality line, until sign-off | Text, 6pt bold purple |
| Page number | Footer, right | Field |

**Full-colour logo, chip retired (September 2026):** the official full-colour logo
("V4Cai - LOGO - FULL COLOR") is now in `assets/logo-color.png`
and replaces the white-logo-on-navy chip in the header. `assets/logo-chip.png` stays in
the folder only as a fallback; do not use it on light pages.

**Header and footer layout:** both are built as a borderless two-column table (text left,
logo or page number right-aligned in the second cell). Do not use a right-aligned tab
stop: Google Docs import drops right tab stops in headers and footers, which pushed the
logo and page number to the left after upload.

The top-left tab from the deck lives in the cover banner. It is not repeated in the
header: in a document it reads as a stray mark.

## 4. Typography

Poppins throughout. It is a Google Font, so it is native in Google Docs. Fallbacks:
Montserrat, Inter, Arial. No serifs.

| Role | Size | Weight | Colour | Notes |
|---|---|---|---|---|
| Cover title | 28pt | Bold | `text.primary` | Title style |
| Cover subtitle | 13pt | Regular | `text.secondary` | One line |
| Kicker | 8pt | Bold, caps, tracked | `accent.secondary` | `01 · SECTION LABEL` above every H1; also table labels |
| Heading 1 | 18pt | Bold | `text.primary` | Built-in style, so the Docs outline and TOC work |
| Heading 2 | 13pt | Bold | `text.primary` | |
| Heading 3 | 10pt | Bold | `accent.primary` | Use sparingly |
| Lead paragraph | 12pt | Regular | `text.secondary` | First paragraph of a summary only |
| Body | 9.5pt | Regular | `text.primary` | 1.3 line spacing |
| Table body | 8.5pt | Regular | `text.primary` | Header row 8pt bold white on `accent.deep` |
| Metric value | 20pt | Bold | Accents in order | |
| Caption / source | 7pt | Regular | `text.secondary` | Under every table, chart and metric row |
| Footer | 6pt | Regular | `text.secondary` | |

Sentence case for every heading. Caps only in kickers and labels.

## 5. Components

Every component is built from paragraphs and simple tables so it survives the Google
Docs import. Nothing floats.

| Component | Use it for | Rule |
|---|---|---|
| Cover | Every client document over two pages | Kicker is `CLIENT · DOCUMENT TYPE` |
| Document control | Version history | Page 2, always |
| Review and release | Named reviewer, date, status | Page 2, always. See section 7 |
| Contents | Documents with 4+ sections | Static list; replace with Insert → Table of contents in Docs if a live one is wanted |
| Lead paragraph | The answer, up front | One per document |
| Metric row | 3 or 4 headline numbers | Each needs a source caption |
| Callout: note | Assumptions, definitions, pointers | Tint fill, no border |
| Callout: key | The recommendation | Purple border all round. One per section at most |
| Callout: decision | What the reader must decide | Navy fill. Closing section only |
| Table | Structured comparison | Navy header row, subtle rules, caption below stating the takeaway |
| RAID table | Risks, assumptions, issues, dependencies | Type colour-coded: purple, teal, blue, navy |
| Actions table | Next steps with owners | Side column: V4C purple, Client teal |
| Decisions table | Steering and phase-gate documents | Options and a V4C recommendation for each |

## 6. Document shape

Cover → document control and review → contents → summary with the answer → body
sections → one close. Mirror the deck rule: close with **next steps** for a working
document, **decisions** for a governance document. Not both.

Each H1 opens with a kicker. Long sections start on a new page; short documents flow.

## 7. Review, disclosure and confidentiality

- Generated documents carry `Status: Draft for V4C review` and the footer draft marker
  until a named V4C reviewer signs off. The reviewer fills in the review block and
  removes the marker.
- The review block includes an AI-assistance line by default. Whether that line is
  required, optional, or must be worded differently depends on the engagement terms.
  If unclear, raise it with the engagement lead; do not delete it on assumption.
- Footer: `Confidential. Prepared for [Client] by v4c.ai.` unless the engagement
  specifies a different classification.
- One client per document: no other client's names, logos, case studies or metrics.
  No internal sales, partner-programme or pricing content in a client document.

## 8. Google Docs behaviour

Tested behaviour of this build in LibreOffice rendering; Google Docs conversion should
be checked after each upload (section 9).

- Upload the `.docx` to Drive, then **Open with → Google Docs**. Drive keeps the
  original `.docx` alongside; delete it once the Doc is confirmed good.
- Page numbers, heading styles, bullets, table shading and inline images are standard
  import paths. The header logo and footer bar are inline images, not floating. Header
  and footer alignment uses borderless tables, which survive the import; right tab stops do not.
- If Poppins renders as Arial, the import did not map it: select all → Poppins.
- Set File → Page setup → **Pages** if the document opens pageless.
- For a reusable Docs template: keep the converted master in a shared Drive folder
  and start each document with File → Make a copy. Adding it to the organisation's Docs template gallery is a
  Workspace admin action.

## 9. Before handing anything over

- Render it and look at every page. Overflow and collisions do not show in the XML.
- Search for `[`, `Lorem`, `TODO`, `XXX`, `[insert]`. Any bracketed placeholder left in
  a client document is a defect.
- Every figure has a source caption; every recommendation traces to a retrieved source
  or is labelled as V4C's judgement.
- No PII, credentials, API keys or unredacted proprietary code.
- After uploading to Drive, open the Google Doc and check: fonts, header logo sitting
  right, footer bar, page numbers right, table widths.

## 10. Do not

- Use `#000000`, stock blues, or the deck's drift colours (`#B4D603`, `#F1C232`,
  `#9FC5E8`, `#CFE2F3`, `#4285F4`).
- Add title underlines, sidebar stripes or single-side borders on callouts. The two
  gradient bars are the only stripes.
- Recolour, stretch or redraw the logo.
- Float images or text boxes. Google Docs import moves them.
- Merge table cells. Import breaks them.
- Use more than one key callout per section or more than one decision callout per
  document.
- Put navy on a body page for decoration.

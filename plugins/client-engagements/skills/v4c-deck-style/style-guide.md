# V4C deck style guide

Shared visual specification for V4C slide decks, readable by people and usable by Claude
when generating decks.

A V4C deck is **predominantly light**. Dark is reserved for structure — the title,
section breaks and the closing — which is why the template is 21 light slides against 7
dark. Dark is a punctuation mark, not an alternative theme.

Extracted from the original V4C master slides template (47 slides, 6 masters,
7 themes) on 2026-09-16. The template remains the source of truth; this file records
what it does and the judgement a theme file can't encode.

---

## 0. Two things to know first

**The canvas is 10in × 5.625in, not 13.333in × 7.5in.** Both are 16:9, but every point
size below is calibrated to the 10in canvas. Generating at 13.333in and pasting these
sizes in produces text roughly 25% too small. In pptxgenjs this is the default
`LAYOUT_16x9` — do not set `LAYOUT_WIDE`.

**The master named "V4C Official theme" is not where the branding lives.** 41 of the 47
slides in the original template sit on a master called **"Simple Light"**, and that is
the real V4C design — the palette and type scale below come from it. Build on "Simple
Light" regardless of what the two are called.

The original template's colour schemes declared `accent1 #4285F4`, Google's default
blue, which appears almost nowhere in practice. This is corrected in
`v4c-master-template.potx` (section 10), but if you are working from the original
master, trust section 2 rather than the theme swatches.

---

## 1. Where dark is used

Dark carries **structure**: the title slide, part dividers, section transitions, the
programme timeline, and the closing. Nothing else. A reader should be able to find the
shape of a deck by looking only at its dark slides.

Light carries **content**: everything between the breaks — card grids, comparisons,
process flows, tables, diagrams, charts.

**Split** is a third treatment rather than a third variant: a dark panel on the left
third of an otherwise light slide, carrying the title while content sits beside it. Use
it for a content slide that needs more presence than plain light gives, not as a way to
sneak dark into the middle of a deck.

The failure mode is alternating dark and light for visual variety. That destroys the
signal — once dark stops meaning "new section", the reader loses the structure.

---

## 2. Colour

Reference tokens, not raw hex, wherever the generator supports it.

### Dark surfaces — structure slides and split panels

| Token | Value | Used for |
|---|---|---|
| `bg.base` | gradient `#05072C` → `#131750` | Slide background, diagonal, darkest bottom-left |
| `bg.panel` | `#131750` | Side panels on split layouts |
| `text.primary` | `#FFFFFF` | Titles and body |
| `text.secondary` | `#B9B9C2` | Subheadings, captions |

### Light surfaces — content slides

| Token | Value | Used for |
|---|---|---|
| `bg.base` | `#FFFFFF` to `#EEEEEE`, subtle | Slide background |
| `bg.card` | `#FFFFFF` | Cards and content blocks, on the tinted background |
| `text.primary` | `#3E3E3E` | Titles and body — a soft near-black, never `#000000` |
| `text.secondary` | `#616972` | Subheadings, captions, table labels |
| `border.subtle` | `#B9B9C2` | Card edges, dividers, table rules |

### Accents — used on both

| Token | Value | Used for |
|---|---|---|
| `accent.primary` | `#916DF9` | Primary emphasis, numbered badges, highlight fills, first chart series |
| `accent.secondary` | `#2AB1AC` | Second emphasis, alternate badges, second chart series |
| `accent.tertiary` | `#008EE8` | Third series, links, occasional headers |
| `accent.deep` | `#1B335F` | Dark fills on light slides — table headers, dark cards |
| `gradient.brand` | `#008EE8` → `#916DF9` → `#E87EFA` | The bottom bar and hero graphics only |

Rules:

- `#916DF9` and `#2AB1AC` are the working pair. Alternate them across numbered items;
  don't introduce a third unless the content genuinely has three categories.
- Never `#000000` for text. The template uses `#3E3E3E`, which reads softer at
  projection brightness.
- Colours seen in the template but treated as **drift, not palette**: `#B4D603` (lime),
  `#F1C232` (mustard), `#9FC5E8` and `#CFE2F3` (pale blues), `#4285F4`. They survive on
  a couple of inherited slides. Don't propagate them.
- Client and partner logos keep their own colours.

---

## 3. Brand furniture

These appear on nearly every slide and are what make a deck recognisably V4C. They
belong to the master, not to individual slides — don't hand-draw them.

- **Bottom gradient bar** — full-bleed, ~0.05in tall, `gradient.brand` left to right.
  On every slide including dark ones. This is the single strongest brand signal.
- **Top-left tab** — small blue/purple rectangle at the top edge, ~0.5in wide.
- **V4C logo** — top-right on content slides; top-left on the title slide. White on
  dark (`assets/logo-white.png`), full-colour on light (`assets/logo-color.png`, the
  official "V4Cai - LOGO - FULL COLOR" file, transparent
  ground). Never recolour or stretch it, and never put the white logo on a navy chip on
  a light slide.
- **Corner chevron** — small gradient mark, bottom-right, on some light layouts.
- **Dot-mesh and wave motifs** — low-opacity background texture, bottom-right or
  right edge. Decorative only; never behind body text.

This is the exception to the usual "no accent stripes" rule. The bottom bar is brand
identity, not decoration. Everywhere else, the rule holds: no underlines beneath
titles, no sidebar stripes, no single-side borders on cards.

---

## 4. Typography

**Poppins** is the brand face — 913 uses across the template against 336 Arial,
288 Proxima Nova, 153 Raleway. Those three are legacy drift; use Poppins.

Fallback order if Poppins is unavailable: Montserrat, Inter, Helvetica Neue, Arial.
Never a serif or display face.

Sizes are for the 10in canvas.

| Role | Size | Weight | Colour |
|---|---|---|---|
| Deck title (title slide) | 35pt | Bold | `text.primary` |
| Section / transition title | 43pt | Bold | `text.primary` (dark) |
| Transition subheading | 23pt | Regular | `text.secondary` |
| Content slide title | 26–30pt | Bold | `text.primary` |
| Subhead / kicker above title | 10pt | Bold | `accent.primary` or `accent.secondary` |
| Subtitle below title | 15pt | Regular | `text.secondary` |
| Body | 10pt | Regular | `text.primary` |
| Dense body (cards, tables) | 8pt | Regular | `text.primary` |
| Numbered badge | 21pt | Bold | `#FFFFFF` on accent fill |
| Caption / source | 7pt | Regular | `text.secondary` |
| Legal footnote | 5pt | Regular | `text.secondary` |

Sentence case for titles and bullets. Not Title Case, not ALL CAPS — the one exception
is the title slide, which uses caps in the template.

8pt is the floor. If content won't fit at 8pt, the slide has too much on it.

---

## 5. Layout

- **Canvas:** 10in × 5.625in (9144000 × 5143500 EMU).
- **Margins:** 0.4in minimum. The bottom gradient bar sits outside this.
- **Title block:** top-left, baseline ~0.55in from top. Kicker sits directly above it.
- **Logo:** top-right, ~0.35in from top and right edges.
- **Split layouts:** dark panel occupies the left third (~3.3in) or a diagonal cut.
- **Cards:** 3 or 4 across, 0.15in gutters, white fill with `border.subtle`, ~4pt radius.
- **Gaps:** 0.2in minimum between elements; 0.3in between card rows.

---

## 6. Slide inventory

One template: `v4c-master-template.potx`, 28 slides. Delete what you don't need rather
than building from blank. Slides are grouped by purpose, not by deck order — reorder
freely, but keep dark slides for structure and light slides for content.

### Structure — slides 1–5 (dark)

| # | Slide | Use it for |
|---|---|---|
| 1 | Title | Deck opener. Title, subtitle, date, presenter. Every deck starts here |
| 2 | Part divider | "Part 1 / Section name". Use when a deck has 3+ distinct sections |
| 3 | Transition A | Section break with subheading. The workhorse divider |
| 4 | Transition B | Second divider style — alternate with A so breaks don't look identical |
| 5 | Timeline | Horizontal milestone spine. Programme-level, not task-level |

### Content layouts — slides 6–22 (light)

| # | Slide | Use it for |
|---|---|---|
| 6 | Split, 8-item list | Dense enumeration — scope items, workstreams, deliverables |
| 7 | Split, 3-item list | Same shape, fewer items. Better when each item needs a sentence |
| 8 | Title + body | Narrative prose. Context, rationale, background |
| 9 | Title + subtitle | Near-empty. A statement slide, or a canvas for a pasted visual |
| 10 | Split + icon metrics | Approach on the left, numbers on the right |
| 11 | Six-card grid | Capabilities, services, workstreams. Six is the ceiling |
| 12 | Four-icon row | Phases, pillars, principles. Short labels only |
| 13 | Process with stages | Left-to-right flow with a summary band beneath |
| 14 | Team / person | Named individual with role and bio. Kickoff decks |
| 15 | Dark-card rows (light slide) | Grouped detail under a heading. Good for requirements |
| 16 | Numbered 6-item | Ordered steps where sequence matters |
| 17 | Flow diagram | Decision or approval flow with checkpoints |
| 18 | Tabbed cards, two-up | Before/after, current/target, option A/B |
| 19 | Tabbed cards, single | One long list that needs a heading treatment |
| 20 | Numbered rows | Ranked or prioritised items with short descriptions |
| 21 | Two-column + side labels | Comparison where each side needs a vertical label |
| 22 | Three-column | Three options, phases, or tiers weighed against each other |

### Delivery archetypes — slides 23–26 (light)

Built to this guide rather than inherited from the original template. Sample content is
illustrative — replace it.

| # | Slide | Use it for |
|---|---|---|
| 23 | Data slide | One chart plus three supporting stats. Title states the takeaway |
| 24 | Architecture | Medallion lanes with a Unity Catalog governance band |
| 25 | RAID log | Risks, assumptions, issues, dependencies. Review weekly |
| 26 | Milestone plan | Milestones on a spine with phase bands beneath |

### Closing — slides 27–28 (dark)

| # | Slide | Use it for |
|---|---|---|
| 27 | Next steps and owners | Default close. Actions split between V4C and client, each with a named owner and date |
| 28 | Decisions required | Steering meetings and phase gates. What needs deciding, the options, and by when |

Use one, not both. Next steps closes a working session; decisions closes a governance
meeting. Don't close on a sales call to action such as "Ready to get started?": it is
not something to show a client you are already delivering for.

If you cannot fill in the closing slide, the meeting did not conclude anything. That is
the point of it.

### Assembling a delivery deck

A typical engagement deck: slide 1, then 3 or 4 to open each section, light content
between them, the archetypes where they fit, and 27 or 28 to close. Dark appears at the
start, at section breaks, and at the end — nowhere else.

If a deck runs past roughly 20 slides, it usually wants splitting rather than
compressing.

---

## 7. Charts and diagrams

- Title the chart with the **takeaway**, not the variable.
- Series order: `#916DF9`, `#2AB1AC`, `#008EE8`, `#1B335F`.
- Single series: `accent.primary`, no legend.
- Data labels on; value axis off when labels are shown.
- Horizontal gridlines only, `border.subtle`. No 3D, no shadows, no chart borders.
- Diagram boxes: white fill on light slides, `border.subtle` stroke, ~4pt radius.
  Highlight at most two in `accent.primary`.
- Connectors 1pt in `text.secondary`; label the flow, not just the nodes.
- Medallion layers keep conventional bronze/silver/gold labelling — don't recolour them.

---

## 8. Do not

- Use `#000000` for text.
- Set the canvas to 13.333in wide.
- Add accent stripes, title underlines, or single-side card borders. The bottom
  gradient bar is the only stripe, and it comes from the master.
- Use Proxima Nova, Raleway, Calibri, or Arial when Poppins is available.
- Put body text over the dot-mesh or wave motifs.
- Drop below 8pt for readable content, or 5pt for legal text.
- Use cream or beige backgrounds. Light slides run white to `#EEEEEE`.
- Recolour, stretch, or re-draw the V4C logo.
- Ship placeholder text — check for `Lorem`, `TODO`, `XXX`, `[insert]` before sending.
- Put more than one idea on a slide.

---

## 9. Applying it

**Google Slides:** Slide → Change theme → Import theme, pick the master template.

**PowerPoint:** open `v4c-master-template.potx` to start a new deck — PowerPoint creates
a copy rather than
editing the template.

**Claude-generated decks:** reference this file. Canvas size, Poppins, the token table,
the brand furniture in section 3, and section 8 are what most determine whether output
reads as V4C.

**Review:** generated decks are drafts until a named V4C reviewer signs off. Check contrast, overflow, and leftover placeholders before anything reaches a
client.

---

## 10. Template notes

`v4c-master-template.potx` has 28 slides: the inventory in section 6.

**What the template gets right:**

- Every theme declares `accent1 #916DF9` and `accent2 #2AB1AC` rather than stock
  Google blue, so anything built from the theme swatches comes out on-brand.
- The four delivery archetypes (section 6) and the two delivery closings, next steps
  and decisions required.

**Known quirks:**

- **Masters are misnamed.** The brand design lives on "Simple Light", not on
  "V4C Official theme" (section 0). Build on "Simple Light".
- **Unused masters remain.** Some masters have no slides attached. Don't build on them.
- **Some off-palette colour remains**, mostly on the timeline slide. Restyle to
  section 2 when you use it.
- **The file is large** (about 18MB), mostly embedded fonts. Poppins is the only one to
  use (section 4).

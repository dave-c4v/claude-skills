---
name: v4c-deck-style
description: Apply V4C's house style to slide decks and .pptx files — palette, Poppins, canvas size, slide archetypes, brand furniture. Use to build or check a V4C or client deck. For documents use v4c-doc-style.
---

# V4C deck style

`style-guide.md` in this directory is the specification — palette, type scale, layout
grid, the full slide inventory, and the do-not list. Read it before generating or
reviewing any deck. This file covers how to apply it.

## Two routes, and which one applies

**A person is building the deck themselves** → point them at
the V4C master template, `v4c-master-template.potx`. It has 28 ready layouts. Building
from the template beats building from a spec. Use
`style-guide.md` to answer questions about which slide to use and what not to do.

**Claude is generating the deck** → build it with pptxgenjs from the spec below. The
`.potx` cannot be used for this; it is an 18MB binary that Claude cannot open or build
from. Everything needed to match it by hand is in this directory.

Write the build script outside this skill's folder, which is read-only; a temporary
folder is fine. Run it as one command, since shell variables don't carry over between
commands:

```bash
S="<this-skill-dir>"
M="$(node -p "const p = require.resolve('pptxgenjs'); p.slice(0, p.lastIndexOf('node_modules') + 12)" 2>/dev/null)" \
  || { M="$(mktemp -d)/node_modules"; npm install --silent --prefix "${M%/node_modules}" pptxgenjs; }
NODE_PATH="$M${NODE_PATH:+:$NODE_PATH}" SKILL_DIR="$S" node <script>.js
```

- `<this-skill-dir>` is this skill's base directory. The snippets below read `assets/`
  from it through `SKILL_DIR`, so they work whatever the working folder is.
- The second line finds `pptxgenjs` wherever the working folder can already load it,
  which is how a preinstalled copy is picked up, and installs one into a temporary
  folder only if there is none. If `node` is missing, or the install fails because
  network access is off, stop and tell the user what is needed.
- Have the script write the `.pptx` wherever this environment delivers files to the
  user. In Claude Code that is the working folder. Elsewhere, such as claude.ai, use the
  output location that environment names; a file saved anywhere else never reaches them.

## Non-negotiables

These four account for most of the difference between output that reads as V4C and
output that reads as generic:

1. **Canvas is 10in × 5.625in.** This is pptxgenjs's default `LAYOUT_16x9`. Never set
   `LAYOUT_WIDE` — at 13.333in every size in the guide is ~25% too small and content
   runs off the right edge.
2. **Poppins**, at the sizes in the guide's typography table.
3. **`#916DF9` and `#2AB1AC`** as the working accent pair, never stock blues.
4. **Brand furniture on every slide** — see below. Without it a deck is just a
   correctly-coloured generic deck. The title slide additionally needs the hero
   graphic; without it the slide reads as half-finished.

## Brand furniture

Four assets in `assets/`. Place them the same way on every slide:

```javascript
const fs = require('fs'), path = require('path');
const W = 10, H = 5.625, M = 0.4, BAR = 0.06;
const A = p => 'image/png;base64,' +
  fs.readFileSync(path.join(process.env.SKILL_DIR, 'assets', p)).toString('base64');
const grad = A('gradbar.png'), dark = A('darkbg.png'), logo = A('logo-white.png'),
      logoColor = A('logo-color.png');

function frame(s, isDark) {
  if (isDark) s.addImage({ data: dark, x: 0, y: 0, w: W, h: H });
  else s.background = { color: 'FFFFFF' };
  s.addImage({ data: grad, x: 0, y: H - BAR, w: W, h: BAR });        // bottom bar
  s.addShape(pres.ShapeType.rect, { x: 0.35, y: 0, w: 0.5, h: 0.055, // top-left tab
    fill: { color: '008EE8' } });
  s.addImage({ data: isDark ? logo : logoColor, x: W - M - 0.72, y: 0.26, w: 0.72, h: 0.266 });
}
```

- `gradbar.png` — the bottom gradient bar. Full-bleed, every slide, no exceptions.
- `darkbg.png` — the navy gradient for structure slides only (title, dividers,
  transitions, timeline, closing).
- `logo-white.png` — for dark slides.
- `logo-color.png` — the official full-colour logo on a transparent ground, for light
  slides (top-right, same position and size as the white logo). Never put the white
  logo on a navy chip to fake a light-slide logo.
- `hero-arch.png` — the striped V mark. **Title slide only.** Already cropped and
  rotated to match the master, so place it as-is: no rotation, no cropping.

Logo sizing differs by slide. On the title slide it is larger and sits top-**left**
(`x: 0.521, y: 0.491, w: 1.363, h: 0.505`). Everywhere else it is smaller and top-right
(`x: W - M - 0.72, y: 0.26, w: 0.72, h: 0.267`).

## Title slide

The hero graphic is what makes this slide recognisable, and it is easy to omit. Layer
order matters — background, hero, then bar, tab and logo on top.

```javascript
const hero = A('hero-arch.png');
const s = pres.addSlide();
s.addImage({ data: dark, x: 0, y: 0, w: W, h: H });
s.addImage({ data: hero, x: 3.599, y: 1.026, w: 6.411, h: 4.607 });
s.addImage({ data: grad, x: 0, y: H - BAR, w: W, h: BAR });
s.addShape(pres.ShapeType.rect, { x: 0.35, y: 0, w: 0.5, h: 0.055, fill: { color: '008EE8' } });
s.addImage({ data: logo, x: 0.521, y: 0.491, w: 1.363, h: 0.505 });

s.addText('TITLE', { x: 0.52, y: 1.84, w: 7.17, h: 0.62, fontFace: 'Poppins',
  fontSize: 35, bold: true, color: 'FFFFFF', isTextBox: true, margin: 0 });
s.addText('Subtitle\n[Date]', { x: 0.52, y: 2.62, w: 7.17, h: 0.86, fontFace: 'Poppins',
  fontSize: 20, color: 'FFFFFF', isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
s.addText([
  { text: '[Name], [Title]  |  ', options: { color: 'FFFFFF' } },
  { text: '[email@v4c.ai]', options: { color: '9FD4F5', underline: true } }
], { x: 0.52, y: 3.62, w: 7.17, h: 0.3, fontFace: 'Poppins', fontSize: 12,
  isTextBox: true, margin: 0 });
```

Keep the title slide's text as placeholders — `TITLE`, `Subtitle`, `[Date]`,
`[Name], [Title]`, `[email@v4c.ai]` — unless the person supplied real values. Never
substitute a name of your own; use the presenter's name and email only when they give
them.

The confidentiality line from the master sits at `x: 0.52, y: 4.96, w: 3.08`, 5pt
italic in `EDF2FA`. Include it on client-facing decks.

## Standard slide head

```javascript
function head(s, kicker, title, isDark) {
  s.addText(kicker, { x: M, y: 0.22, w: 6, h: 0.2, fontFace: 'Poppins', fontSize: 9,
    bold: true, color: '2AB1AC', isTextBox: true, margin: 0 });
  s.addText(title, { x: M, y: 0.44, w: 7.9, h: 0.46, fontFace: 'Poppins', fontSize: 20,
    bold: true, color: isDark ? 'FFFFFF' : '3E3E3E', isTextBox: true, margin: 0 });
}
```

Title width stops at 7.9in so it clears the logo. A title that wraps to two lines will
collide with the kicker — shorten the title rather than moving the block.

## Deck shape

Open dark, break dark, close dark, light in between. Concretely: title slide, then a
transition before each section, light content between them, and one closing slide —
next steps and owners for a working session, decisions required for a steering meeting.

Never alternate dark and light for variety. Dark means "new section"; using it
decoratively destroys that signal.

## Before handing anything over

- Render it and look at every slide. Overflow and collisions do not show up in the XML.
  This needs LibreOffice and poppler (`pdftoppm`). Where Anthropic's `docx` skill is
  present, as in claude.ai, go through its LibreOffice wrapper: sandboxes can block the
  sockets LibreOffice needs. Call it; don't copy it. Keep the renders out of the output
  folder:
  ```bash
  W=/mnt/skills/public/docx/scripts/office/soffice.py; R="$(mktemp -d)"
  lo() { if [ -f "$W" ]; then python3 "$W" "$@"; else soffice "$@"; fi; }
  lo -env:UserInstallation="file://$R/profile" --headless --convert-to pdf --outdir "$R" <name>.pptx \
    && pdftoppm -jpeg -r 80 "$R/<name>.pdf" "$R/slide" && ls "$R"
  ```
  On macOS, if `soffice` isn't on the path, it is
  `/Applications/LibreOffice.app/Contents/MacOS/soffice`. If either tool is missing,
  say so and ask the user to open the deck and check every slide. Never report this
  check as done when it was skipped.
- Check every text box against the margins: nothing crosses 0.4in.
- Check no title runs under the logo.
- Search for `Lorem`, `TODO`, `XXX`, `[insert]` and any sample content left in place.
- Engagement terms: "vRamp" for the time box, "vRamp build" for built outputs, "pilot" for user cohorts, "project repository" for source control. No "PoC" or "proof of concept" for the engagement.
- Don't show internal reference codes (action IDs such as T1, D3) on a slide unless that
  slide also shows the table that defines them.
- Architecture diagrams use generic icons with platform names as labels, not vendor
  logos, and mark undecided components as dashed with a legend.
- Confirm no client PII, credentials, or internal figures made it into a shared deck.

Generated decks are drafts until a named V4C reviewer signs off. Say so when handing one over.

## pptxgenjs gotchas

- Colours are hex without `#`.
- `isTextBox: true` and `margin: 0` on text, or spacing drifts from the spec.
- Build a fresh options object per shape; reusing one silently carries properties over.
- `rectRadius` only applies to `roundRect`.
- Charts: series colours in the guide's order, data labels on, value axis off,
  horizontal gridlines only, no borders or shadows.

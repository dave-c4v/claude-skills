---
name: v4c-doc-style
description: Apply V4C's house style to documents bound for Google Docs or Word, building a branded .docx from a JSON spec. Use for V4C reports, design docs, runbooks and write-ups. For decks use v4c-deck-style.
---

# V4C document style

`style-guide.md` is the specification: page, palette, type scale, components, review
rules, Google Docs behaviour and the do-not list. Read it before generating or
reviewing any document. This file covers how to apply it.

The brand is shared with `v4c-deck-style`. If that skill is installed, its
`style-guide.md` is the source for palette and brand rules; this guide adapts them to
pages and must not contradict it.

## Two routes

**A person is writing the document themselves** → point them at the
**V4C Document Master** Google Doc in `06 Delivery / 03 Templates & Accelerators` and
tell them to use File → Make a copy. If it is not there yet, build
`templates/master-template.json` (below), upload the `.docx` to that folder and open it
with Google Docs.

**Claude is generating the document** → write a content spec as `<name>.spec.json`,
then build it. Run this as one command, since shell variables don't carry over between
commands:

```bash
S="<this-skill-dir>"; OUT="<out-dir>"
M="$(node -p "const p = require.resolve('docx'); p.slice(0, p.lastIndexOf('node_modules') + 12)" 2>/dev/null)" \
  || { M="$(mktemp -d)/node_modules"; npm install --silent --prefix "${M%/node_modules}" docx; }
NODE_PATH="$M${NODE_PATH:+:$NODE_PATH}" node "$S/scripts/build_doc.js" <name>.spec.json "$OUT/<name>.docx"
```

- `<this-skill-dir>` is this skill's base directory. The skill folder is read-only and
  the script only reads from it, so it runs in place.
- `<out-dir>` is wherever this environment delivers files to the user. In Claude Code
  that is the working folder: keep the spec there too, so it can be edited and rebuilt
  after review. Elsewhere, such as claude.ai, use the output location that environment
  names for files the user should receive. A file saved anywhere else never reaches them.
- The script needs Node.js and the `docx` package, and resolves `jszip` or `fflate` (whichever `docx` uses) through `docx`.
  The second line finds `docx` wherever the working folder can already load it, which is
  how a preinstalled copy is picked up, and installs one into a temporary folder only if
  there is none. If `node` is missing, or the install fails because network access is
  off, stop and tell the user what is needed. Do not hand-build the `.docx` another way.
- Image paths in the spec are relative to the working folder.

Spec format: `references/spec-format.md`. Section skeletons per document type:
`references/doc-types.md`. Start from the skeleton, then fill it only with material
retrieved for this client.

## Non-negotiables

1. **Nothing floats.** Inline images, simple tables, no merged cells, no text boxes.
   This is what makes the Google Docs conversion survive. The builder enforces it;
   do not hand-edit the XML to add floating shapes.
2. **Poppins, `#3E3E3E` text, `#916DF9`/`#2AB1AC` accents.** No stock blues, no black.
3. **Furniture from `assets/` only.** Cover banner on page 1, the full-colour logo
   (`logo-color.png`) right-aligned in the header, gradient bar in the footer. The logo
   is never recoloured. The white-logo chip (`logo-chip.png`) is retired and kept only
   as a fallback.
4. **Header and footer are borderless two-column tables, never right tab stops.**
   Google Docs import drops right tab stops in headers and footers, so a tab-aligned
   logo or page number ends up on the left. `build_doc.js` does this already; keep it
   that way if you edit the builder.
5. **Draft until signed off.** `status` stays "Draft for V4C review" and `draft: true`
   until a named V4C reviewer completes the review block (V4C's org instructions). Say so
   when handing over.
6. **One client per document.** No other client's names, logos, metrics or case
   studies, and no internal sales or partner content.

## Writing the content

- Lead with the answer: the summary's `lead` block states the conclusion.
- Attribute claims to retrieved sources (captions, or "Source:" lines). Mark V4C
  judgement as judgement. State what could not be found rather than filling the gap.
- Leave bracketed placeholders only where information was not supplied, and list them
  when handing over. Never invent names, dates or figures.
- Flag cloud-provider-dependent recommendations and ask if the provider is unknown.
- Engagement terms follow the practice glossary: "vRamp" for the time box, "vRamp build" for built outputs, "pilot" for user cohorts. No "PoC" or "proof of concept" for the engagement. (Glossary: CLAUDE.md, Engagement terminology, in the claude-enablement repo.)
- AI system deliverables use the ISO 42001 skeleton in `references/doc-types.md`.

## Before handing anything over

1. Render and look at every page. This needs LibreOffice and poppler (`pdftoppm`).
   Sandboxed environments such as claude.ai can block the sockets LibreOffice needs, so
   where Anthropic's `docx` skill is present, go through its wrapper,
   `scripts/office/soffice.py`, which works around that. Call it; don't copy it. The
   separate profile keeps the conversion from colliding with a LibreOffice window the user
   already has open. Keep the renders out of the output folder:
   ```bash
   W=/mnt/skills/public/docx/scripts/office/soffice.py; R="$(mktemp -d)"
   lo() { if [ -f "$W" ]; then python3 "$W" "$@"; else soffice "$@"; fi; }
   lo -env:UserInstallation="file://$R/profile" --headless --convert-to pdf --outdir "$R" <name>.docx \
     && pdftoppm -jpeg -r 80 "$R/<name>.pdf" "$R/page" && ls "$R"
   ```
   On macOS, if `soffice` isn't on the path, it is
   `/Applications/LibreOffice.app/Contents/MacOS/soffice`.
   Check for text overflowing cells, headings stranded at page bottoms, tables
   breaking awkwardly, near-empty pages created by `newPage` on a section that follows
   a spilled table (drop `newPage` there), and header text running into the logo.
   If either tool is missing, say so and ask the user to open the `.docx` and check
   every page. Never report this check as done when it was skipped.
2. Search the text for placeholders and leftovers. This covers the body, header and
   footer, and needs only `unzip`:
   ```bash
   unzip -p <name>.docx 'word/*.xml' | sed -e 's/<[^>]*>/ /g' | grep -o -E '\[[^]]*\]|Lorem|TODO|XXX' | sort | uniq -c
   ```
3. Confirm no PII, credentials or other clients' material.
4. Present the `.docx` with the Google Docs steps: upload to the client's Drive folder
   → Open with → Google Docs → check fonts, header, footer and page numbers → delete
   the leftover `.docx`. Also confirm the header logo and page number are still
   right-aligned. Only upload to Drive on the user's say-so.
5. Note that the document needs a named V4C reviewer before release, and that
   significant AI-assisted deliverables go in the ISO 42001 use-case register.

## Regenerating assets

`scripts/make_assets.py` composes the four document assets from the deck skill's
`darkbg.png`, `hero-arch.png`, `logo-white.png` and `gradbar.png`. Re-run it only if
the deck assets change. It needs Pillow, and takes the four files from the first of these:
1. the folder given as its first argument, `deck_assets_dir`;
2. the folder in the `V4C_DECK_ASSETS` environment variable;
3. `v4c-deck-style/assets/` beside this skill's folder, as in this plugin's source and in Claude Code;
4. the same folder with this skill's folder-name prefix, as in claude.ai:
   `client-engagements:v4c-deck-style/assets/` beside `client-engagements:v4c-doc-style/`.

An override that is set (1 or 2) is used as given. If it lacks any of the files, the script
stops with an error that names it; it never falls back to 3 or 4. Without an override, it uses
the first of 3 and 4 that holds all four files, and looks nowhere else. If neither does, the
error lists every step it tried.

It writes to its second argument, `out_dir`. That defaults to this skill's `assets/` only in
this plugin's source repository. An installed copy of this skill is read-only, so there the
script stops unless `out_dir` is given. To give `out_dir` alone, pass `""` as the first
argument.

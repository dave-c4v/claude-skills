# V4C Claude skills

A Claude Code plugin marketplace for V4C's external client engagements.

## Plugins

| Plugin | What it does |
|---|---|
| [`client-engagements`](plugins/client-engagements) | House style for client-facing work: branded documents (`v4c-doc-style`) and slide decks (`v4c-deck-style`). |

### `client-engagements` skills

- **`v4c-doc-style`**: builds V4C-branded `.docx` files from a JSON content spec that
  convert cleanly to Google Docs. Includes a master template, section skeletons per
  document type (design, discovery, status, runbook, ISO 42001 AI system docs, proposal)
  and pre-release checks.
- **`v4c-deck-style`**: the V4C slide spec (10in × 5.625in canvas, Poppins, palette,
  brand furniture, slide inventory) with pptxgenjs snippets for generated decks.

## Install

In Claude Code:

```
/plugin marketplace add dave-c4v/claude-skills
/plugin install client-engagements@v4c-claude-skills
```

Skills are then available as `client-engagements:v4c-doc-style` and
`client-engagements:v4c-deck-style`.

## Requirements

- Node.js, plus `docx` (documents) or `pptxgenjs` (decks). The skills install these into
  a temporary folder when they are not already available, which needs network access.
- LibreOffice and poppler (`pdftoppm`) for the render check before hand-off.
- Python 3 with Pillow only to regenerate the document brand assets.

## Layout

```
.claude-plugin/marketplace.json        marketplace manifest
plugins/<plugin>/.claude-plugin/plugin.json
plugins/<plugin>/skills/<skill>/SKILL.md
```

To add a skill, put it under `plugins/client-engagements/skills/<name>/` with a
`SKILL.md`. To add a plugin, add its folder under `plugins/` and an entry in
`.claude-plugin/marketplace.json`. Bump `version` in both manifests on release, then
check with:

```bash
claude plugin validate .
```

## Rules for content in this repo

Skills here are reused across clients, so they hold general know-how only: no client
names, logos, metrics, credentials or engagement material.

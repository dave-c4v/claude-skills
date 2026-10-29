# Content spec format

`scripts/build_doc.js` takes one JSON file: `meta` for the cover and furniture, and an
ordered `blocks` array for the body.

```bash
node scripts/build_doc.js spec.json out.docx
```

Inline markup in any text field: `**bold**`, `*italic*`. Nothing else is parsed; write
plain text otherwise. Any text field may be an array of strings for line breaks.

## meta

| Field | Default | Notes |
|---|---|---|
| `client` | `[Client]` | Cover kicker, header, footer |
| `docType` | `[Document type]` | Cover kicker, e.g. "Solution design" |
| `title` | `[Document title]` | Cover title |
| `shortTitle` | `title` | Header text on body pages; keep under ~40 chars |
| `subtitle` | placeholder | One line |
| `preparedFor` | `client` | Stakeholder names in an ordinary work context are fine; no contact details |
| `preparedBy` | `v4c.ai \| [Name], [Title]` | Never invent a name |
| `date`, `version` | `[Date]`, `0.1` | |
| `status` | `Draft for V4C review` | Shown purple while it contains "draft" |
| `draft` | `true` | `false` removes the footer draft marker. Only after sign-off |
| `classification` | `Confidential. Prepared for {client} by v4c.ai.` | Override if the engagement specifies |
| `cover` | `true` | `false` for short notes: no cover, no first-page variant |

## blocks

| `type` | Fields | Renders as |
|---|---|---|
| `h1` | `text`, `kicker?`, `newPage?` | Auto-numbered teal kicker + Heading 1 |
| `h2`, `h3` | `text` | Heading 2 / Heading 3 |
| `lead` | `text` | Large grey opening paragraph |
| `p` | `text` | Body paragraph |
| `bullets`, `numbered` | `items[]` | Purple bullets / purple bold numbers |
| `callout` | `tone`: `note` \| `key` \| `decision`, `title?`, `body` (string or array) | Single-cell box |
| `metrics` | `items[{value,label}]` (3–4), `caption?` | Stat row |
| `table` | `columns[]`, `rows[][]`, `widths?[]` (relative), `caption?` | Navy header table |
| `raid` | `rows[{type,description,owner,due,status}]` | `type` ∈ Risk, Assumption, Issue, Dependency |
| `actions` | `rows[{action,owner,side,due}]` | `side` ∈ V4C, Client |
| `decisions` | `rows[{decision,options,recommendation,by}]` | |
| `docControl` | `rows[[version,date,author,changes]]` | Labelled "Document control" |
| `signoff` | `reviewer?`, `role?`, `date?`, `status?`, `aiDisclosure?` (default true), `disclosureText?` | Labelled "Review and release" |
| `contents` | none | Static list of H1s; place it anywhere, it fills in after all blocks render |
| `image` | `path`, `width?` (in, ≤6.7), `aspect?` (h/w) or `height?`, `caption?` | Inline image. Charts: render to PNG first |
| `caption` | `text` | 7pt grey line |
| `pagebreak` | none | |

## Charts

There is no native chart block: a Docs-linked chart cannot be authored from a `.docx`.
Render charts to PNG (matplotlib, Poppins, series order `#916DF9`, `#2AB1AC`,
`#008EE8`, `#1B335F`, data labels on, horizontal gridlines only in `#B9B9C2`, no
borders) at 2× resolution and place them with an `image` block. Title the caption with
the takeaway.

## Minimal example

```json
{
  "meta": { "client": "[Client]", "docType": "Meeting notes", "title": "Weekly delivery sync", "cover": false },
  "blocks": [
    { "type": "h1", "text": "Summary" },
    { "type": "lead", "text": "Bronze ingestion is complete; silver is blocked on one access request." },
    { "type": "actions", "rows": [
      { "action": "Raise the catalog access request", "owner": "[Name]", "side": "Client", "due": "[Date]" }
    ] }
  ]
}
```

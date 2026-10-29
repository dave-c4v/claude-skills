#!/usr/bin/env node
/*
 * V4C document builder: JSON content spec -> V4C-styled .docx that converts cleanly
 * to Google Docs (inline images only, no floating objects, no merged cells,
 * DXA widths, built-in heading styles, Poppins).
 *
 * Usage: node build_doc.js <spec.json> <out.docx>
 * Spec format: see ../references/spec-format.md
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, WidthType, ShadingType, BorderStyle, LevelFormat,
  TabStopType, PageNumber, PageBreak, VerticalAlign, TableLayoutType,
} = require('docx');

// ---------- tokens (mirror v4c-deck-style section 2) ----------
const C = {
  text: '3E3E3E', text2: '616972', border: 'B9B9C2', purple: '916DF9', teal: '2AB1AC',
  blue: '008EE8', deep: '1B335F', navy: '131750', tint: 'F4F4F6', white: 'FFFFFF',
};
const FONT = 'Poppins';
const PAGE_W = 12240, PAGE_H = 15840, MX = 1296, MY = 1152; // Letter, 0.9in / 0.8in
const CW = PAGE_W - 2 * MX; // 9648 DXA = 6.7in content width
const PX = 96;              // docx-js image units are px at 96dpi
const ASSETS = path.join(__dirname, '..', 'assets');
const img = n => fs.readFileSync(path.join(ASSETS, n));

// ---------- inline markup: **bold**, *italic* ----------
function runs(text, base = {}) {
  if (Array.isArray(text)) return text.flatMap((t, i) => i ? [new TextRun({ break: 1, ...base, text: '' }), ...runs(t, base)] : runs(t, base));
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  const s = String(text ?? '');
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(new TextRun({ ...base, text: s.slice(last, m.index) }));
    const bold = m[0].startsWith('**');
    out.push(new TextRun({ ...base, text: m[0].slice(bold ? 2 : 1, bold ? -2 : -1), bold: bold || base.bold, italics: !bold || base.italics }));
    last = m.index + m[0].length;
  }
  if (last < s.length || !out.length) out.push(new TextRun({ ...base, text: s.slice(last) }));
  return out;
}
const P = (text, opts = {}, run = {}) => new Paragraph({ ...opts, children: runs(text, run) });

// ---------- borders and cells ----------
const line = (color = C.border, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const allBorders = (b) => ({ top: b, bottom: b, left: b, right: b });
const noBorders = allBorders(none);

function cell(content, w, o = {}) {
  const children = Array.isArray(content) && content[0] instanceof Paragraph ? content
    : [P(content, { spacing: { before: 0, after: 0, line: 276 } }, { size: o.size || 17, color: o.color || C.text, bold: o.bold })];
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: o.borders || allBorders(line()),
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: o.margins || { top: 90, bottom: 90, left: 130, right: 130 },
    verticalAlign: o.vAlign || VerticalAlign.TOP,
    children,
  });
}
function widths(fracs, total = CW) {
  const f = fracs || [];
  const sum = f.reduce((a, b) => a + b, 0);
  const w = f.map(x => Math.floor(total * x / sum));
  w[w.length - 1] += total - w.reduce((a, b) => a + b, 0);
  return w;
}
function table(columns, rows, fracs, o = {}) {
  const w = widths(fracs || columns.map(() => 1));
  const head = new TableRow({
    tableHeader: true,
    children: columns.map((c, i) => cell(c, w[i], { fill: C.deep, color: C.white, bold: true, size: 16,
      borders: allBorders(line(C.deep)) })),
  });
  const body = rows.map(r => new TableRow({
    cantSplit: true,
    children: r.map((v, i) => {
      const style = (o.cellStyle && o.cellStyle(v, i)) || {};
      return cell(v, w[i], style);
    }),
  }));
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: w, layout: TableLayoutType.FIXED, rows: [head, ...body] });
}

// ---------- block renderers ----------
let sectionNo = 0;
const headings = [];
const SPACERS = new WeakSet(), BREAKS = new WeakSet();
const spacer = (after = 120) => { const p = new Paragraph({ spacing: { before: 0, after }, children: [] }); SPACERS.add(p); return p; };
const label = t => new Paragraph({ keepNext: true, spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: t.toUpperCase(), size: 16, bold: true, color: C.teal, characterSpacing: 20 })] });

function caption(text) {
  return P(text, { spacing: { before: 80, after: 200 } }, { size: 14, color: C.text2 });
}

function callout(b) {
  const tone = b.tone || 'note';
  const t = {
    note: { fill: C.tint, border: line(C.tint), head: C.purple, body: C.text },
    key: { fill: C.white, border: line(C.purple, 8), head: C.purple, body: C.text },
    decision: { fill: C.deep, border: line(C.deep), head: C.teal, body: C.white },
  }[tone] || {};
  const kids = [];
  if (b.title) kids.push(P(b.title.toUpperCase(), { spacing: { before: 0, after: 60 } }, { size: 15, bold: true, color: t.head, characterSpacing: 10 }));
  (Array.isArray(b.body) ? b.body : [b.body]).forEach((para, i, arr) =>
    kids.push(P(para, { spacing: { before: 0, after: i < arr.length - 1 ? 80 : 0, line: 300 } }, { size: 19, color: t.body })));
  return [new Table({
    width: { size: CW, type: WidthType.DXA }, columnWidths: [CW], layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: [cell(kids, CW, { fill: t.fill, borders: allBorders(t.border), margins: { top: 200, bottom: 200, left: 260, right: 260 } })] })],
  }), spacer(160)];
}

function metrics(b) {
  const n = b.items.length;
  const w = widths(b.items.map(() => 1));
  const accents = [C.purple, C.teal, C.blue, C.deep];
  return [new Table({
    width: { size: CW, type: WidthType.DXA }, columnWidths: w, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: b.items.map((it, i) => cell([
      P(it.value, { spacing: { before: 0, after: 40 } }, { size: 40, bold: true, color: accents[i % (n === 3 ? 2 : 4)] }),
      P(it.label, { spacing: { before: 0, after: 0, line: 264 } }, { size: 16, color: C.text2 }),
    ], w[i], { borders: allBorders(line()), margins: { top: 180, bottom: 180, left: 200, right: 200 } })) })],
  }), ...(b.caption ? [caption(b.caption)] : [spacer(160)])];
}

const RAID_COLOR = { Risk: C.purple, Assumption: C.teal, Issue: C.blue, Dependency: C.deep };

function render(b) {
  switch (b.type) {
    case 'h1': {
      sectionNo += 1;
      const no = String(sectionNo).padStart(2, '0');
      headings.push({ no, text: b.text });
      const kick = new Paragraph({ pageBreakBefore: !!b.newPage, keepNext: true, spacing: { before: b.newPage ? 160 : 360, after: 20 },
          children: [new TextRun({ text: `${no}${b.kicker ? '  ·  ' + b.kicker.toUpperCase() : ''}`, size: 16, bold: true, color: C.teal, characterSpacing: 20 })] });
      if (b.newPage) BREAKS.add(kick);
      return [kick, new Paragraph({ heading: 'Heading1', children: runs(b.text) })];
    }
    case 'h2': return [new Paragraph({ heading: 'Heading2', children: runs(b.text) })];
    case 'h3': return [new Paragraph({ heading: 'Heading3', children: runs(b.text) })];
    case 'lead': return [P(b.text, { spacing: { before: 0, after: 200, line: 300 } }, { size: 24, color: C.text2 })];
    case 'p': return [P(b.text)];
    case 'bullets':
    case 'numbered':
      return b.items.map(it => new Paragraph({ numbering: { reference: b.type === 'bullets' ? 'v4c-bullets' : 'v4c-numbers', level: 0 },
        spacing: { before: 0, after: 80 }, children: runs(it) }));
    case 'callout': return callout(b);
    case 'metrics': return metrics(b);
    case 'table': return [table(b.columns, b.rows, b.widths), b.caption ? caption(b.caption) : spacer(160)];
    case 'raid': return [table(['Type', 'Description', 'Owner', 'Due', 'Status'],
      b.rows.map(r => [r.type, r.description, r.owner, r.due, r.status]), [1.5, 4, 1.3, 1.0, 1.0],
      { cellStyle: (v, i) => i === 0 ? { bold: true, color: RAID_COLOR[v] || C.text } : null }), spacer(160)];
    case 'actions': return [table(['Action', 'Owner', 'Side', 'Due'],
      b.rows.map(r => [r.action, r.owner, r.side, r.due]), [4.6, 1.6, 1.0, 1.1],
      { cellStyle: (v, i) => i === 2 ? { bold: true, color: v === 'V4C' ? C.purple : C.teal } : null }), spacer(160)];
    case 'decisions': return [table(['Decision required', 'Options', 'Recommendation', 'Needed by'],
      b.rows.map(r => [r.decision, r.options, r.recommendation, r.by]), [2.4, 2.4, 2.4, 1.1]), spacer(160)];
    case 'docControl': return [label(b.label || 'Document control'), table(['Version', 'Date', 'Author', 'Changes'],
      b.rows, [0.9, 1.3, 1.8, 4.6]), spacer(160)];
    case 'signoff': return signoff(b);
    case 'contents': return [{ __contents: true }];
    case 'image': {
      const data = fs.readFileSync(b.path);
      const wIn = Math.min(b.width || 6.7, 6.7);
      const hIn = b.height || wIn * (b.aspect || 0.5625);
      return [new Paragraph({ spacing: { before: 120, after: 0 }, children: [new ImageRun({ type: path.extname(b.path).slice(1).replace('jpeg', 'jpg'), data,
        transformation: { width: wIn * PX, height: hIn * PX } })] }), caption(b.caption || '')];
    }
    case 'caption': return [caption(b.text)];
    case 'pagebreak': return [new Paragraph({ children: [new PageBreak()] })];
    default: throw new Error(`Unknown block type: ${b.type}`);
  }
}

function signoff(b) {
  const w = widths([1.6, 3, 1.6, 2.1]);
  const lab = (t, i) => cell(t, w[i], { bold: true, color: C.text2, size: 15, fill: C.tint });
  const val = (t, i) => cell(t, w[i], { size: 17 });
  const kids = [label(b.label || 'Review and release'),
    new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: w, layout: TableLayoutType.FIXED, rows: [
      new TableRow({ children: [lab('Reviewer', 0), val(b.reviewer || '[Name]', 1), lab('Role', 2), val(b.role || '[Role]', 3)] }),
      new TableRow({ children: [lab('Review date', 0), val(b.date || '[Date]', 1), lab('Release status', 2), val(b.status || 'Pending review', 3)] }),
    ] }),
  ];
  if (b.aiDisclosure !== false) kids.push(P(b.disclosureText ||
    'Prepared with AI assistance and reviewed by the named V4C reviewer before release.',
    { spacing: { before: 100, after: 200 } }, { size: 14, color: C.text2, italics: true }));
  return kids;
}

// ---------- cover ----------
function cover(m) {
  const w = widths([1.3, 3.4]);
  const row = (k, v, color) => new TableRow({ children: [
    cell(k, w[0], { bold: true, size: 15, color: C.text2, borders: { ...noBorders, bottom: line() }, margins: { top: 70, bottom: 70, left: 0, right: 100 } }),
    cell(v, w[1], { size: 17, color: color || C.text, bold: !!color, borders: { ...noBorders, bottom: line() }, margins: { top: 70, bottom: 70, left: 0, right: 0 } }),
  ] });
  const rows = [
    ['Prepared for', m.preparedFor || m.client || '[Client]'],
    ['Prepared by', m.preparedBy || 'v4c.ai  |  [Name], [Title]'],
    ['Date', m.date || '[Date]'],
    ['Version', m.version || '0.1'],
    ['Status', m.status || 'Draft for V4C review', (m.status || 'Draft').toLowerCase().includes('draft') ? C.purple : null],
  ];
  const kicker = [m.client || '[Client]', m.docType || '[Document type]'].join('  ·  ').toUpperCase();
  return [
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new ImageRun({ type: 'png', data: img('cover-banner.png'),
      transformation: { width: 6.7 * PX, height: 2.9 * PX }, altText: { name: 'v4c.ai', description: 'v4c.ai cover', title: 'v4c.ai' } })] }),
    new Paragraph({ spacing: { before: 520, after: 80 }, children: [new TextRun({ text: kicker, size: 17, bold: true, color: C.teal, characterSpacing: 20 })] }),
    new Paragraph({ style: 'Title', children: runs(m.title || '[Document title]') }),
    P(m.subtitle || '[Subtitle: one line on what this document is for]', { spacing: { before: 0, after: 520, line: 320 } }, { size: 26, color: C.text2 }),
    new Table({ width: { size: Math.round(CW * 0.7), type: WidthType.DXA }, columnWidths: widths([1.3, 3.4], Math.round(CW * 0.7)),
      layout: TableLayoutType.FIXED, rows: rows.map(r => row(...r)) }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function contentsBlock() {
  const out = [label('Contents')];
  headings.forEach(h => out.push(new Paragraph({
    spacing: { before: 0, after: 0, line: 276 },
    border: { bottom: line() },
    tabStops: [{ type: TabStopType.LEFT, position: 720 }],
    children: [new TextRun({ text: h.no, bold: true, color: C.purple, size: 19 }), new TextRun({ text: '\t' + h.text, size: 19, color: C.text })],
  })));
  out.push(spacer(240));
  return out;
}

// ---------- header / footer ----------
// Header/footer use a borderless two-column table instead of a right tab stop:
// Google Docs import drops right-aligned tab stops in headers, which pushed the logo left.
const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOB = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
function twoCol(leftKids, rightKids, split) {
  const lw = Math.round(CW * (split || 0.75)), rw = CW - lw;
  const cell = (kids, w, align) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: NOB, verticalAlign: VerticalAlign.BOTTOM,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    children: [new Paragraph({ alignment: align, spacing: { before: 0, after: 0 }, children: kids })] });
  return new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [lw, rw], layout: TableLayoutType.FIXED, borders: NOB,
    rows: [new TableRow({ children: [cell(leftKids, lw, AlignmentType.LEFT), cell(rightKids, rw, AlignmentType.RIGHT)] })] });
}
function header(m) {
  return new Header({ children: [
    twoCol([new TextRun({ text: `${m.client || '[Client]'}  ·  ${m.shortTitle || m.title || '[Document title]'}`, size: 14, color: C.text2 })],
      [new ImageRun({ type: 'png', data: img('logo-color.png'), transformation: { width: 0.62 * PX, height: 0.2294 * PX },
        altText: { name: 'v4c.ai', description: 'v4c.ai logo', title: 'v4c.ai' } })]),
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [] }),
  ] });
}
function footer(m, isCover) {
  const conf = m.classification || `Confidential. Prepared for ${m.client || '[Client]'} by v4c.ai.`;
  const draft = m.draft !== false ? '  ·  DRAFT, NOT FOR RELEASE' : '';
  const kids = [
    new Paragraph({ spacing: { before: 0, after: 60 }, children: [new ImageRun({ type: 'png', data: img('gradbar-doc.png'),
      transformation: { width: 6.7 * PX, height: 4 }, altText: { name: 'bar', description: 'brand bar', title: 'bar' } })] }),
  ];
  if (isCover) kids.push(P(conf + draft, { spacing: { before: 0, after: 0 } }, { size: 12, italics: true, color: C.text2 }));
  else { kids.push(twoCol([
    new TextRun({ text: conf, size: 12, color: C.text2 }),
    new TextRun({ text: draft, size: 12, bold: true, color: C.purple }),
  ], [new TextRun({ children: [PageNumber.CURRENT], size: 14, bold: true, color: C.text })], 0.85));
    kids.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [] })); }
  return new Footer({ children: kids });
}

// ---------- build ----------
function build(spec) {
  const m = spec.meta || {};
  const rendered = spec.blocks.flatMap(render);
  const expanded = rendered.flatMap(x => x && x.__contents ? contentsBlock() : [x]);
  // a trailing spacer before a page break can spill onto its own blank page
  const body = expanded.filter((x, i) => !(SPACERS.has(x) && BREAKS.has(expanded[i + 1])));
  const children = [...(m.cover === false ? [] : cover(m)), ...body];

  return new Document({
    creator: 'v4c.ai', title: m.title || 'v4c.ai document', description: m.docType || '',
    styles: {
      default: { document: { run: { font: FONT, size: 19, color: C.text }, paragraph: { spacing: { after: 140, line: 312 } } } },
      paragraphStyles: [
        { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 56, bold: true, color: C.text },
          paragraph: { spacing: { before: 0, after: 120, line: 264 } } },
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 36, bold: true, color: C.text }, paragraph: { spacing: { before: 0, after: 200, line: 276 }, keepNext: true, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 26, bold: true, color: C.text }, paragraph: { spacing: { before: 320, after: 100, line: 276 }, keepNext: true, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 20, bold: true, color: C.purple }, paragraph: { spacing: { before: 220, after: 60 }, keepNext: true, outlineLevel: 2 } },
      ],
    },
    numbering: { config: [
      { reference: 'v4c-bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { run: { color: C.purple, bold: true }, paragraph: { indent: { left: 360, hanging: 260 } } } }] },
      { reference: 'v4c-numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1', alignment: AlignmentType.LEFT,
        style: { run: { color: C.purple, bold: true }, paragraph: { indent: { left: 400, hanging: 400 } } } }] },
    ] },
    sections: [{
      properties: {
        titlePage: m.cover !== false,
        page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MY, bottom: MY, left: MX, right: MX, header: 500, footer: 420 } },
      },
      headers: { default: header(m), first: new Header({ children: [new Paragraph({ children: [] })] }) },
      footers: { default: footer(m, false), first: footer(m, true) },
      children,
    }],
  });
}

if (require.main === module) {
  const [specPath, out] = process.argv.slice(2);
  if (!specPath || !out) { console.error('Usage: node build_doc.js <spec.json> <out.docx>'); process.exit(1); }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  toBuffer(spec).then(buf => { fs.writeFileSync(out, buf); console.log('wrote', out); });
}

// docx-js omits w:lineRule; LibreOffice and some importers then treat w:line as exact,
// which clips inline images and collides stacked headings. Make "auto" explicit.
// Zip library: whichever docx itself depends on (jszip up to docx 9.5, fflate after).
const fix = xml => xml.replace(/<w:spacing(?![^>]*w:lineRule)([^>]*w:line="\d+")/g, '<w:spacing w:lineRule="auto"$1');
const PARTS = /^word\/(document|styles|header\d*|footer\d*)\.xml$/;
async function toBuffer(spec) {
  const docxDir = path.dirname(require.resolve('docx'));
  const lib = n => { try { return require(require.resolve(n, { paths: [docxDir] })); } catch { return null; } };
  const buf = await Packer.toBuffer(build(spec));
  const JSZip = lib('jszip');
  if (JSZip) {
    const zip = await JSZip.loadAsync(buf);
    for (const name of Object.keys(zip.files).filter(n => PARTS.test(n))) zip.file(name, fix(await zip.file(name).async('string')));
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }
  const fflate = lib('fflate');
  if (!fflate) throw new Error('build_doc.js: docx depends on neither jszip nor fflate; cannot post-process the .docx');
  const files = fflate.unzipSync(new Uint8Array(buf));
  for (const name of Object.keys(files).filter(n => PARTS.test(n))) files[name] = fflate.strToU8(fix(fflate.strFromU8(files[name])));
  return Buffer.from(fflate.zipSync(files, { level: 6 }));
}
module.exports = { build, toBuffer };

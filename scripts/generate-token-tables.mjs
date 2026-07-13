#!/usr/bin/env node
// scripts/generate-token-tables.mjs
//
// Reads tokens/source/*.json (DTCG) and emits a markdown appendix listing
// every token grouped by file and nested path. Splices the output into
// both DESIGN.md (root) and apps/docs/pages/design.mdx between the
// markers <!-- TOKEN_TABLES_START --> and <!-- TOKEN_TABLES_END -->.
//
// Usage: node scripts/generate-token-tables.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const SOURCE_DIR = path.join(ROOT, 'tokens/source');

const FILE_LABELS = {
  'colors.json': { title: 'Colors — primitives', order: 1 },
  'typography.json': { title: 'Typography', order: 2 },
  'sizes.json': { title: 'Sizes', order: 3 },
  'theme.dark.json': { title: 'Theme primitives — Dark', order: 4 },
  'theme.light.json': { title: 'Theme primitives — Light', order: 5 },
  'semantic.kripto-dark.json': { title: 'Semantic — Kripto · Dark', order: 6 },
  'semantic.kripto-light.json': { title: 'Semantic — Kripto · Light', order: 7 },
  'semantic.hisse-dark.json': { title: 'Semantic — Hisse · Dark', order: 8 },
  'semantic.hisse-light.json': { title: 'Semantic — Hisse · Light', order: 9 },
  'semantic.global-dark.json': { title: 'Semantic — Global · Dark', order: 10 },
  'semantic.global-light.json': { title: 'Semantic — Global · Light', order: 11 },
};

const files = readdirSync(SOURCE_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort((a, b) => (FILE_LABELS[a]?.order ?? 99) - (FILE_LABELS[b]?.order ?? 99));

const out = [];
out.push('<!-- TOKEN_TABLES_START -->');
out.push('');
out.push('## Appendix A — Complete token reference');
out.push('');
out.push('_Auto-generated from `tokens/source/*.json` by `scripts/generate-token-tables.mjs`. Do not hand-edit this section; regenerate to update._');
out.push('');

let grandTotal = 0;

for (const file of files) {
  const raw = JSON.parse(readFileSync(path.join(SOURCE_DIR, file), 'utf8'));
  const label = FILE_LABELS[file]?.title ?? file;
  const rows = [];
  flatten(raw, [], rows);
  if (!rows.length) continue;

  grandTotal += rows.length;

  out.push(`### ${label}`);
  out.push('');
  out.push(`\`tokens/source/${file}\` · ${rows.length} tokens`);
  out.push('');
  out.push('| Path | Type | Value |');
  out.push('|---|---|---|');
  for (const { path: p, type, value } of rows) {
    out.push(`| \`${p}\` | ${type ?? '—'} | ${formatValue(value, type)} |`);
  }
  out.push('');
}

out.push(`---`);
out.push('');
out.push(`**Grand total**: ${grandTotal} tokens across ${files.length} source files.`);
out.push('');
out.push('<!-- TOKEN_TABLES_END -->');

const generated = out.join('\n');

// Splice into DESIGN.md (HTML-comment markers) and design.mdx (JSX-comment markers).
for (const { file, startMarker, endMarker } of [
  { file: path.join(ROOT, 'DESIGN.md'), startMarker: '<!-- TOKEN_TABLES_START -->', endMarker: '<!-- TOKEN_TABLES_END -->' },
  { file: path.join(ROOT, 'apps/docs/pages/design.mdx'), startMarker: '{/* TOKEN_TABLES_START */}', endMarker: '{/* TOKEN_TABLES_END */}' },
]) {
  const src = readFileSync(file, 'utf8');
  const output = generated.replace('<!-- TOKEN_TABLES_START -->', startMarker).replace('<!-- TOKEN_TABLES_END -->', endMarker);
  const startRe = new RegExp(escapeRe(startMarker) + '[\\s\\S]*?' + escapeRe(endMarker));
  const next = startRe.test(src) ? src.replace(startRe, output) : src.replace(/\s*$/, '') + '\n\n' + output + '\n';
  writeFileSync(file, next);
  console.log(`Wrote ${path.relative(ROOT, file)} (${output.length} chars)`);
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

console.log(`\nTotal tokens embedded: ${grandTotal}`);

// -----------------------------------------------------------------------------

function flatten(node, prefix, rows) {
  if (node && typeof node === 'object') {
    if ('$value' in node) {
      rows.push({ path: prefix.join('.'), type: node.$type, value: node.$value });
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      flatten(v, [...prefix, k], rows);
    }
  }
}

function formatValue(v, type) {
  if (typeof v === 'string') return `\`${escapePipe(v)}\``;
  if (typeof v === 'number') return `\`${v}\``;
  if (v && typeof v === 'object') return `\`${escapePipe(JSON.stringify(v))}\``;
  return String(v);
}

function escapePipe(s) { return String(s).replace(/\|/g, '\\|'); }

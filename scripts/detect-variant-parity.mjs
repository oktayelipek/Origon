#!/usr/bin/env node
// scripts/detect-variant-parity.mjs
//
// For every React component that has an associated Figma component set node
// (discovered from source comments), fetches the current Figma variant
// property list and compares with the exported TypeScript union types.
//
// Writes findings to `variant-parity-report.json` and, if any mismatches
// exist, prints a summary + exits 1 (CI can then open an issue).
//
// Usage: FIGMA_TOKEN=... node scripts/detect-variant-parity.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'packages/react/src');
const FILE_KEY = '57b5pxiONTgoI4w4fvaNbA';

const token = process.env.FIGMA_TOKEN;
if (!token) { console.error('FIGMA_TOKEN required.'); process.exit(2); }

// 1. Enumerate components: filename → { nodeId, unions: { PropName -> [values] } }
const targets = [];
for (const dir of readdirSync(SRC, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const dPath = path.join(SRC, dir.name);
  const files = readdirSync(dPath).filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx') && !f.endsWith('.figma.tsx'));
  for (const file of files) {
    const source = readFileSync(path.join(dPath, file), 'utf8');
    const compName = file.replace(/\.tsx$/, '');
    let nodeId = null;
    for (const line of source.split('\n').filter((l) => /figma/i.test(l))) {
      const m = line.match(/(\d{1,4}):(\d{2,7})\b/);
      if (m) { nodeId = `${m[1]}:${m[2]}`; break; }
    }
    if (!nodeId) continue;

    const unions = {};
    const typeRegex = /export\s+type\s+(\w+)\s*=\s*((?:'[^']+'\s*\|?\s*)+)/g;
    let mm;
    while ((mm = typeRegex.exec(source))) {
      const [, name, body] = mm;
      unions[name] = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
    }
    if (Object.keys(unions).length) targets.push({ compName, nodeId, unions });
  }
}

console.log(`Checking ${targets.length} components with detected Figma nodes.`);

// 2. Fetch node data (batch — API accepts comma-separated ids).
const idList = [...new Set(targets.map((t) => t.nodeId))].join(',');
const url = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(idList)}`;
const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
if (!res.ok) { console.error(`Figma API ${res.status}: ${await res.text()}`); process.exit(2); }
const data = await res.json();

// 3. For each target, extract Figma's Component Set componentPropertyDefinitions
//    (which yield the enum choices per prop) and compare.
const mismatches = [];
for (const t of targets) {
  const node = data.nodes[t.nodeId]?.document;
  if (!node) { console.warn(`  ${t.compName}: node ${t.nodeId} not found in Figma response`); continue; }

  const props = node.componentPropertyDefinitions ?? node.componentProperties ?? {};
  const figmaProps = {};
  for (const [key, def] of Object.entries(props)) {
    if (def?.type === 'VARIANT' && Array.isArray(def.variantOptions)) {
      figmaProps[key] = def.variantOptions;
    }
  }

  // Best-effort mapping: match a Figma prop key ('Size') to a TS union whose
  // name ends with that key (`ButtonSize`) case-insensitively.
  for (const [figmaKey, figmaValues] of Object.entries(figmaProps)) {
    const tsName = Object.keys(t.unions).find((n) => n.toLowerCase().endsWith(figmaKey.toLowerCase()));
    if (!tsName) {
      mismatches.push({ compName: t.compName, kind: 'no-ts-union', figmaKey, figmaValues });
      continue;
    }
    const tsValues = t.unions[tsName].map((v) => v.toLowerCase());
    const figmaNorm = figmaValues.map((v) => v.toLowerCase().replace(/[\s-]+/g, '-'));
    const missingInTs = figmaNorm.filter((v) => !tsValues.some((t) => t === v || t === v.replace(/-/g, '')));
    const missingInFigma = tsValues.filter((v) => !figmaNorm.some((f) => f === v || f === v.replace(/-/g, '')));
    if (missingInTs.length || missingInFigma.length) {
      mismatches.push({ compName: t.compName, kind: 'variant-diff', tsName, figmaKey, missingInTs, missingInFigma });
    }
  }
}

writeFileSync(path.join(ROOT, 'variant-parity-report.json'), JSON.stringify(mismatches, null, 2));

if (mismatches.length) {
  console.log(`\n❌ ${mismatches.length} variant mismatch(es):\n`);
  for (const m of mismatches) {
    if (m.kind === 'no-ts-union') {
      console.log(`  ${m.compName}: Figma has variant \`${m.figmaKey}\` (${m.figmaValues.join(', ')}) but no matching TS union.`);
    } else {
      const parts = [];
      if (m.missingInTs.length) parts.push(`add to \`${m.tsName}\`: ${m.missingInTs.join(', ')}`);
      if (m.missingInFigma.length) parts.push(`stale in code (not in Figma): ${m.missingInFigma.join(', ')}`);
      console.log(`  ${m.compName} (${m.figmaKey}): ${parts.join(' | ')}`);
    }
  }
  process.exit(1);
}
console.log('\n✅ All checked component variants match their TS unions.');

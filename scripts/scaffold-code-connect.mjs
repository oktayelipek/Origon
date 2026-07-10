#!/usr/bin/env node
// scripts/scaffold-code-connect.mjs
//
// Walks packages/react/src/*/ and emits `.figma.tsx` stubs for any component
// that doesn't already have one. Extracts the Figma node ID from source
// comments ("node 12:86248" / "(12-86248)") and exported prop types (e.g.
// `export type ButtonVariant = 'primary' | 'outline' | ...`) so the generated
// stub already has plausible enum mappings.
//
// Usage: node scripts/scaffold-code-connect.mjs [--dry]
//
// Non-destructive: existing .figma.tsx files are never overwritten.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'packages/react/src');
const dryRun = process.argv.includes('--dry');

const results = [];
for (const entry of readdirSync(SRC, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = path.join(SRC, entry.name);
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx') && !f.endsWith('.figma.tsx'));
  for (const file of files) {
    const compName = file.replace(/\.tsx$/, '');
    const stubPath = path.join(dir, `${compName}.figma.tsx`);
    if (existsSync(stubPath)) { results.push({ compName, status: 'skip (exists)' }); continue; }

    const source = readFileSync(path.join(dir, file), 'utf8');

    // Skip files that don't export a matching component symbol.
    const exportsComponent = new RegExp(`export\\s+(const|function|class)\\s+${compName}\\b`).test(source)
      || new RegExp(`export\\s+\\{[^}]*\\b${compName}\\b`).test(source);
    if (!exportsComponent) { results.push({ compName, status: 'skip (no export)' }); continue; }

    // Extract Figma node ID — canonical `N:NNNN` (colon-separated). Only accept
    // matches near a Figma-related keyword to avoid version numbers etc.
    let nodeId = null;
    const figmaLines = source.split('\n').filter((l) => /figma/i.test(l));
    for (const line of figmaLines) {
      const m = line.match(/(\d{1,4}):(\d{2,7})\b/);
      if (m) { nodeId = `${m[1]}-${m[2]}`; break; }
    }

    // Extract enum union types: `export type FooBar = 'a' | 'b';`
    const enumTypes = {};
    const typeRegex = /export\s+type\s+(\w+)\s*=\s*((?:'[^']+'\s*\|?\s*)+)/g;
    let m;
    while ((m = typeRegex.exec(source))) {
      const [, name, body] = m;
      const values = [...body.matchAll(/'([^']+)'/g)].map((x) => x[1]);
      enumTypes[name] = values;
    }

    // Map enum types to Props fields — the Props interface's fields.
    const propsMatch = source.match(new RegExp(`interface\\s+${compName}Props\\b[^{]*\\{([\\s\\S]*?)\\}\\n`));
    const propFields = [];
    if (propsMatch) {
      for (const line of propsMatch[1].split('\n')) {
        const fm = line.match(/^\s*(\w+)\??\s*:\s*(\w+)/);
        if (fm && enumTypes[fm[2]]) propFields.push({ name: fm[1], typeName: fm[2], values: enumTypes[fm[2]] });
      }
    }

    const props = propFields.length
      ? propFields.map((p) => {
          const key = capitalizeFigmaKey(p.typeName.replace(compName, '').replace('Props', '') || p.name);
          const entries = p.values.map((v) => `        ${quoteKey(cap(v))}: '${v}',`).join('\n');
          return `      ${p.name}: figma.enum('${key}', {\n${entries}\n      }),`;
        }).join('\n')
      : '      // TODO: add prop mappings — figma.enum / figma.textContent / figma.boolean';

    const exampleProps = propFields.map((p) => `${p.name}={${p.name}}`).join(' ');
    const exampleBody = propFields.length
      ? `({ ${propFields.map((p) => p.name).join(', ')} }) => <${compName} ${exampleProps} />`
      : `() => <${compName} />`;

    const url = nodeId
      ? `'https://OriginUI/?node-id=${nodeId}'`
      : `'https://OriginUI/?node-id=TODO' // FIXME: no node ID found in source`;

    const body = `import figma from '@figma/code-connect';
import { ${compName} } from './${compName}';

// Auto-scaffolded by scripts/scaffold-code-connect.mjs — refine props + example
// before publishing. See Button.figma.tsx for the canonical shape.
figma.connect(
  ${compName},
  ${url},
  {
    props: {
${props}
    },
    example: ${exampleBody},
  },
);
`;

    if (!dryRun) writeFileSync(stubPath, body);
    results.push({ compName, status: dryRun ? 'would write' : 'written', nodeId, propCount: propFields.length });
  }
}

// Summary.
const written = results.filter((r) => r.status === 'written' || r.status === 'would write');
console.log(`\n${written.length} stub(s) ${dryRun ? 'to be' : ''} written:`);
for (const r of written) console.log(`  ${r.compName.padEnd(24)} node=${r.nodeId ?? 'TODO'.padEnd(10)} props=${r.propCount}`);
const skipped = results.filter((r) => r.status.startsWith('skip'));
if (skipped.length) console.log(`\n${skipped.length} skipped (already has stub or no export).`);

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function capitalizeFigmaKey(s) {
  if (!s) return 'Variant';
  return s.split(/(?=[A-Z])/).join(' ').trim().split(' ').map(cap).join(' ');
}
function quoteKey(k) { return /^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k.replace(/'/g, "\\'")}'`; }

#!/usr/bin/env node
// scripts/set-package-versions.mjs
//
// Sets the `version` field of both publishable packages to the given value.
// Called by semantic-release during the prepare step so that both packages
// bump together, keeping the design system in lockstep.
//
// Usage: node scripts/set-package-versions.mjs 1.2.3

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(version)) {
  console.error(`Usage: set-package-versions.mjs <semver>  (got: ${version ?? 'nothing'})`);
  process.exit(2);
}

const targets = [
  'packages/react/package.json',
  'packages/tokens-react/package.json',
];

for (const rel of targets) {
  const file = path.join(ROOT, rel);
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  const prev = pkg.version;
  pkg.version = version;
  writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  ${rel}: ${prev} → ${version}`);
}

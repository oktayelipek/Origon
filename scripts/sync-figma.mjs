#!/usr/bin/env node
// scripts/sync-figma.mjs
//
// Pulls all Origon UI variables from Figma REST API and rewrites tokens/source/*.json.
// Resolves alias chains, converts Figma color format ({r,g,b,a}) to hex, and organizes
// per-brand × per-theme semantic tokens into separate files.
//
// Usage:  FIGMA_TOKEN=figd_... node scripts/sync-figma.mjs
//
// Output files (all in DTCG format):
//   tokens/source/colors.json         — Foundations.colors (primitives, all brands' scales)
//   tokens/source/typography.json     — Foundations.text + font
//   tokens/source/sizes.json          — Foundations.size (single-value dimensions)
//   tokens/source/theme.dark.json     — Themes collection resolved in Dark mode (spacing,radius,shadow,width,height,blur,level-colors)
//   tokens/source/theme.light.json    — same, Light mode
//   tokens/source/semantic.kripto-dark.json
//   tokens/source/semantic.kripto-light.json
//   tokens/source/semantic.hisse-dark.json
//   tokens/source/semantic.hisse-light.json
//   tokens/source/semantic.global-dark.json
//   tokens/source/semantic.global-light.json
//
// If any output already exists it is fully overwritten. Runs are idempotent.

import { writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const SOURCE_DIR = path.join(ROOT, 'tokens/source');
const FILE_KEY = '57b5pxiONTgoI4w4fvaNbA';

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error('FIGMA_TOKEN is not set. Create one at https://www.figma.com/settings and re-run.');
  process.exit(1);
}

// ----- Fetch ------------------------------------------------------------------
const res = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  { headers: { 'X-Figma-Token': token } },
);
if (!res.ok) {
  console.error(`Figma API ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const raw = await res.json();
const collections = raw.meta.variableCollections;
const variables = raw.meta.variables;

// Index collections by name (first match wins where duplicates exist — the Origon UI
// file has two "Typography" and two "01-Color Tokens" collections; we key on the
// specific IDs we care about).
const primary = {
  foundations: findCollection('Foundations', (c) => c.name === 'Foundations' && Object.keys(c.modes).length >= 0),
  semantic:    findCollection('01-Color Tokens', (c, id) => c.name === '01-Color Tokens' && c.modes.some((m) => m.name === 'Kripto Dark')),
  themes:      findCollection('Themes', (c) => c.name === 'Themes'),
};

if (!primary.foundations || !primary.semantic || !primary.themes) {
  console.error('Could not locate required collections. Present:', Object.keys(collections).map((id) => `${id}=${collections[id].name}`));
  process.exit(1);
}

// ----- Value resolution -------------------------------------------------------
function resolveValue(variable, modeId, depth = 0) {
  if (depth > 8) throw new Error(`Alias loop at ${variable.name}`);
  const raw = variable.valuesByMode[modeId] ?? variable.valuesByMode[collections[variable.variableCollectionId].defaultModeId];
  if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
    const target = variables[raw.id];
    if (!target) return null;
    // For alias, resolve in the target collection's default mode unless the same modeId
    // exists there.
    const targetCol = collections[target.variableCollectionId];
    const targetMode = targetCol.modes.find((m) => m.modeId === modeId)?.modeId ?? targetCol.defaultModeId;
    return resolveValue(target, targetMode, depth + 1);
  }
  return raw;
}

function figmaColorToHex(v) {
  if (!v || typeof v !== 'object' || !('r' in v)) return null;
  const to = (c) => Math.round((c ?? 0) * 255).toString(16).padStart(2, '0');
  const hex = '#' + to(v.r) + to(v.g) + to(v.b);
  if (v.a !== undefined && v.a < 1) {
    return hex + to(v.a);
  }
  return hex;
}

// ----- Build DTCG trees -------------------------------------------------------
function nestByPath(entries) {
  const root = {};
  for (const { path: p, value, type } of entries) {
    let cursor = root;
    for (let i = 0; i < p.length - 1; i++) {
      cursor[p[i]] = cursor[p[i]] ?? {};
      cursor = cursor[p[i]];
    }
    cursor[p[p.length - 1]] = { $value: value, $type: type };
  }
  return root;
}

function segmentize(name) {
  return name.split('/').map((s) => s.trim()).filter(Boolean);
}

// ----- Collect Foundations (primitives) ---------------------------------------
function collectFoundations() {
  const col = collections[primary.foundations];
  const modeId = col.defaultModeId;
  const foundVars = Object.values(variables).filter((v) => v.variableCollectionId === primary.foundations);

  const groups = { color: [], text: [], font: [], size: [] };
  // Figma uses plural "colors/" but our output key is singular "color".
  const nsAlias = { colors: 'color', text: 'text', font: 'font', size: 'size' };

  for (const v of foundVars) {
    const parts = segmentize(v.name);
    const rawNs = parts[0].toLowerCase();
    const namespace = nsAlias[rawNs];
    if (!namespace) continue;
    const resolved = resolveValue(v, modeId);

    let value = null;
    let type = null;
    if (v.resolvedType === 'COLOR') {
      value = figmaColorToHex(resolved);
      type = 'color';
    } else if (v.resolvedType === 'FLOAT') {
      value = resolved;
      type = 'dimension';
    } else if (v.resolvedType === 'STRING') {
      value = resolved;
      type = namespace === 'font' ? 'fontFamily' : 'string';
    }
    if (value === null || value === undefined) continue;

    // Normalize path parts: strip namespace prefix, camelCase everything, treat
    // digit-only steps as-is.
    const rest = parts.slice(1).map(normPart);
    groups[namespace].push({ path: rest, value, type });
  }
  return groups;
}

function normPart(s) {
  if (/^\d+$/.test(s)) return s;
  // Convert "Text/Display 4xl" style: keep camelCase-ish shape.
  const words = s.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
  return words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
}

// ----- Collect Themes (aliases into Foundations, Dark|Light) ------------------
function collectThemes(modeName) {
  const col = collections[primary.themes];
  const mode = col.modes.find((m) => m.name === modeName);
  if (!mode) return null;
  const modeId = mode.modeId;
  const themeVars = Object.values(variables).filter((v) => v.variableCollectionId === primary.themes);

  const groups = { spacing: [], radius: [], shadow: [], blur: [], width: [], height: [], color: [] };

  for (const v of themeVars) {
    const parts = segmentize(v.name);
    let namespace = parts[0].toLowerCase();
    // "colors/…" in Themes actually maps to color aliases (e.g., level/…)
    if (namespace === 'colors') namespace = 'color';
    if (!(namespace in groups)) continue;
    const resolved = resolveValue(v, modeId);
    let value = null;
    let type = null;
    if (v.resolvedType === 'COLOR') {
      value = figmaColorToHex(resolved);
      type = 'color';
    } else if (v.resolvedType === 'FLOAT') {
      value = resolved;
      type = 'dimension';
    } else continue;
    if (value === null || value === undefined) continue;
    groups[namespace].push({ path: parts.slice(1).map(normPart), value, type });
  }
  return groups;
}

// ----- Collect Semantic (01-Color Tokens, 6 modes) ----------------------------
function collectSemantic(modeName) {
  const col = collections[primary.semantic];
  const mode = col.modes.find((m) => m.name === modeName);
  if (!mode) return null;
  const modeId = mode.modeId;
  const semVars = Object.values(variables).filter((v) => v.variableCollectionId === primary.semantic);

  const groups = {};
  for (const v of semVars) {
    const parts = segmentize(v.name);
    const ns = normPart(parts[0]);
    if (v.resolvedType !== 'COLOR') continue;
    const resolved = resolveValue(v, modeId);
    const hex = figmaColorToHex(resolved);
    if (!hex) continue;
    (groups[ns] ??= []).push({ path: parts.slice(1).map(normPart), value: hex, type: 'color' });
  }
  return groups;
}

// ----- Helpers ---------------------------------------------------------------
function findCollection(name, pred) {
  for (const [id, c] of Object.entries(collections)) {
    if (pred(c, id)) return id;
  }
  return null;
}

function writeCategoryFile(filename, description, groupsOrObject) {
  const body = { $description: description };
  if (Array.isArray(groupsOrObject.entries)) {
    // Shouldn't happen anymore
  }
  for (const [key, entries] of Object.entries(groupsOrObject)) {
    if (!Array.isArray(entries) || entries.length === 0) continue;
    body[key] = nestByPath(entries);
  }
  mkdirSync(SOURCE_DIR, { recursive: true });
  writeFileSync(path.join(SOURCE_DIR, filename), JSON.stringify(body, null, 2) + '\n');
}

// ----- Run -------------------------------------------------------------------
const foundations = collectFoundations();
writeCategoryFile(
  'colors.json',
  'Origon UI — primitive colors (Foundations collection). Generated by scripts/sync-figma.mjs — do not hand-edit.',
  { color: foundations.color },
);
// Restructure font vars into { family, weight } shape. Figma stores only the
// family name; weights are conventional CSS values used by the design system.
const fontBody = { $description: 'Origon UI — typography (Foundations collection + conventional weights).' };
const primaryFontEntry = foundations.font.find((e) => e.path[0] === 'primaryFont');
fontBody.font = {
  family: {
    primary: { $value: primaryFontEntry?.value ?? 'Inter Variable', $type: 'fontFamily' },
  },
  weight: {
    regular: { $value: 400, $type: 'fontWeight' },
    medium:  { $value: 500, $type: 'fontWeight' },
    bold:    { $value: 700, $type: 'fontWeight' },
  },
};
if (foundations.text.length > 0) fontBody.text = nestByPath(foundations.text);
writeFileSync(path.join(SOURCE_DIR, 'typography.json'), JSON.stringify(fontBody, null, 2) + '\n');
writeCategoryFile(
  'sizes.json',
  'Origon UI — size tokens (icon sizes, control heights) from the Foundations collection.',
  { size: foundations.size },
);

// The Themes collection's `color.button/text/icon/border` etc. are the actual
// semantic color layer. Move them under `semantic.*` so consumers can reference
// `semantic.button.primary` etc.
const SEMANTIC_GROUPS_FROM_THEMES = new Set(['button', 'text', 'icon', 'border', 'level', 'status']);
for (const modeName of ['Dark', 'Light']) {
  const themed = collectThemes(modeName);
  // Split themed.color into semantic.* (button/text/icon/border/level/status)
  // and leftovers (which stay as color.* in theme file).
  const semanticGroups = {};
  const leftovers = [];
  for (const entry of themed.color ?? []) {
    const [firstPart] = entry.path;
    if (SEMANTIC_GROUPS_FROM_THEMES.has(firstPart)) {
      (semanticGroups[firstPart] ??= []).push({ ...entry, path: entry.path.slice(1) });
    } else {
      leftovers.push(entry);
    }
  }
  themed.color = leftovers;
  const body = {
    $description: `Origon UI — themed dimensions + semantic colors resolved in ${modeName} mode. Consumers should reference semantic.* colors, not primitives.`,
  };
  for (const [key, entries] of Object.entries(themed)) {
    if (!entries.length) continue;
    body[key] = nestByPath(entries);
  }
  if (Object.keys(semanticGroups).length) {
    body.semantic = {};
    for (const [group, entries] of Object.entries(semanticGroups)) {
      body.semantic[group] = nestByPath(entries);
    }
  }
  writeFileSync(path.join(SOURCE_DIR, `theme.${modeName.toLowerCase()}.json`), JSON.stringify(body, null, 2) + '\n');
}

for (const brand of ['Kripto', 'Hisse', 'Global']) {
  for (const theme of ['Dark', 'Light']) {
    const modeName = `${brand} ${theme}`;
    const sem = collectSemantic(modeName);
    if (!sem) continue;
    // Wrap groups under a single `semantic` root so build.config.mjs finds them.
    const body = { $description: `Origon UI — semantic color tokens (${modeName}). Product code should reference these, not primitives.`, semantic: {} };
    for (const [k, entries] of Object.entries(sem)) {
      if (entries.length > 0) body.semantic[k] = nestByPath(entries);
    }
    writeFileSync(path.join(SOURCE_DIR, `semantic.${brand.toLowerCase()}-${theme.toLowerCase()}.json`), JSON.stringify(body, null, 2) + '\n');
  }
}

// Delete legacy files that are replaced.
for (const legacy of ['spacing.json', 'radius.json', 'semantic.json']) {
  const p = path.join(SOURCE_DIR, legacy);
  if (existsSync(p)) rmSync(p);
}

// Report.
const written = readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.json'));
console.log(`Wrote ${written.length} source files to tokens/source/:`);
for (const f of written) console.log('  ' + f);

#!/usr/bin/env node
// scripts/export-icons.mjs
//
// Fetches every "Essentials" component from the Figma - Icons + Logos page,
// downloads its SVG, minifies it, and emits per-icon React components +
// updated IconName union.
//
// Usage: FIGMA_TOKEN=figd_... node scripts/export-icons.mjs [--group=Essentials]
//
// Notes:
// - Only single-color line icons are safe to import as `currentColor` React
//   components. Multi-fill logos (bank/crypto brands) should ship as raster/
//   SVG assets — that's a separate pipeline.
// - Runs are idempotent — regenerating overwrites the generated/ dir.

import { writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const OUT_DIR = path.join(ROOT, 'packages/react/src/Icon/generated');
const FILE_KEY = '57b5pxiONTgoI4w4fvaNbA';
const ICONS_PAGE = '12:73747';
// Accept --group=Foo (single) or --groups=Foo,Bar,Baz (many). Backward-compatible.
const singleGroup = process.argv.find((a) => a.startsWith('--group='))?.slice(8);
const manyGroups = process.argv.find((a) => a.startsWith('--groups='))?.slice(9);
const GROUPS = manyGroups
  ? manyGroups.split(',').map((s) => s.trim()).filter(Boolean)
  : [singleGroup ?? 'Essentials'];
const BATCH = 50;

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error('FIGMA_TOKEN is not set.');
  process.exit(1);
}

// -----------------------------------------------------------------------------
// 1. Enumerate components on the target group.
// -----------------------------------------------------------------------------
console.log(`Fetching Icons page structure…`);
const pageRes = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${ICONS_PAGE}&depth=6`,
  { headers: { 'X-Figma-Token': token } },
);
const pageData = await pageRes.json();
const root = pageData.nodes[ICONS_PAGE]?.document;
if (!root) {
  console.error('Icons page not found.');
  process.exit(1);
}

// Descend to the requested group's container. Accept any node type (except
// COMPONENT itself, which shouldn't nest components with a group's name).
function findGroup(node, name) {
  if (node.name === name && node.type !== 'COMPONENT') return node;
  for (const c of node.children ?? []) {
    const r = findGroup(c, name);
    if (r) return r;
  }
  return null;
}

// Collect all COMPONENT nodes across every requested group.
const components = [];
const found = [];
const missing = [];
for (const groupName of GROUPS) {
  const group = findGroup(root, groupName);
  if (!group) {
    missing.push(groupName);
    continue;
  }
  found.push(groupName);
  function collect(node) {
    if (node.type === 'COMPONENT') components.push({ ...node, __sourceGroup: groupName });
    for (const c of node.children ?? []) collect(c);
  }
  collect(group);
}
if (missing.length) console.warn(`Skipped missing groups: ${missing.join(', ')}`);
console.log(`Found ${components.length} components across groups: ${found.join(', ')}.`);

// -----------------------------------------------------------------------------
// 2. Normalize names into safe identifiers. Strip Figma naming prefixes
// like "Assets/Icons/20px/System/…" and camelCase the trailing segment.
// -----------------------------------------------------------------------------
function toIconName(figmaName) {
  const last = figmaName.split('/').pop() ?? figmaName;
  const words = last.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
  const name = words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
  return /^[a-zA-Z]/.test(name) ? name : `icon${name}`;
}

const named = new Map();  // iconName -> figma node
const usedLower = new Set();  // case-insensitive collision check for macOS
for (const c of components) {
  let n = toIconName(c.name);
  // De-dupe using case-insensitive comparison since some filesystems (macOS
  // APFS default, Windows) treat filenames as case-insensitive.
  let unique = n;
  let i = 2;
  while (usedLower.has(unique.toLowerCase())) unique = `${n}${i++}`;
  named.set(unique, c);
  usedLower.add(unique.toLowerCase());
}

// -----------------------------------------------------------------------------
// 3. Batch fetch SVG image URLs.
// -----------------------------------------------------------------------------
const ids = [...named.values()].map((c) => c.id);
console.log(`Fetching SVG URLs (${ids.length} ids, ${Math.ceil(ids.length / BATCH)} batches)…`);
const urlsById = {};
for (let i = 0; i < ids.length; i += BATCH) {
  const chunk = ids.slice(i, i + BATCH);
  const r = await fetch(
    `https://api.figma.com/v1/images/${FILE_KEY}?ids=${chunk.join(',')}&format=svg`,
    { headers: { 'X-Figma-Token': token } },
  );
  const d = await r.json();
  Object.assign(urlsById, d.images ?? {});
  process.stdout.write('.');
}
console.log('');

// -----------------------------------------------------------------------------
// 4. Download SVGs.
// -----------------------------------------------------------------------------
console.log('Downloading SVGs…');
const svgByName = {};
let idx = 0;
for (const [name, c] of named) {
  const url = urlsById[c.id];
  if (!url) { console.warn(`  skipping ${name}: no URL`); continue; }
  const res = await fetch(url);
  const svg = await res.text();
  svgByName[name] = svg;
  if (++idx % 20 === 0) process.stdout.write('.');
}
console.log('');

// -----------------------------------------------------------------------------
// 5. Normalize SVGs: strip <?xml declarations, extract inner content, replace
// any hardcoded fill/stroke with currentColor where sensible.
// -----------------------------------------------------------------------------
function svgInner(svg) {
  const start = svg.indexOf('>', svg.indexOf('<svg')) + 1;
  const end = svg.lastIndexOf('</svg>');
  let inner = svg.slice(start, end);

  // Force currentColor for solid single-tone fills.
  inner = inner.replace(/fill="#[0-9a-fA-F]{6,8}"/g, 'fill="currentColor"');
  inner = inner.replace(/stroke="#[0-9a-fA-F]{6,8}"/g, 'stroke="currentColor"');

  // Drop inline style attrs entirely — they're rare in Figma SVGs and would
  // otherwise need JSX-object conversion. If you need per-icon styles, add
  // them post-generation.
  inner = inner.replace(/\s+style="[^"]*"/g, '');

  // Convert kebab-case SVG attributes to camelCase for React.
  const attrMap = {
    'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
    'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset', 'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-opacity': 'strokeOpacity', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'clip-path': 'clipPath',
    'fill-opacity': 'fillOpacity', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity',
    'text-anchor': 'textAnchor', 'font-size': 'fontSize', 'font-family': 'fontFamily', 'font-weight': 'fontWeight',
    'font-style': 'fontStyle', 'vector-effect': 'vectorEffect', 'shape-rendering': 'shapeRendering',
    'color-interpolation-filters': 'colorInterpolationFilters', 'flood-color': 'floodColor', 'flood-opacity': 'floodOpacity',
    'gradientUnits': 'gradientUnits', 'gradientTransform': 'gradientTransform', 'patternUnits': 'patternUnits',
    'patternContentUnits': 'patternContentUnits', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace',
    'class': 'className',
  };
  for (const [from, to] of Object.entries(attrMap)) {
    inner = inner.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=`, 'g'), `${to}=`);
  }

  // Strip xmlns declarations on inner elements (only the outer <svg> needs one, which we set below).
  inner = inner.replace(/\s+xmlns(:xlink)?="[^"]*"/g, '');

  return inner.trim();
}
function svgViewBox(svg) {
  const m = svg.match(/viewBox="([^"]+)"/);
  return m ? m[1] : '0 0 24 24';
}

// -----------------------------------------------------------------------------
// 6. Emit output files.
// -----------------------------------------------------------------------------
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const BANNER = `// GENERATED by scripts/export-icons.mjs. Do not edit by hand.\n// Regenerate with: FIGMA_TOKEN=... node scripts/export-icons.mjs\n`;

const iconExports = [];
for (const [name, svg] of Object.entries(svgByName)) {
  const viewBox = svgViewBox(svg);
  const inner = svgInner(svg);
  const componentName = name.charAt(0).toUpperCase() + name.slice(1) + 'Icon';
  const body = `${BANNER}
import React, { type SVGAttributes } from 'react';

export function ${componentName}({ size = 20, style, ...rest }: { size?: number } & SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="${viewBox}"
      width={size}
      height={size}
      fill="none"
      style={{ display: 'inline-block', flex: '0 0 auto', ...style }}
      aria-hidden
      {...rest}
    >
      ${inner}
    </svg>
  );
}
`;
  writeFileSync(path.join(OUT_DIR, `${componentName}.tsx`), body);
  iconExports.push({ name, componentName });
}

// Index — named exports + a lookup map (all statically imported for ESM
// compatibility and tree-shakability).
const indexBody = `${BANNER}
${iconExports.map(({ componentName }) => `import { ${componentName} } from './${componentName}';`).join('\n')}

${iconExports.map(({ componentName }) => `export { ${componentName} };`).join('\n')}

export const ICON_COMPONENT_MAP = {
${iconExports.map(({ name, componentName }) => `  '${name}': ${componentName},`).join('\n')}
} as const;

export type GeneratedIconName = keyof typeof ICON_COMPONENT_MAP;

export const GENERATED_ICON_NAMES: GeneratedIconName[] = Object.keys(ICON_COMPONENT_MAP) as GeneratedIconName[];
`;
writeFileSync(path.join(OUT_DIR, 'index.ts'), indexBody);

console.log(`\n✓ Wrote ${iconExports.length} icon components to ${path.relative(ROOT, OUT_DIR)}`);
console.log(`  Import via:  import { ${iconExports[0]?.componentName ?? '…'}Icon } from '@origon/react/icons';`);

// -----------------------------------------------------------------------------
// 7. Flutter + Swift emit — write raw SVG files + native wrapper widgets.
// -----------------------------------------------------------------------------
function svgWithCurrentColor(svg) {
  return svg
    .replace(/fill="#[0-9a-fA-F]{6,8}"/g, 'fill="currentColor"')
    .replace(/stroke="#[0-9a-fA-F]{6,8}"/g, 'stroke="currentColor"');
}
function dartId(s) { return /^[a-zA-Z_]/.test(s) ? s : `d${s}`; }
function swiftId(s) { return /^[a-zA-Z_]/.test(s) ? s : `d${s}`; }

// --- Flutter ---
const FLUTTER_SVG_DIR = path.join(ROOT, 'packages/tokens-flutter/lib/generated/icons');
if (existsSync(FLUTTER_SVG_DIR)) rmSync(FLUTTER_SVG_DIR, { recursive: true });
mkdirSync(FLUTTER_SVG_DIR, { recursive: true });
for (const [name, svg] of Object.entries(svgByName)) {
  writeFileSync(path.join(FLUTTER_SVG_DIR, `${name}.svg`), svgWithCurrentColor(svg));
}

const dartLines = [
  BANNER.replace(/^\/\//gm, '//'),
  "import 'package:flutter/widgets.dart';",
  "import 'package:flutter_svg/flutter_svg.dart';",
  '',
  '/// Origon UI full icon set — SVG assets rendered via flutter_svg.',
  '/// Add the flutter_svg dependency and register the asset directory in',
  '/// your app pubspec:',
  '///',
  '///   flutter:',
  '///     assets:',
  '///       - packages/origon_tokens/generated/icons/',
  '',
  'enum OrigonIconFull {',
];
for (const { name } of iconExports) dartLines.push(`  ${dartId(name)},`);
dartLines.push('}');
dartLines.push('');
dartLines.push('const Map<OrigonIconFull, String> _origonIconAssetNames = {');
for (const { name } of iconExports) dartLines.push(`  OrigonIconFull.${dartId(name)}: '${name}',`);
dartLines.push('};');
dartLines.push('');
dartLines.push('extension OrigonIconFullAsset on OrigonIconFull {');
dartLines.push("  String get assetPath => 'packages/origon_tokens/generated/icons/${_origonIconAssetNames[this]}.svg';");
dartLines.push('}');
dartLines.push('');
dartLines.push('class OrigonSvgIcon extends StatelessWidget {');
dartLines.push('  final OrigonIconFull name;');
dartLines.push('  final double size;');
dartLines.push('  final Color? color;');
dartLines.push('  const OrigonSvgIcon({super.key, required this.name, this.size = 20, this.color});');
dartLines.push('');
dartLines.push('  @override');
dartLines.push('  Widget build(BuildContext context) => SvgPicture.asset(');
dartLines.push('    name.assetPath,');
dartLines.push('    width: size,');
dartLines.push('    height: size,');
dartLines.push('    colorFilter: color != null ? ColorFilter.mode(color!, BlendMode.srcIn) : null,');
dartLines.push('  );');
dartLines.push('}');
dartLines.push('');
writeFileSync(path.join(ROOT, 'packages/tokens-flutter/lib/generated/origon_svg_icons.dart'), dartLines.join('\n'));
console.log(`✓ Wrote ${iconExports.length} Flutter SVG assets + origon_svg_icons.dart`);

// --- Swift ---
const SWIFT_SVG_DIR = path.join(ROOT, 'packages/tokens-swift/Sources/OrigonTokens/Resources/Icons');
if (existsSync(SWIFT_SVG_DIR)) rmSync(SWIFT_SVG_DIR, { recursive: true });
mkdirSync(SWIFT_SVG_DIR, { recursive: true });
for (const [name, svg] of Object.entries(svgByName)) {
  writeFileSync(path.join(SWIFT_SVG_DIR, `${name}.svg`), svgWithCurrentColor(svg));
}

const swiftLines = [
  BANNER,
  'import SwiftUI',
  '',
  '/// Origon UI full icon set — SVG assets rendered via `Image(_:bundle:)`.',
  '/// Requires iOS 17+ / macOS 14+ for built-in SVG rendering; for older',
  '/// platforms, wrap with SVGKit or SVGView.',
  '',
  'public enum OrigonSvgIconName: String, CaseIterable {',
];
for (const { name } of iconExports) swiftLines.push(`    case ${swiftId(name)} = "${name}"`);
swiftLines.push('}');
swiftLines.push('');
swiftLines.push('public struct OrigonSvgIcon: View {');
swiftLines.push('    let name: OrigonSvgIconName');
swiftLines.push('    let size: CGFloat');
swiftLines.push('    let tint: Color?');
swiftLines.push('');
swiftLines.push('    public init(_ name: OrigonSvgIconName, size: CGFloat = 20, tint: Color? = nil) {');
swiftLines.push('        self.name = name; self.size = size; self.tint = tint');
swiftLines.push('    }');
swiftLines.push('');
swiftLines.push('    public var body: some View {');
swiftLines.push('        let img = Image(name.rawValue, bundle: .module)');
swiftLines.push('            .renderingMode(.template)');
swiftLines.push('            .resizable()');
swiftLines.push('            .aspectRatio(contentMode: .fit)');
swiftLines.push('            .frame(width: size, height: size)');
swiftLines.push('        if let tint = tint {');
swiftLines.push('            return AnyView(img.foregroundColor(tint))');
swiftLines.push('        }');
swiftLines.push('        return AnyView(img)');
swiftLines.push('    }');
swiftLines.push('}');
swiftLines.push('');
writeFileSync(path.join(ROOT, 'packages/tokens-swift/Sources/OrigonTokens/generated/OrigonSvgIcon.swift'), swiftLines.join('\n'));
console.log(`✓ Wrote ${iconExports.length} Swift SVG assets + OrigonSvgIcon.swift`);

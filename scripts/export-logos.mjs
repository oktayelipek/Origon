#!/usr/bin/env node
// scripts/export-logos.mjs
//
// Sibling of export-icons.mjs that preserves original fills — meant for
// multi-color brand marks (banks, crypto platforms, payment cards).
// Emits per-logo React components + a name-keyed lookup map to
// packages/react/src/Logo/generated/.
//
// Usage: FIGMA_TOKEN=… node scripts/export-logos.mjs [--groups=A,B,C]

import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(__dirname);
const OUT_DIR = path.join(ROOT, 'packages/react/src/Logo/generated');
const FILE_KEY = '57b5pxiONTgoI4w4fvaNbA';
const ICONS_PAGE = '12:73747';
const BATCH = 50;

const manyGroups = process.argv.find((a) => a.startsWith('--groups='))?.slice(9);
const GROUPS = manyGroups
  ? manyGroups.split(',').map((s) => s.trim()).filter(Boolean)
  : ['Banks & Donation', 'Logos', 'Logo Symbol [Dynamic]', 'Logo Symbol [Square]'];

const token = process.env.FIGMA_TOKEN;
if (!token) { console.error('FIGMA_TOKEN is not set.'); process.exit(1); }

console.log('Fetching Icons page structure…');
const pageRes = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${ICONS_PAGE}&depth=6`,
  { headers: { 'X-Figma-Token': token } },
);
const pageData = await pageRes.json();
const root = pageData.nodes[ICONS_PAGE]?.document;

function findGroup(node, name) {
  if (node.name === name && node.type !== 'COMPONENT') return node;
  for (const c of node.children ?? []) {
    const r = findGroup(c, name);
    if (r) return r;
  }
  return null;
}

const components = [];
const found = [];
const missing = [];
for (const groupName of GROUPS) {
  const group = findGroup(root, groupName);
  if (!group) { missing.push(groupName); continue; }
  found.push(groupName);
  function collect(node) {
    if (node.type === 'COMPONENT') components.push({ ...node, __sourceGroup: groupName });
    for (const c of node.children ?? []) collect(c);
  }
  collect(group);
}
if (missing.length) console.warn(`Skipped missing groups: ${missing.join(', ')}`);
console.log(`Found ${components.length} logo components across: ${found.join(', ')}.`);

function toLogoName(figmaName) {
  // Figma names like "Assets/Logo/Banks/Dark/Paycell" — take the last segment
  // and any brand/variant modifier from the second-to-last for de-dup.
  const parts = figmaName.split('/');
  const last = parts[parts.length - 1] ?? figmaName;
  const parent = parts[parts.length - 2] ?? '';
  const combined = (parent && /^(dark|light)$/i.test(parent))
    ? `${last} ${parent}`
    : last;
  const words = combined.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
  const name = words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
  return /^[a-zA-Z]/.test(name) ? name : `logo${name}`;
}

const named = new Map();
const usedLower = new Set();
for (const c of components) {
  let n = toLogoName(c.name);
  let unique = n;
  let i = 2;
  while (usedLower.has(unique.toLowerCase())) unique = `${n}${i++}`;
  named.set(unique, c);
  usedLower.add(unique.toLowerCase());
}

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

console.log('Downloading SVGs…');
const svgByName = {};
let idx = 0;
for (const [name, c] of named) {
  const url = urlsById[c.id];
  if (!url) continue;
  const res = await fetch(url);
  const svg = await res.text();
  svgByName[name] = svg;
  if (++idx % 20 === 0) process.stdout.write('.');
}
console.log('');

// Preserve fills (this is the key difference from icons). Still convert
// kebab-case attributes to camelCase for JSX and strip inline style="…".
function svgInner(svg) {
  const start = svg.indexOf('>', svg.indexOf('<svg')) + 1;
  const end = svg.lastIndexOf('</svg>');
  let inner = svg.slice(start, end);
  inner = inner.replace(/\s+style="[^"]*"/g, '');
  const attrMap = {
    'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
    'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset', 'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-opacity': 'strokeOpacity', 'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'clip-path': 'clipPath',
    'fill-opacity': 'fillOpacity', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity',
    'text-anchor': 'textAnchor', 'font-size': 'fontSize', 'font-family': 'fontFamily', 'font-weight': 'fontWeight',
    'font-style': 'fontStyle', 'vector-effect': 'vectorEffect', 'shape-rendering': 'shapeRendering',
    'color-interpolation-filters': 'colorInterpolationFilters', 'flood-color': 'floodColor', 'flood-opacity': 'floodOpacity',
    'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace', 'class': 'className',
  };
  for (const [from, to] of Object.entries(attrMap)) {
    inner = inner.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=`, 'g'), `${to}=`);
  }
  inner = inner.replace(/\s+xmlns(:xlink)?="[^"]*"/g, '');
  return inner.trim();
}
function svgViewBox(svg) {
  const m = svg.match(/viewBox="([^"]+)"/);
  return m ? m[1] : '0 0 24 24';
}

if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const BANNER = `// GENERATED by scripts/export-logos.mjs. Do not edit by hand.\n// Regenerate with: FIGMA_TOKEN=... node scripts/export-logos.mjs\n`;

const logoExports = [];
for (const [name, svg] of Object.entries(svgByName)) {
  const viewBox = svgViewBox(svg);
  const inner = svgInner(svg);
  const componentName = name.charAt(0).toUpperCase() + name.slice(1) + 'Logo';
  const body = `${BANNER}
import React, { type SVGAttributes } from 'react';

export function ${componentName}({ height = 24, style, ...rest }: { height?: number } & SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="${viewBox}"
      height={height}
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
  logoExports.push({ name, componentName });
}

const indexBody = `${BANNER}
${logoExports.map(({ componentName }) => `import { ${componentName} } from './${componentName}';`).join('\n')}

${logoExports.map(({ componentName }) => `export { ${componentName} };`).join('\n')}

export const LOGO_COMPONENT_MAP = {
${logoExports.map(({ name, componentName }) => `  '${name}': ${componentName},`).join('\n')}
} as const;

export type LogoName = keyof typeof LOGO_COMPONENT_MAP;
export const LOGO_NAMES: LogoName[] = Object.keys(LOGO_COMPONENT_MAP) as LogoName[];
`;
writeFileSync(path.join(OUT_DIR, 'index.ts'), indexBody);

console.log(`\n✓ Wrote ${logoExports.length} logo components to ${path.relative(ROOT, OUT_DIR)}`);

// -----------------------------------------------------------------------------
// Flutter + Swift emit — preserve original fills.
// -----------------------------------------------------------------------------
const DART_RESERVED = new Set(['abstract','as','assert','async','await','break','case','catch','class','const','continue','covariant','default','deferred','do','dynamic','else','enum','export','extends','extension','external','factory','false','final','finally','for','function','get','hide','if','implements','import','in','interface','is','late','library','mixin','new','null','of','on','operator','part','required','rethrow','return','set','show','static','super','switch','sync','this','throw','true','try','typedef','var','void','while','with','yield']);
const SWIFT_RESERVED = new Set(['associatedtype','class','deinit','enum','extension','fileprivate','func','import','init','inout','internal','let','open','operator','private','protocol','public','static','struct','subscript','typealias','var','break','case','continue','default','defer','do','else','fallthrough','for','guard','if','in','repeat','return','switch','where','while','as','Any','catch','false','is','nil','rethrows','super','self','Self','throw','throws','true','try','associativity','convenience','dynamic','didSet','final','get','infix','indirect','lazy','left','mutating','none','nonmutating','optional','override','postfix','precedence','prefix','Protocol','required','right','set','Type','unowned','weak','willSet']);
function dartId(s) { const n = /^[a-zA-Z_]/.test(s) ? s : `d${s}`; return DART_RESERVED.has(n) ? `${n}_` : n; }
function swiftId(s) { const n = /^[a-zA-Z_]/.test(s) ? s : `d${s}`; return SWIFT_RESERVED.has(n) ? `\`${n}\`` : n; }

const FLUTTER_SVG_DIR = path.join(ROOT, 'packages/tokens-flutter/lib/generated/logos');
if (existsSync(FLUTTER_SVG_DIR)) rmSync(FLUTTER_SVG_DIR, { recursive: true });
mkdirSync(FLUTTER_SVG_DIR, { recursive: true });
for (const [name, svg] of Object.entries(svgByName)) {
  writeFileSync(path.join(FLUTTER_SVG_DIR, `${name}.svg`), svg);
}

const dartLines = [
  BANNER.replace(/^\/\//gm, '//'),
  "import 'package:flutter/widgets.dart';",
  "import 'package:flutter_svg/flutter_svg.dart';",
  '',
  '/// Origon UI brand logos — multi-color SVG assets rendered via flutter_svg.',
  '/// Fills are preserved (do not recolor).',
  '',
  'enum OrigonLogoName {',
];
for (const { name } of logoExports) dartLines.push(`  ${dartId(name)},`);
dartLines.push('}');
dartLines.push('');
dartLines.push('const Map<OrigonLogoName, String> _origonLogoAssetNames = {');
for (const { name } of logoExports) dartLines.push(`  OrigonLogoName.${dartId(name)}: '${name}',`);
dartLines.push('};');
dartLines.push('');
dartLines.push('extension OrigonLogoAsset on OrigonLogoName {');
dartLines.push("  String get assetPath => 'packages/origon_tokens/generated/logos/\${_origonLogoAssetNames[this]}.svg';");
dartLines.push('}');
dartLines.push('');
dartLines.push('class OrigonLogo extends StatelessWidget {');
dartLines.push('  final OrigonLogoName name;');
dartLines.push('  final double height;');
dartLines.push('  const OrigonLogo({super.key, required this.name, this.height = 24});');
dartLines.push('');
dartLines.push('  @override');
dartLines.push('  Widget build(BuildContext context) => SvgPicture.asset(');
dartLines.push('    name.assetPath,');
dartLines.push('    height: height,');
dartLines.push('    fit: BoxFit.contain,');
dartLines.push('  );');
dartLines.push('}');
dartLines.push('');
writeFileSync(path.join(ROOT, 'packages/tokens-flutter/lib/generated/origon_logos.dart'), dartLines.join('\n'));
console.log(`✓ Wrote ${logoExports.length} Flutter logo SVG assets + origon_logos.dart`);

const SWIFT_SVG_DIR = path.join(ROOT, 'packages/tokens-swift/Sources/OrigonTokens/Resources/Logos');
if (existsSync(SWIFT_SVG_DIR)) rmSync(SWIFT_SVG_DIR, { recursive: true });
mkdirSync(SWIFT_SVG_DIR, { recursive: true });
for (const [name, svg] of Object.entries(svgByName)) {
  writeFileSync(path.join(SWIFT_SVG_DIR, `${name}.svg`), svg);
}

const swiftLines = [
  BANNER,
  'import SwiftUI',
  '',
  '/// Origon UI brand logos — multi-color SVG assets rendered via Image.',
  '/// Fills preserved. iOS 17+ / macOS 14+ for built-in SVG rendering.',
  '',
  'public enum OrigonLogoName: String, CaseIterable {',
];
for (const { name } of logoExports) swiftLines.push(`    case ${swiftId(name)} = "${name}"`);
swiftLines.push('}');
swiftLines.push('');
swiftLines.push('public struct OrigonLogo: View {');
swiftLines.push('    let name: OrigonLogoName');
swiftLines.push('    let height: CGFloat');
swiftLines.push('');
swiftLines.push('    public init(_ name: OrigonLogoName, height: CGFloat = 24) {');
swiftLines.push('        self.name = name; self.height = height');
swiftLines.push('    }');
swiftLines.push('');
swiftLines.push('    public var body: some View {');
swiftLines.push('        Image(name.rawValue, bundle: .module)');
swiftLines.push('            .resizable()');
swiftLines.push('            .aspectRatio(contentMode: .fit)');
swiftLines.push('            .frame(height: height)');
swiftLines.push('    }');
swiftLines.push('}');
swiftLines.push('');
writeFileSync(path.join(ROOT, 'packages/tokens-swift/Sources/OrigonTokens/generated/OrigonLogo.swift'), swiftLines.join('\n'));
console.log(`✓ Wrote ${logoExports.length} Swift logo SVG assets + OrigonLogo.swift`);

# Origon UI

Cross-platform design system for BtcTurk products. One source of truth in Figma
maps to three implementations: **React (TypeScript)**, **Flutter (Dart)**, and
**SwiftUI (Swift)**. A single **Nextra guide** documents all three side-by-side.

## Repo layout

```
compo/
├── tokens/
│   ├── source/          # DTCG JSON — the source of truth for tokens
│   └── build.config.mjs # Generator: source → per-platform outputs
├── packages/
│   ├── tokens-react/    # Generated TS constants + CSS variables
│   ├── tokens-flutter/  # Generated Dart classes
│   └── tokens-swift/    # Generated Swift enum (SwiftPM package)
├── apps/
│   └── docs/            # Nextra guide — the single documentation surface
├── scripts/
│   └── sync-figma.mjs   # Pulls token values from Figma (stub v1)
├── package.json         # pnpm + Turborepo root
└── pnpm-workspace.yaml
```

## Quickstart

```bash
# Node 20+ required (see .nvmrc)
corepack enable
pnpm install

# Regenerate token outputs from tokens/source/*.json
pnpm build:tokens

# Run the docs site
pnpm --filter @origon/docs dev
# → http://localhost:3000
```

## Token pipeline

`tokens/source/*.json` is the single source of truth. Running
`pnpm build:tokens` regenerates:

| Output | Path |
| --- | --- |
| React TS | `packages/tokens-react/src/generated/colors.ts` |
| CSS vars | `packages/tokens-react/src/generated/colors.css` |
| Flutter  | `packages/tokens-flutter/lib/generated/origon_colors.dart` |
| Swift    | `packages/tokens-swift/Sources/OrigonTokens/generated/OrigonColors.swift` |

Generated files are gitignored — always regenerate them, never hand-edit.

## Guide

The guide (`apps/docs`) is a Nextra site. Every foundation and component page
follows the same shape:

- Design intent (Figma screenshot + rationale)
- Live React preview (using `@origon/tokens-react` and the components package)
- Code tabs for React / Flutter / Swift
- Props / API table
- A11y notes
- Do / don't

## Roadmap (v1)

- [x] Repo scaffold (pnpm workspaces + Turborepo)
- [x] Token pipeline (colors — 172 tokens, 3 platforms)
- [x] Nextra scaffold + `Foundations → Colors` page
- [ ] Typography, Spacing, Radius tokens
- [ ] Semantic color layer (from Figma "Semantic Colors" page)
- [ ] React component library (Button, Input, Checkbox, Chips, Loader)
- [ ] Flutter component library (widgetbook)
- [ ] Swift component library (SwiftUI Previews)
- [ ] Full Figma → JSON sync (once workspace supports Variables REST API)

## Source of truth

- Figma file: `57b5pxiONTgoI4w4fvaNbA` (Origon UI)
- Colors reference frame: node `207:452`

# Origon UI — Design System Reference

> The complete design, architecture, and component specification for **Origon UI** — BtcTurk's cross-platform design system for React, Flutter, and SwiftUI.
>
> This document is the canonical, long-form reference. Component pages (`/components/*`) show live previews; foundation pages (`/foundations/*`) show tokens; this document explains **why** the system is shaped the way it is, and what every part contributes.

---

## Table of contents

1. [System overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Token pipeline](#3-token-pipeline)
4. [Foundations](#4-foundations)
5. [Theming (6 brand × mode variants)](#5-theming-6-brand--mode-variants)
6. [Icons and logos](#6-icons-and-logos)
7. [Cross-platform strategy](#7-cross-platform-strategy)
8. [Component catalog](#8-component-catalog)
9. [Component specifications](#9-component-specifications)
10. [Accessibility](#10-accessibility)
11. [Testing strategy](#11-testing-strategy)
12. [CI, release, and versioning](#12-ci-release-and-versioning)
13. [Contributing](#13-contributing)
14. [Architecture decisions](#14-architecture-decisions)
15. [Roadmap and open questions](#15-roadmap-and-open-questions)

---

## 1. System overview

**Origon UI** is a cross-platform design system serving BtcTurk's product surfaces (Kripto trading, Hisse trading, and a Global product line). It is not a component library — it is a *system* with four layers:

1. **Design source of truth** — Figma file `57b5pxiONTgoI4w4fvaNbA`, containing all primitive and semantic tokens, component variants, and iconography.
2. **Token pipeline** — a Node build (`tokens/build.config.mjs`) that consumes DTCG JSON exported from Figma and emits per-platform token modules.
3. **Component libraries** — one per platform: `@origon/react` (canonical), `packages/flutter` (Dart port), `packages/swift` (SwiftUI port). All three implement the same API sketched by the React canonical.
4. **Documentation** — this Next.js/Nextra site, embedding the React library as live previews and offering cross-platform code snippets for every component.

### Design principles

- **Single source of truth.** Design decisions live in Figma; code is derived. No manually curated colour tables.
- **Three platforms, one API.** Prop names, variants, and sizes match across React, Flutter, and SwiftUI (adjusted only for platform idioms — camelCase vs enum).
- **Runtime theming.** Six brand × theme variants (Kripto/Hisse/Global × Dark/Light) can be switched at runtime on every platform without reloading.
- **A11y non-negotiable.** Every interactive component has a keyboard path, an ARIA role, focus-visible styling, and semantic labels.
- **Fresh clones build.** Generated tokens and SVG assets are committed so a fresh clone can `pnpm build` without a Figma token.

### Non-goals

- No visual regression baseline yet (Storybook only; snapshot pipeline deferred).
- No form validation library (higher level than a component library).
- No animation choreography DSL — components use simple `transition` / `AnimatedContainer` / `withAnimation`.
- No mobile-native navigation shells (routes, tab bars) — this is a *component* library.

### Numbers at a glance

| Metric | Value |
|---|---|
| Design tokens | 527 |
| Components | 33 |
| Icons | 598 (single-color, `currentColor`) |
| Brand logos | 236 (multi-color SVG) |
| Brand × theme modes | 6 |
| Platforms | 3 |
| Unit tests | ~110 (96 React + 10 Flutter + 6 Swift tokens) |

---

## 2. Architecture

```
compo/                                    # pnpm workspaces + Turborepo
├── tokens/
│   ├── source/                           # DTCG JSON — Figma-synced source of truth
│   │   ├── colors.json                   # primitive palette
│   │   ├── typography.json               # font, weight, text scales
│   │   ├── sizes.json                    # radius, spacing, size, height, width, blur, shadow
│   │   ├── theme.dark.json / .light.json # per-mode primitives
│   │   └── semantic.{brand}-{mode}.json  # 6 files, semantic aliases
│   └── build.config.mjs                  # 3-platform emitter
│
├── packages/
│   ├── tokens-react/                     # emits: TS constants + CSS variables
│   ├── tokens-flutter/                   # emits: Dart const classes + InheritedWidget
│   ├── tokens-swift/                     # emits: Swift enums + EnvironmentKey
│   ├── react/                            # canonical component library (33)
│   ├── flutter/                          # Flutter port + widgetbook
│   └── swift/                            # SwiftUI port
│
├── apps/
│   └── docs/                             # Nextra (Next.js + MDX) — this site
│
└── scripts/
    ├── sync-figma.mjs                    # Figma REST → tokens/source/
    ├── export-icons.mjs                  # Figma → 598 icon components + SVG
    └── export-logos.mjs                  # Figma → 236 logo SVGs
```

### Data flow

```
Figma (variables + components)
    │
    │  pnpm sync:figma     (Figma REST API, requires FIGMA_TOKEN)
    ▼
tokens/source/*.json (DTCG)
    │
    │  pnpm build:tokens
    ▼
packages/tokens-{react,flutter,swift}/generated/
    │
    │  imported by
    ▼
packages/{react,flutter,swift}/  ──►  apps/docs/  or  BtcTurk apps
```

The pipeline runs any time Figma tokens change. Assets (icons/logos) go through parallel scripts because SVGs need per-platform packaging (React component vs. Flutter `flutter_svg` asset vs. Swift image resource).

### Repository conventions

- **pnpm workspaces** for package graph.
- **Turborepo** for parallel builds and caching (build, test, lint, storybook).
- **Conventional Commits** for automated release notes.
- **semantic-release** on `main` for changelog + version bumps (see §12).
- Generated code lives in `**/generated/` and is committed. Fresh clones therefore never need a Figma token to build.

---

## 3. Token pipeline

### Input format — DTCG

All token sources use the [Design Tokens Community Group](https://tr.designtokens.org/) shape:

```json
{
  "color": {
    "blueGray": {
      "500": { "$value": "#6b7a99", "$type": "color" }
    }
  }
}
```

Aliases use `{group.subgroup.name}` references, which the pipeline resolves up to 8 levels deep.

### Emit stage

`tokens/build.config.mjs` runs three emitters in one pass:

- **`emitReact`** — writes `packages/tokens-react/src/generated/*.ts` and `.css`:
  - `colors.ts` — nested `as const` object + `Colors` type + `ColorStep` union.
  - `spacing.ts`, `radius.ts`, `sizes.ts`, `width.ts`, `height.ts`, `blur.ts` — flat `as const` maps.
  - `shadow.ts` — composite; each shadow becomes both a struct and a pre-baked CSS `box-shadow` string.
  - `typography.ts` — `font` (family, weight) + `text` (scale-name → `{ fontSize, lineHeight }`). Incomplete Figma entries (only fontSize *or* lineHeight) are dropped.
  - `semantic.ts` — the resolved semantic aliases for the *default* brand/mode.
  - `tokens.css` — every token as a CSS custom property (`--color-blueGray-500: #6b7a99;`).
  - `themes/*.css` — six scoped variant selectors, e.g. `[data-brand="hisse"][data-theme="light"] { … }`. Runtime theme switching is a data-attribute flip.

- **`emitFlutter`** — writes `packages/tokens-flutter/lib/generated/*.dart`:
  - Static `const` classes for each token group: `OrigonColors`, `OrigonSpacing`, `OrigonRadius`, `OrigonShadow`, `OrigonBlur`, `OrigonWidth`, `OrigonHeight`, `OrigonTextStyles`, `OrigonFont`.
  - `OrigonThemes` — a factory producing `OrigonThemeData` records for the 6 modes; consumed by the `OrigonTheme` `InheritedWidget`.

- **`emitSwift`** — writes `packages/tokens-swift/Sources/OrigonTokens/generated/*.swift`:
  - `public enum OrigonColors` / `OrigonSpacing` / etc. with `public static let` fields.
  - `OrigonThemes` with 6 factory functions returning `OrigonThemeData`.
  - `OrigonThemeEnvironment.swift` bridges to SwiftUI `EnvironmentValues`.

### Identifier safety

Both `dartId` and `swiftId` helpers:
- prefix numeric-starting keys with `d` (`3xl` → `d3xl`),
- suffix Dart reserved words with `_` (`new` → `new_`),
- backtick-escape Swift reserved words (`` `true` ``).

This is why several token names end in `_` in Dart output — those are Figma names that collide with keywords.

### Sync

`scripts/sync-figma.mjs`:
1. Fetches all variables via `GET /v1/files/{key}/variables/local`.
2. Resolves aliases against the variable graph up to 8 levels.
3. Splits into 11 output files (colors, typography, sizes, theme.dark/light, semantic × 6).
4. Writes tokens/source/*.json — the DTCG source of truth.

Idempotent: unchanged output produces no diff.

---

## 4. Foundations

### 4.1 Color

The color system has three layers:

1. **Primitives** — literal hex values, e.g. `blueGray[500] = #6b7a99`. 10-step scales (50, 100, … 900) plus base white/black. Never referenced directly in components.
2. **Theme primitives** — per-brand, per-mode extensions in `theme.dark.json`/`theme.light.json` (elevations, backgrounds, status colors).
3. **Semantic aliases** — 6 brand-mode variants of `semantic.*`, structured into groups:
   - `text` (focus, secondary, tertiary, disabled, inverse, error, success)
   - `icon` (focus, secondary, tertiary, inverse, buy, sell, positive, negative)
   - `level` (basement, level1, level2, elevation, page)
   - `border` (level1, level2, focused)
   - `brand` (primary, secondary)
   - `button` (buy, sell — brand-specific meanings)
   - `status` (positive, negative, info, warning)
   - `sectionBg`, `debug`, `dedicated`, `actions`, `inverse`

Consumers always reach for **semantic** tokens (`semantic.text.focus`), never primitives, because primitives don't shift under theme changes but semantics do.

### 4.2 Typography

- **Family**: single primary — `Inter Variable`.
- **Weights**: `regular` (400), `medium` (500), `bold` (700).
- **Scales**: `3xl`, `xxl`, `xl`, `lg`, `md`, `sm`, `xs`, `xxs`. Each with matched `fontSize` and `lineHeight` in px.

### 4.3 Spacing

10-step scale: `xxxs` (2), `xxs` (4), `xs` (6), `sm` (8), `md` (12), `lg` (16), `xl` (20), `xxl` (24), `xxxl` (32), `xxxxl` (40).

Used for gaps, padding, and margin. Layout components accept spacing tokens by name.

### 4.4 Radius

`none` (0), `xs` (2), `sm` (4), `md` (8), `lg` (12), `xl` (16), `xxl` (20), `full` (999).

### 4.5 Shadow / elevation

Composite tokens: `xs`, `sm`, `md`, `lg`, `xl`. Each has offsetX/Y, blur, spread, color. React emits pre-baked `box-shadow` strings; Flutter emits `BoxShadow`; Swift emits an `OrigonShadowSpec` struct consumable by `.shadow(...)`.

### 4.6 Blur

Backdrop-blur dimensions used by `Drawer` scrim and popovers.

### 4.7 Width / height

Fixed component dimensions (e.g., control heights `36`, `44`, `56`) exposed as tokens so buttons and inputs stay in lockstep.

---

## 5. Theming (6 brand × mode variants)

Origon supports **3 brands × 2 modes = 6 concurrent visual identities**:

| | Dark | Light |
|---|---|---|
| **Kripto** | `KriptoDark` | `KriptoLight` |
| **Hisse** | `HisseDark` | `HisseLight` |
| **Global** | `GlobalDark` | `GlobalLight` |

### 5.1 What differs across modes

- Every semantic color group (`text`, `icon`, `level`, `border`, `brand`, `button`, `status`, `sectionBg`).
- `brand.primary` differs across brands (Kripto/Global: `#005fae`, Hisse: `#07ac92`).
- `button.buy` / `button.sell` — semantic direction is the same but hues differ per brand.

### 5.2 What is shared

- All primitive tokens (color scales, radius, spacing, typography, shadow, blur).
- Every non-color property.
- Every component API and behavior.

### 5.3 Runtime switching

**React** — CSS variable strategy. Six themes are emitted as scoped selectors:

```css
[data-brand="kripto"][data-theme="dark"]  { --semantic-text-focus: #f0f4f7; … }
[data-brand="hisse"][data-theme="light"]  { --semantic-text-focus: #101828; … }
```

A tiny `applyTheme({ brand, theme })` helper flips `data-brand` and `data-theme` on `<html>` — no re-render, no context. Components read tokens via CSS variables (`var(--semantic-text-focus)`), so a single DOM attribute flip retints the whole tree instantly.

**Flutter** — `OrigonTheme` `InheritedWidget` wraps the tree, exposing `OrigonThemeData`. Descendants call `OrigonTheme.of(context).semantic.text.focus`. Switching modes replaces the data — Flutter's rebuild is scoped to consumers of the inherited widget.

**SwiftUI** — a custom `EnvironmentKey` (`OrigonThemeEnvironmentKey`) holds an `OrigonThemeData` in `EnvironmentValues`. Views read `@Environment(\.origonTheme) var theme`. Switching modes triggers SwiftUI's own diff.

### 5.4 Choosing a default

Default: **Kripto Dark**. This is set by:
- CSS: no `data-*` attributes → falls through to the default `:root` block.
- Flutter: `OrigonThemes.kriptoDark`.
- SwiftUI: `.origonTheme(.kriptoDark)`.

---

## 6. Icons and logos

Two parallel asset systems reflecting two different rendering contracts.

### 6.1 Icons (598, single-color)

- Source: Figma "Icons" page (`12:73747`).
- Colored via `fill="currentColor"` / `stroke="currentColor"` (per SVG minification pass).
- **React**: one component per icon under `packages/react/src/Icon/generated/*.tsx`, plus a generic `<Icon name="check" size={20} />` wrapper reading from an `IconName` union.
- **Flutter**: SVGs in `packages/tokens-flutter/lib/generated/icons/`, rendered by `flutter_svg`. An `OrigonIcon(OrigonIconFull.check)` widget maps enum → asset path.
- **Swift**: SVGs in `packages/tokens-swift/Sources/OrigonTokens/Resources/Icons/`, packaged via `.process(...)`. `OrigonSvgIcon(.check)` view uses `Image(name:bundle:)` (iOS 17+ native SVG image loading).

Groups: Essentials, Communication, Finance, Time, Chevron, System, Filled, Navigation, Others, Device, Paper, User, Flags, Social, Donations, Media-Engine, Verified Badge.

**Case-insensitive filesystem dedup**: macOS APFS is case-insensitive by default. The exporter uses a `usedLower` Set to detect collisions (`HalkBank` vs `Halkbank`) and disambiguate by appending `Copy2`, `Copy3`.

**SPM collision fix**: 15 icon SVGs shared filenames with logo variants (both derived from Figma "Donations" set). They are renamed with an `icon_` prefix on export to prevent SPM `.process` from rejecting duplicates.

### 6.2 Logos (236, multi-color)

- Source: Figma "Logos" page.
- Fills preserved (multi-color brand marks) — no `currentColor` substitution.
- **React**: `<BrandLogo name="bitcoin" height={22} />` — dynamic import of raw SVG.
- **Flutter**: SVGs under `lib/generated/logos/` with an `OrigonLogo(OrigonLogoName.bitcoin)` widget.
- **Swift**: `Image(name.rawValue, bundle: .module)` from `Resources/Logos/`.

Groups: Banks & Donation, Logos, Logo Symbol [Dynamic/Square].

---

## 7. Cross-platform strategy

### 7.1 Canonical: React

React is the **specification** — every component's API is decided in React first, then ported. Rationale:

1. React is already required (docs site is Next.js).
2. Live previews on the docs site drive early feedback.
3. JSX is the most malleable representation for prototyping states, props, and slots.
4. Type errors surface at build time, so contract violations don't slip into ports.

### 7.2 Porting rules

- **Names are canonical.** `variant="primary"` becomes `OrigonButtonVariant.primary` (Dart) / `.primary` (Swift). Renames go through a decision + all three platforms update in lockstep.
- **Sizes map identically.** `size="small" | "medium" | "large"` (React) ↔ `OrigonButtonSize.small/…` (Dart) ↔ `.small/…` (Swift).
- **Defaults match.** If React's `Button` defaults to `variant="primary" size="medium"`, so must Flutter and Swift.
- **Behaviors match.** Focus rings, disabled semantics, keyboard shortcuts, ARIA roles → equivalent on native platforms (Semantics widget on Flutter, `accessibilityLabel` on SwiftUI).

### 7.3 Component surface parity checklist

For every component, ensure across all three ports:

- [ ] Same public props
- [ ] Same default values
- [ ] Same variant/size enums
- [ ] Same interactive states (hover, active, focus, disabled, loading, error)
- [ ] Same size/spacing tokens consumed
- [ ] Same a11y semantics (role, labels, keyboard)

### 7.4 What is *not* mirrored

- **Idioms.** React uses `onClick`; Flutter uses `onPressed`; SwiftUI uses `.action`. Not a violation.
- **Slots.** React uses `children`; Flutter uses `child`/named parameters; SwiftUI uses `@ViewBuilder`.
- **Refs.** React exposes `forwardRef`; Flutter uses `GlobalKey` sparingly; SwiftUI has no equivalent — port omits.

---

## 8. Component catalog

All 33 v1 components, grouped:

| Group | Components |
|---|---|
| **Actions** | Button, Chip, Filter, SortFilter, Toggle |
| **Inputs** | Input, PhoneInput, PasswordInput, PinInput, MultiLineInput, Checkbox, Radio (+ RadioGroup) |
| **Selection** | Dropdown, SegmentedControl, Tabs, Menu |
| **Feedback** | Loader, Bullet, Gauge, NotificationBadge, Toast (+ Provider), Tooltip, InfoRow |
| **Data** | Chart, Graph, Table, Ticker, RangeSlider, ProgressStepper |
| **Layout** | Row, Drawer |
| **Iconography** | Icon, BrandLogo |
| **Input helpers** | Keyboard (numeric on-screen) |

---

## 9. Component specifications

Each component's canonical (React) API is described below. Cross-platform equivalents preserve names and defaults (§7.2).

### 9.1 Button

The primary action element. Six presence/variant combinations plus size, icon slot, and full-width mode.

**Props** (`ButtonProps`):

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Controls height, padding, text scale. |
| `variant` | `'primary' \| 'outline' \| 'ghost' \| 'buy' \| 'sell'` | `'primary'` | `buy`/`sell` pull `semantic.button.buy` / `.sell`. |
| `presence` | `'active' \| 'disabled' \| 'loading'` | `'active'` | Loading swaps children with `<Loader />`. |
| `icon` | `IconName \| ReactNode` | — | |
| `iconPosition` | `'leading' \| 'trailing'` | `'leading'` | |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | Vertical stacks icon above label (used in mobile toolbars). |
| `fullWidth` | `boolean` | `false` | |
| Native `ButtonHTMLAttributes` | | | `type` defaults to `'button'`. |

**A11y**: rendered as `<button>`, `type="button"`, `aria-busy` when loading, `aria-disabled` when disabled.

### 9.2 Loader

Circular indeterminate spinner. Sizes `small` (16), `medium` (24), `large` (32).

**Props**: `size`, `tone` (`brand` | `neutral` | `inverse`), `label` (SR-only text).

### 9.3 Bullet

Stepper dot indicator. `variant='line' | 'dot'`, `count`, `active` (index). Used in carousels, wizards, and Chart empty-states.

### 9.4 InfoRow

A dismissible tinted banner. Tones: `info`, `success`, `warning`, `danger`. Presence: `default | prominent`. Slots for `leading`, `title`, `children`, `action`.

### 9.5 Chip

Compact selectable pill. `size='xs' | 'sm' | 'md'`, `variant='filled' | 'outline'`, `selected`, `onSelect(value)`. Used for time-frame pickers, filter chips.

### 9.6 Checkbox

Standard checkbox with tri-state (`indeterminate`). Sizes `sm | md`. Label placement `right` (default) or `left`. Focus ring uses `semantic.border.focused`.

### 9.7 Input (family)

**Input** — text field.

| Prop | Type | Default |
|---|---|---|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `state` | `'default' \| 'error' \| 'success' \| 'disabled'` | `'default'` |
| `label` | `string` | — |
| `helper` | `ReactNode` | — |
| `error` | `string` | — |
| `leading` / `trailing` | `ReactNode` | — |

Composed for `PhoneInput` (dial-code selector + national number), `PasswordInput` (mask toggle + strength meter with 4-step scoring), `PinInput` (segmented boxes, configurable length, mask), and `MultiLineInput` (textarea with auto-grow).

### 9.8 Filter / SortFilter

Pill button surfacing a named filter's current value; `onDismiss` shows the × button. `SortFilter` is a preset with a leading sort icon and ascending/descending state.

### 9.9 Drawer

Bottom / side / top / right sheet with backdrop. Traps focus while open, closes on ESC, restores focus on exit.

### 9.10 Dropdown

Combobox — single or multi-select. Options accept `label`, `value`, `leading`, `disabled`. Keyboard: Arrow keys navigate, Enter selects, Escape closes, Home/End jump.

### 9.11 Gauge

Radial progress arc. `value` (0–100), `size`, `tone` (`brand | positive | negative | warning`). Used for volatility, risk scores.

### 9.12 Keyboard

On-screen numeric keypad, `layout='numeric' | 'decimal' | 'pin'`. Backspace and confirm slots; used on mobile web forms where the native keyboard would obscure the field.

### 9.13 Chart

Multi-mode price chart: `kind='line' | 'area' | 'bar' | 'candlestick'`. Accepts `series` (line/area/bar) or `ohlc` (candlestick). Tooltip on hover, optional grid, deterministic colors from tokens.

### 9.14 Graph

Sparkline — a lightweight preview graph, no axes. Takes flat `data: number[]`.

### 9.15 Icon

Renders one of 598 line icons at any size. `<Icon name="check" size={20} color="currentColor" />`.

### 9.16 BrandLogo

Renders one of 236 multi-color brand logos. `<BrandLogo name="bitcoin" height={22} />`.

### 9.17 Radio + RadioGroup

Radio buttons with roving-tabindex group semantics. Group manages `name`, `value`, `onChange`.

### 9.18 Toggle

Two-state switch, sizes `sm | md`, `checked`, `onChange`. Renders as `role="switch"`.

### 9.19 Tabs

Horizontal tabbed navigation with animated indicator. Tabs: `{ id, label, content }[]`. Keyboard: Left/Right, Home/End.

### 9.20 SegmentedControl

Denser tabs — iOS-style segmented picker. `options: SegmentedOption[]`, `value`, `onChange`.

### 9.21 Tooltip

Non-interactive popover on hover / focus. `side='top' | 'right' | 'bottom' | 'left'`. Portal-rendered; announces via `aria-describedby`.

### 9.22 Toast + ToastProvider

Imperative notification. Provider mounts a portal; `useToast().toast({ title, message, tone, duration, action })` from any descendant. Durations 0 (sticky) or ms; `action.label` renders a button.

### 9.23 NotificationBadge

Small numeric or dot badge overlay. `count`, `showZero`, `dot`, `tone`.

### 9.24 Menu

Anchored menu — a Dropdown without a text-input surface. Sections and separators. Keyboard: same as Dropdown.

### 9.25 Row

Multi-slot list row: `leading`, `title`, `subtitle`, `meta`, `metaSubtitle`, `trailing`. Interactive if `onClick` is set (renders `<button>`, hover state).

### 9.26 Ticker

Infinite horizontal marquee for headlines / prices. `items`, `speed`, pause-on-hover.

### 9.27 ProgressStepper

Multi-step progress indicator. `steps: Step[]`, `current`, orientation `horizontal | vertical`.

### 9.28 RangeSlider

Single-thumb or dual-thumb slider. `min`, `max`, `step`, `value`. Keyboard: Arrow keys, Shift for 10× step, Home/End.

### 9.29 Table

Data table. `columns: TableColumn[]` (with `id`, `header`, `cell`, `align`, `width`, `sortable`), `rows`, `onSortChange`. Sticky header optional.

### 9.30 – 9.33

The remaining components (PhoneInput, PasswordInput, PinInput, MultiLineInput) are documented under §9.7 as members of the Input family; SortFilter under §9.8.

---

## 10. Accessibility

Every component ships with:

- **Correct semantics.** Buttons are `<button>`, toggles are `role="switch"`, tabs are `role="tablist" > role="tab"`.
- **Keyboard support.** Every interactive component is reachable and operable without a pointer.
- **Focus-visible.** `:focus-visible` uses `semantic.border.focused` — pointer clicks don't show the ring; keyboard focus does.
- **Screen reader labels.** Icon-only buttons require `aria-label`. Loaders expose `aria-live="polite"`.
- **Color contrast.** All text/background pairs in the 6 modes meet WCAG 2.1 AA (verified per foundation page).

### Testing

Vitest + `@testing-library/react` covers each component's a11y-critical states. Manual audits with axe DevTools per docs page.

---

## 11. Testing strategy

| Layer | Tool | Coverage |
|---|---|---|
| React components | Vitest + RTL | 96 tests across 25 files |
| Flutter widgets | `flutter_test` | 10 tests (button, checkbox, theme) |
| Flutter tokens | `flutter_test` | 4 tests (colors, radius, spacing, shadow) |
| Swift tokens | XCTest | 6 tests (colors, spacing, radius, semantic, themes) |
| Type checking | tsc (strict) | Continuous on every PR |
| Lint | Next lint | Continuous |

### Conventions

- **Interaction over implementation.** Tests use `userEvent`, not `fireEvent`; assertions target roles and accessible names.
- **No mocking of tokens.** Tests import real generated tokens so a token rename fails at CI, not runtime.
- **Real timers for Toast.** `vi.useFakeTimers()` proved brittle; `waitFor` with real timers is stable.

### Known jsdom shims

Applied in `test/setup.ts`:
- `Element.prototype.scrollIntoView` (missing in jsdom).
- `PointerEvent` constructor polyfill (Radix-style components need it).

---

## 12. CI, release, and versioning

### GitHub Actions

Two workflows on push:

- **`CI`** — three parallel jobs:
  - `build-and-test` (ubuntu): pnpm install → build tokens → Vitest → Next build docs.
  - `flutter` (ubuntu): pub get → analyze → flutter test (tokens + UI).
  - `swift` (macos-14): swift build → swift test on tokens package. UI package is `continue-on-error: true` while the port stabilizes.

- **`Release`** — semantic-release on `main`:
  - Reads Conventional Commits.
  - `feat:` → minor bump, `fix|perf|refactor:` → patch, `docs|test|chore:` → no bump.
  - Publishes `CHANGELOG.md` and a git tag.
  - `[skip ci]` guard on release commits prevents CI loops.
  - `concurrency` group prevents overlapping releases.

### Deployment

- **Docs site** — Vercel from `main`, monorepo build via `vercel.json`.
- **Component libraries** — not yet published to registries; consumed via workspace links or path in v1.

---

## 13. Contributing

See `CONTRIBUTING.md` for the setup ceremony. High-level workflow:

1. **Design first.** New component or variant → discuss in Figma → export via `pnpm sync:figma`.
2. **React first.** Implement in `packages/react`; add a story and tests.
3. **Then ports.** Mirror the API to Flutter and Swift with identical props/defaults.
4. **Docs.** Add a page under `apps/docs/pages/components/{name}.mdx` with live preview + cross-platform tabs.
5. **Conventional commit.** `feat(button): add trailing icon slot`.
6. **PR.** CI must be green (Node + Flutter jobs; Swift UI is advisory).

### Extending tokens

- Add or edit the Figma variable.
- Run `pnpm sync:figma` locally with `FIGMA_TOKEN`.
- Commit the diff under `tokens/source/`.
- Run `pnpm build:tokens` and commit the regenerated `packages/tokens-*/generated/`.

### Adding an icon

- Add the Component to the Figma "Icons" page under the right group.
- Run `pnpm sync:icons` with `FIGMA_TOKEN`.
- Commit the diff (new SVGs + updated `Icon/generated/index.ts`).

---

## 14. Architecture decisions

Short ADR list — the *why* behind non-obvious choices.

### ADR-001. Nextra for docs, not Storybook

Storybook shows one platform's live component well; MDX shows *three* code snippets alongside one live preview equally well. Origon needs the latter — designers and native devs read the same page.

### ADR-002. React as canonical

Any port needs a spec. React was already required for the docs site's live previews. Making it canonical avoids duplicating the API spec in prose.

### ADR-003. CSS variables for React theming

Alternatives (context + re-render, styled-components' `ThemeProvider`) require every component to subscribe. CSS variables let a single DOM attribute flip retint the whole tree with zero re-render.

### ADR-004. Six modes as 6 scoped selectors, not media queries

Media queries would tie theme to system preference; we need user override for brand as well. Two `data-*` attributes give us the full 3×2 matrix.

### ADR-005. Custom token pipeline instead of Style Dictionary

Style Dictionary v4 was the first choice but multi-mode + semantic aliases + per-platform bindings + our unique `size/width/height/blur/shadow` layout required more custom transforms than plain SD encouraged. A 900-line `build.config.mjs` is easier to read than the equivalent SD config with 12 transforms.

### ADR-006. Commit generated code

Fresh clones must `pnpm build` without a Figma token. This means committing `packages/tokens-*/generated/` and 598 icon SVGs. Trade-off: bigger repo, no CI Figma auth.

### ADR-007. `.process()` on SPM resources, not asset catalogs

Asset catalogs require Xcode; a plain SPM package with `.process("Resources")` works from CLI. The trade-off is basename uniqueness — solved with the `icon_` rename for the 15 logo/icon collisions.

### ADR-008. Widgetbook for Flutter, not Storybook clone

Widgetbook is the Flutter-native equivalent of Storybook and integrates with the widget test tooling.

### ADR-009. iOS 17+ minimum for Swift package

Native SVG rendering via `Image(name:bundle:)` shipped with iOS 17. Backporting via `SVGView` or `WKWebView` was rejected as accidental complexity — BtcTurk targets recent iOS.

---

## 15. Roadmap and open questions

### Deferred to v2

- **Modules** (compound patterns above component level — Chart+Toolbar, Header+Filter). Explicitly deferred by product.
- **Visual regression snapshots.** Playwright + Percy or Chromatic.
- **Figma Code Connect** — bidirectional link so designers see React snippets in Figma.
- **npm publication.** Currently workspace-only; v2 will publish `@origon/react`, `@origon/tokens-*`.
- **Flutter widgetbook web deploy.** Currently only local.
- **Swift XCFramework distribution.** Currently SPM-only.

### Open questions

- Should `Chart` split into per-kind exports (`LineChart`, `AreaChart`) to reduce bundle size?
- Where should `Row` interactive behavior live once we add drag-reorder — same component with a `reorderable` prop, or a `SortableRow` variant?
- Should the token pipeline emit a JSON schema for downstream consumers?
- How should we surface icon-set search in the docs site (598 is too many for a static grid)?

---

## References

- **Figma file**: `57b5pxiONTgoI4w4fvaNbA` (Origon UI)
- **Repository**: https://github.com/oktayelipek/Origon
- **DTCG spec**: https://tr.designtokens.org/format/
- **Nextra**: https://nextra.site
- **Conventional Commits**: https://www.conventionalcommits.org
- **semantic-release**: https://semantic-release.gitbook.io

<!-- TOKEN_TABLES_START -->

## Appendix A — Complete token reference

_Auto-generated from `tokens/source/*.json` by `scripts/generate-token-tables.mjs`. Do not hand-edit this section; regenerate to update._

### Colors — primitives

`tokens/source/colors.json` · 305 tokens

| Path | Type | Value |
|---|---|---|
| `color.base.white` | color | `#ffffff` |
| `color.base.black` | color | `#000000` |
| `color.blueGray.50` | color | `#070910` |
| `color.blueGray.100` | color | `#0b0f1a` |
| `color.blueGray.200` | color | `#131f2f` |
| `color.blueGray.300` | color | `#17273a` |
| `color.blueGray.400` | color | `#192f43` |
| `color.blueGray.500` | color | `#21374a` |
| `color.blueGray.600` | color | `#364a5e` |
| `color.blueGray.700` | color | `#4c5d72` |
| `color.blueGray.800` | color | `#596a7f` |
| `color.blueGray.900` | color | `#6b7d92` |
| `color.coolGray.50` | color | `#f0f4f7` |
| `color.coolGray.100` | color | `#e4e8ee` |
| `color.coolGray.200` | color | `#cbd1db` |
| `color.coolGray.300` | color | `#b4bbc9` |
| `color.coolGray.400` | color | `#9ca5b8` |
| `color.coolGray.500` | color | `#858fa6` |
| `color.coolGray.600` | color | `#68768c` |
| `color.coolGray.700` | color | `#4c5d72` |
| `color.coolGray.800` | color | `#314659` |
| `color.coolGray.900` | color | `#152f42` |
| `color.midGray.50` | color | `#f6f6f6` |
| `color.midGray.100` | color | `#e9e9e9` |
| `color.midGray.200` | color | `#d0d0d0` |
| `color.midGray.300` | color | `#b7b7b7` |
| `color.midGray.400` | color | `#9f9f9f` |
| `color.midGray.500` | color | `#878787` |
| `color.midGray.600` | color | `#707070` |
| `color.midGray.700` | color | `#5a5a5a` |
| `color.midGray.800` | color | `#454545` |
| `color.midGray.900` | color | `#303030` |
| `color.neutralGray.50` | color | `#ffffff` |
| `color.neutralGray.100` | color | `#f5f5f5` |
| `color.neutralGray.200` | color | `#ebebeb` |
| `color.neutralGray.300` | color | `#e0e0e0` |
| `color.neutralGray.400` | color | `#d6d6d6` |
| `color.neutralGray.500` | color | `#cccccc` |
| `color.neutralGray.600` | color | `#c2c2c2` |
| `color.neutralGray.700` | color | `#b8b8b8` |
| `color.neutralGray.800` | color | `#b4b4b4` |
| `color.neutralGray.900` | color | `#b0b0b0` |
| `color.green.50` | color | `#ecf2ec` |
| `color.green.100` | color | `#deecdf` |
| `color.green.200` | color | `#c3dfc5` |
| `color.green.300` | color | `#a7d1ac` |
| `color.green.400` | color | `#8bc493` |
| `color.green.500` | color | `#6eb77b` |
| `color.green.600` | color | `#4fa963` |
| `color.green.700` | color | `#269b4b` |
| `color.green.800` | color | `#008d33` |
| `color.green.900` | color | `#007f18` |
| `color.lime.50` | color | `#eff2ea` |
| `color.lime.100` | color | `#e3e9d8` |
| `color.lime.200` | color | `#ccd9b6` |
| `color.lime.300` | color | `#b4c994` |
| `color.lime.400` | color | `#9cb972` |
| `color.lime.500` | color | `#83a950` |
| `color.lime.600` | color | `#6a992c` |
| `color.lime.700` | color | `#4f8900` |
| `color.lime.800` | color | `#2f7a00` |
| `color.lime.900` | color | `#006a00` |
| `color.forest.50` | color | `#eff5ef` |
| `color.forest.100` | color | `#deeedf` |
| `color.forest.200` | color | `#bde0c0` |
| `color.forest.300` | color | `#9bd1a2` |
| `color.forest.400` | color | `#78c284` |
| `color.forest.500` | color | `#51b367` |
| `color.forest.600` | color | `#16a34a` |
| `color.forest.700` | color | `#00932b` |
| `color.forest.800` | color | `#008300` |
| `color.forest.900` | color | `#007200` |
| `color.teal.50` | color | `#e7fefa` |
| `color.teal.100` | color | `#d7f1ed` |
| `color.teal.200` | color | `#b8d7d3` |
| `color.teal.300` | color | `#99beba` |
| `color.teal.400` | color | `#7ba6a1` |
| `color.teal.500` | color | `#5d8e89` |
| `color.teal.600` | color | `#4a7c78` |
| `color.teal.700` | color | `#376a67` |
| `color.teal.800` | color | `#245956` |
| `color.teal.900` | color | `#0e4846` |
| `color.midnightTeal.50` | color | `#33a9a0` |
| `color.midnightTeal.100` | color | `#319890` |
| `color.midnightTeal.200` | color | `#2b7873` |
| `color.midnightTeal.300` | color | `#245956` |
| `color.midnightTeal.400` | color | `#1c3c3b` |
| `color.midnightTeal.500` | color | `#193433` |
| `color.midnightTeal.600` | color | `#152a29` |
| `color.midnightTeal.700` | color | `#0f1d1d` |
| `color.midnightTeal.800` | color | `#070d0d` |
| `color.midnightTeal.900` | color | `#050a0a` |
| `color.cyan.50` | color | `#ebf5f9` |
| `color.cyan.100` | color | `#ddf0f5` |
| `color.cyan.200` | color | `#c0e4ef` |
| `color.cyan.300` | color | `#a1d9e8` |
| `color.cyan.400` | color | `#80cde1` |
| `color.cyan.500` | color | `#58c2db` |
| `color.cyan.600` | color | `#06b6d4` |
| `color.cyan.700` | color | `#00aacd` |
| `color.cyan.800` | color | `#009fc7` |
| `color.cyan.900` | color | `#0093c0` |
| `color.blue.50` | color | `#f0f4ff` |
| `color.blue.100` | color | `#dee7fd` |
| `color.blue.200` | color | `#b9ccfa` |
| `color.blue.300` | color | `#94b2f6` |
| `color.blue.400` | color | `#6f98f2` |
| `color.blue.500` | color | `#4a7def` |
| `color.blue.600` | color | `#2563eb` |
| `color.blue.700` | color | `#004de7` |
| `color.blue.800` | color | `#0039e3` |
| `color.blue.900` | color | `#002ade` |
| `color.violet.50` | color | `#f6f2f9` |
| `color.violet.100` | color | `#ede1f9` |
| `color.violet.200` | color | `#dbc0f8` |
| `color.violet.300` | color | `#c7a0f6` |
| `color.violet.400` | color | `#b17ff3` |
| `color.violet.500` | color | `#985ef0` |
| `color.violet.600` | color | `#7c3aed` |
| `color.violet.700` | color | `#612eb6` |
| `color.violet.800` | color | `#472383` |
| `color.violet.900` | color | `#2f1852` |
| `color.red.50` | color | `#fffbfb` |
| `color.red.100` | color | `#ffebe6` |
| `color.red.200` | color | `#ffc9bd` |
| `color.red.300` | color | `#ffa692` |
| `color.red.400` | color | `#f6836c` |
| `color.red.500` | color | `#ea5f47` |
| `color.red.600` | color | `#dc3323` |
| `color.red.700` | color | `#cb0000` |
| `color.red.800` | color | `#ba0000` |
| `color.red.900` | color | `#a80000` |
| `color.amber.50` | color | `#fff8f2` |
| `color.amber.100` | color | `#ffedde` |
| `color.amber.200` | color | `#fdd8b6` |
| `color.amber.300` | color | `#f8c28e` |
| `color.amber.400` | color | `#f0ae67` |
| `color.amber.500` | color | `#e6993e` |
| `color.amber.600` | color | `#db8500` |
| `color.amber.700` | color | `#ce7100` |
| `color.amber.800` | color | `#c05d00` |
| `color.amber.900` | color | `#b34900` |
| `color.yellow.50` | color | `#fffcf6` |
| `color.yellow.100` | color | `#fff5e5` |
| `color.yellow.200` | color | `#ffe7be` |
| `color.yellow.300` | color | `#feda97` |
| `color.yellow.400` | color | `#f9cc71` |
| `color.yellow.500` | color | `#f2c049` |
| `color.yellow.600` | color | `#eab308` |
| `color.yellow.700` | color | `#e1a700` |
| `color.yellow.800` | color | `#d69b00` |
| `color.yellow.900` | color | `#cc8f00` |
| `color.brands.kripto.50` | color | `#e4ebff` |
| `color.brands.kripto.100` | color | `#c8d4f6` |
| `color.brands.kripto.200` | color | `#a4b8eb` |
| `color.brands.kripto.300` | color | `#7d9ee0` |
| `color.brands.kripto.400` | color | `#5384d1` |
| `color.brands.kripto.500` | color | `#256bbc` |
| `color.brands.kripto.600` | color | `#005fae` |
| `color.brands.kripto.700` | color | `#003e7b` |
| `color.brands.kripto.800` | color | `#063360` |
| `color.brands.kripto.900` | color | `#112644` |
| `color.brands.kripto.alpha.600Alpha0` | color | `#005fae00` |
| `color.brands.kripto.alpha.600Alpha10` | color | `#005fae1a` |
| `color.brands.kripto.alpha.600Alpha20` | color | `#005fae33` |
| `color.brands.kripto.alpha.600Alpha40` | color | `#005fae66` |
| `color.brands.kripto.alpha.600Alpha60` | color | `#005fae99` |
| `color.brands.kripto.alpha.600Alpha80` | color | `#005faecc` |
| `color.brands.kripto.alpha.600Alpha90` | color | `#005faee5` |
| `color.brands.hisse.50` | color | `#e9f3f0` |
| `color.brands.hisse.100` | color | `#d9ede7` |
| `color.brands.hisse.200` | color | `#bae0d5` |
| `color.brands.hisse.300` | color | `#99d3c4` |
| `color.brands.hisse.400` | color | `#77c6b3` |
| `color.brands.hisse.500` | color | `#50b9a2` |
| `color.brands.hisse.600` | color | `#07ac92` |
| `color.brands.hisse.700` | color | `#24907b` |
| `color.brands.hisse.800` | color | `#2d7465` |
| `color.brands.hisse.900` | color | `#2e5a50` |
| `color.brands.hisse.alpha.600Alpha0` | color | `#07ac9200` |
| `color.brands.hisse.alpha.600Alpha10` | color | `#07ac921a` |
| `color.brands.hisse.alpha.600Alpha20` | color | `#07ac9233` |
| `color.brands.hisse.alpha.600Alpha40` | color | `#07ac9266` |
| `color.brands.hisse.alpha.600Alpha60` | color | `#07ac9299` |
| `color.brands.hisse.alpha.600Alpha80` | color | `#07ac92cc` |
| `color.brands.hisse.alpha.600Alpha90` | color | `#07ac92e5` |
| `color.alpha.white.whiteAlpha0` | color | `#ffffff00` |
| `color.alpha.white.whiteAlpha10` | color | `#ffffff1a` |
| `color.alpha.white.whiteAlpha20` | color | `#ffffff33` |
| `color.alpha.white.whiteAlpha40` | color | `#ffffff66` |
| `color.alpha.white.whiteAlpha60` | color | `#ffffff99` |
| `color.alpha.white.whiteAlpha80` | color | `#ffffffcc` |
| `color.alpha.white.whiteAlpha90` | color | `#ffffffe5` |
| `color.alpha.black.blackAlpha0` | color | `#00000000` |
| `color.alpha.black.blackAlpha10` | color | `#0000001a` |
| `color.alpha.black.blackAlpha20` | color | `#00000033` |
| `color.alpha.black.blackAlpha40` | color | `#00000066` |
| `color.alpha.black.blackAlpha60` | color | `#00000099` |
| `color.alpha.black.blackAlpha80` | color | `#000000cc` |
| `color.alpha.black.blackAlpha90` | color | `#000000e5` |
| `color.alpha.blueGray.blueGray50Alpha0` | color | `#07091000` |
| `color.alpha.blueGray.blueGray50Alpha10` | color | `#0709101a` |
| `color.alpha.blueGray.blueGray50Alpha20` | color | `#07091033` |
| `color.alpha.blueGray.blueGray50Alpha40` | color | `#07091066` |
| `color.alpha.blueGray.blueGray50Alpha60` | color | `#07091099` |
| `color.alpha.blueGray.blueGray50Alpha80` | color | `#070910cc` |
| `color.alpha.blueGray.blueGray50Alpha90` | color | `#070910e5` |
| `color.alpha.blueGray.blueGray100Alpha0` | color | `#0b0f1a00` |
| `color.alpha.blueGray.blueGray100Alpha10` | color | `#0b0f1a1a` |
| `color.alpha.blueGray.blueGray100Alpha20` | color | `#0b0f1a33` |
| `color.alpha.blueGray.blueGray100Alpha40` | color | `#0b0f1a66` |
| `color.alpha.blueGray.blueGray100Alpha60` | color | `#0b0f1a99` |
| `color.alpha.blueGray.blueGray100Alpha80` | color | `#0b0f1acc` |
| `color.alpha.blueGray.blueGray100Alpha90` | color | `#0b0f1ae5` |
| `color.alpha.neutralGray.neutralGray50Alpha0` | color | `#ffffff00` |
| `color.alpha.neutralGray.neutralGray50Alpha10` | color | `#ffffff1a` |
| `color.alpha.neutralGray.neutralGray50Alpha20` | color | `#ffffff33` |
| `color.alpha.neutralGray.neutralGray50Alpha40` | color | `#ffffff66` |
| `color.alpha.neutralGray.neutralGray50Alpha60` | color | `#ffffff99` |
| `color.alpha.neutralGray.neutralGray50Alpha80` | color | `#ffffffcc` |
| `color.alpha.neutralGray.blueGray50Alpha90` | color | `#ffffffe5` |
| `color.alpha.neutralGray.neutralGray100Alpha0` | color | `#f5f5f500` |
| `color.alpha.neutralGray.neutralGray100Alpha10` | color | `#f5f5f51a` |
| `color.alpha.neutralGray.neutralGray100Alpha20` | color | `#f5f5f533` |
| `color.alpha.neutralGray.neutralGray100Alpha40` | color | `#f5f5f566` |
| `color.alpha.neutralGray.neutralGray100Alpha60` | color | `#f5f5f599` |
| `color.alpha.neutralGray.neutralGray100Alpha80` | color | `#f5f5f5cc` |
| `color.alpha.neutralGray.neutralGray100Alpha90` | color | `#f5f5f5e5` |
| `color.alpha.green.green400Alpha0` | color | `#8bc49300` |
| `color.alpha.green.green400Alpha10` | color | `#8bc4931a` |
| `color.alpha.green.green400Alpha20` | color | `#8bc49333` |
| `color.alpha.green.green400Alpha40` | color | `#8bc49366` |
| `color.alpha.green.green400Alpha60` | color | `#8bc49399` |
| `color.alpha.green.green400Alpha80` | color | `#8bc493cc` |
| `color.alpha.green.green400Alpha90` | color | `#8bc493e5` |
| `color.alpha.green.green600Alpha0` | color | `#4fa96300` |
| `color.alpha.green.green600Alpha10` | color | `#4fa9631a` |
| `color.alpha.green.green600Alpha20` | color | `#4fa96333` |
| `color.alpha.green.green600Alpha40` | color | `#4fa96366` |
| `color.alpha.green.green600Alpha60` | color | `#4fa96399` |
| `color.alpha.green.green600Alpha80` | color | `#4fa963cc` |
| `color.alpha.green.green600Alpha90` | color | `#4fa963e5` |
| `color.alpha.lime.lime500Alpha0` | color | `#83a95000` |
| `color.alpha.lime.lime500Alpha10` | color | `#83a9501a` |
| `color.alpha.lime.lime500Alpha20` | color | `#83a95033` |
| `color.alpha.lime.lime500Alpha40` | color | `#83a95066` |
| `color.alpha.lime.lime500Alpha60` | color | `#83a95099` |
| `color.alpha.lime.lime500Alpha80` | color | `#83a950cc` |
| `color.alpha.lime.lime500Alpha90` | color | `#83a950e5` |
| `color.alpha.lime.lime600Alpha0` | color | `#6a992c00` |
| `color.alpha.lime.lime600Alpha10` | color | `#6a992c1a` |
| `color.alpha.lime.lime600Alpha20` | color | `#6a992c33` |
| `color.alpha.lime.lime600Alpha40` | color | `#6a992c66` |
| `color.alpha.lime.lime600Alpha60` | color | `#6a992c99` |
| `color.alpha.lime.lime600Alpha80` | color | `#6a992ccc` |
| `color.alpha.lime.lime600Alpha90` | color | `#6a992ce5` |
| `color.alpha.midnightTeal.midnightTeal500Alpha0` | color | `#19343300` |
| `color.alpha.midnightTeal.midnightTeal500Alpha10` | color | `#1934331a` |
| `color.alpha.midnightTeal.midnightTeal500Alpha20` | color | `#19343333` |
| `color.alpha.midnightTeal.midnightTeal500Alpha40` | color | `#19343366` |
| `color.alpha.midnightTeal.midnightTeal500Alpha60` | color | `#19343399` |
| `color.alpha.midnightTeal.midnightTeal500Alpha80` | color | `#193433cc` |
| `color.alpha.midnightTeal.midnightTeal500Alpha90` | color | `#193433e5` |
| `color.alpha.midnightTeal.midnightTeal800Alpha0` | color | `#070d0d00` |
| `color.alpha.midnightTeal.midnightTeal800Alpha10` | color | `#070d0d1a` |
| `color.alpha.midnightTeal.midnightTeal800Alpha20` | color | `#070d0d33` |
| `color.alpha.midnightTeal.midnightTeal800Alpha40` | color | `#070d0d66` |
| `color.alpha.midnightTeal.midnightTeal800Alpha60` | color | `#070d0d99` |
| `color.alpha.midnightTeal.midnightTeal800Alpha80` | color | `#070d0dcc` |
| `color.alpha.midnightTeal.midnightTeal800Alpha90` | color | `#070d0de5` |
| `color.alpha.amber.amber400Alpha0` | color | `#f0ae6700` |
| `color.alpha.amber.amber400Alpha10` | color | `#f0ae671a` |
| `color.alpha.amber.amber400Alpha20` | color | `#f0ae6733` |
| `color.alpha.amber.amber400Alpha40` | color | `#f0ae6766` |
| `color.alpha.amber.amber400Alpha60` | color | `#f0ae6799` |
| `color.alpha.amber.amber400Alpha80` | color | `#f0ae67cc` |
| `color.alpha.amber.amber400Alpha90` | color | `#f0ae67e5` |
| `color.alpha.amber.amber500Alpha0` | color | `#e6993e00` |
| `color.alpha.amber.amber500Alpha10` | color | `#e6993e1a` |
| `color.alpha.amber.amber500Alpha20` | color | `#e6993e33` |
| `color.alpha.amber.amber500Alpha40` | color | `#e6993e66` |
| `color.alpha.amber.amber500Alpha60` | color | `#e6993e99` |
| `color.alpha.amber.amber500Alpha80` | color | `#e6993ecc` |
| `color.alpha.amber.amber500Alpha90` | color | `#e6993ee5` |
| `color.alpha.amber.amber600Alpha0` | color | `#db850000` |
| `color.alpha.amber.amber600Alpha10` | color | `#db85001a` |
| `color.alpha.amber.amber600Alpha20` | color | `#db850033` |
| `color.alpha.amber.amber600Alpha40` | color | `#db850066` |
| `color.alpha.amber.amber600Alpha60` | color | `#db850099` |
| `color.alpha.amber.amber600Alpha80` | color | `#db8500cc` |
| `color.alpha.amber.amber600Alpha90` | color | `#db8500e5` |
| `color.alpha.red.red500Alpha0` | color | `#ea5f4700` |
| `color.alpha.red.red500Alpha10` | color | `#ea5f471a` |
| `color.alpha.red.red500Alpha20` | color | `#ea5f4733` |
| `color.alpha.red.red500Alpha40` | color | `#ea5f4766` |
| `color.alpha.red.red500Alpha60` | color | `#ea5f4799` |
| `color.alpha.red.red500Alpha80` | color | `#ea5f47cc` |
| `color.alpha.red.red500Alpha90` | color | `#ea5f47e5` |
| `color.alpha.red.red600Alpha0` | color | `#dc332300` |
| `color.alpha.red.red600Alpha10` | color | `#dc33231a` |
| `color.alpha.red.red600Alpha20` | color | `#dc332333` |
| `color.alpha.red.red600Alpha40` | color | `#dc332366` |
| `color.alpha.red.red600Alpha60` | color | `#dc332399` |
| `color.alpha.red.red600Alpha80` | color | `#dc3323cc` |
| `color.alpha.red.red600Alpha90` | color | `#dc3323e5` |

### Typography

`tokens/source/typography.json` · 24 tokens

| Path | Type | Value |
|---|---|---|
| `font.family.primary` | fontFamily | `Inter Variable` |
| `font.weight.regular` | fontWeight | `400` |
| `font.weight.medium` | fontWeight | `500` |
| `font.weight.bold` | fontWeight | `700` |
| `text.3xl.fontSize` | dimension | `30` |
| `text.3xl.lineHeight` | dimension | `36` |
| `text.displayLg.lineHeight` | dimension | `44` |
| `text.displayMd.fontSize` | dimension | `30` |
| `text.displaySm.fontSize` | dimension | `26` |
| `text.xxl.fontSize` | dimension | `24` |
| `text.xxl.lineHeight` | dimension | `30` |
| `text.xl.fontSize` | dimension | `20` |
| `text.xl.lineHeight` | dimension | `26` |
| `text.lg.fontSize` | dimension | `17` |
| `text.lg.lineHeight` | dimension | `22` |
| `text.md.fontSize` | dimension | `15` |
| `text.md.lineHeight` | dimension | `20` |
| `text.sm.fontSize` | dimension | `13` |
| `text.sm.lineHeight` | dimension | `18` |
| `text.xs.fontSize` | dimension | `11` |
| `text.xs.lineHeight` | dimension | `14` |
| `text.xxs.fontSize` | dimension | `10` |
| `text.xxs.lineHeight` | dimension | `14` |
| `text.text4xs.fontSize` | dimension | `10` |

### Sizes

`tokens/source/sizes.json` · 26 tokens

| Path | Type | Value |
|---|---|---|
| `size.0` | dimension | `0` |
| `size.1` | dimension | `4` |
| `size.2` | dimension | `8` |
| `size.3` | dimension | `12` |
| `size.4` | dimension | `16` |
| `size.5` | dimension | `20` |
| `size.6` | dimension | `24` |
| `size.7` | dimension | `28` |
| `size.8` | dimension | `32` |
| `size.9` | dimension | `36` |
| `size.10` | dimension | `40` |
| `size.11` | dimension | `44` |
| `size.12` | dimension | `48` |
| `size.13` | dimension | `52` |
| `size.14` | dimension | `56` |
| `size.15` | dimension | `60` |
| `size.16` | dimension | `64` |
| `size.17` | dimension | `68` |
| `size.18` | dimension | `72` |
| `size.19` | dimension | `76` |
| `size.20` | dimension | `80` |
| `size.21` | dimension | `84` |
| `size.22` | dimension | `88` |
| `size.23` | dimension | `92` |
| `size.24` | dimension | `96` |
| `size.25` | dimension | `100` |

### Theme primitives — Dark

`tokens/source/theme.dark.json` · 143 tokens

| Path | Type | Value |
|---|---|---|
| `spacing.8xl` | dimension | `72` |
| `spacing.7xl` | dimension | `64` |
| `spacing.6xl` | dimension | `56` |
| `spacing.5xl` | dimension | `48` |
| `spacing.4xl` | dimension | `40` |
| `spacing.3xl` | dimension | `32` |
| `spacing.xxl` | dimension | `28` |
| `spacing.xl` | dimension | `24` |
| `spacing.lg` | dimension | `20` |
| `spacing.md` | dimension | `16` |
| `spacing.sm` | dimension | `12` |
| `spacing.xs` | dimension | `8` |
| `spacing.xxs` | dimension | `4` |
| `radius.xxl` | dimension | `28` |
| `radius.xl` | dimension | `24` |
| `radius.lg` | dimension | `20` |
| `radius.md` | dimension | `16` |
| `radius.sm` | dimension | `12` |
| `radius.xs` | dimension | `8` |
| `radius.xxs` | dimension | `4` |
| `shadow.xl.offsetX` | dimension | `0` |
| `shadow.xl.offsetY` | dimension | `8` |
| `shadow.xl.blur` | dimension | `8` |
| `shadow.xl.spread` | dimension | `-4` |
| `shadow.xl.color` | color | `#0000001a` |
| `shadow.lg.offsetX` | dimension | `0` |
| `shadow.lg.offsetY` | dimension | `4` |
| `shadow.lg.blur` | dimension | `6` |
| `shadow.lg.spread` | dimension | `-2` |
| `shadow.lg.color` | color | `#0000001a` |
| `shadow.md.offsetX` | dimension | `0` |
| `shadow.md.offsetY` | dimension | `4` |
| `shadow.md.blur` | dimension | `6` |
| `shadow.md.spread` | dimension | `-1` |
| `shadow.md.color` | color | `#0000001a` |
| `shadow.sm.offsetX` | dimension | `0` |
| `shadow.sm.offsetY` | dimension | `1` |
| `shadow.sm.blur` | dimension | `3` |
| `shadow.sm.spread` | dimension | `-1` |
| `shadow.sm.color` | color | `#0000001a` |
| `shadow.xs.offsetX` | dimension | `0` |
| `shadow.xs.offsetY` | dimension | `1` |
| `shadow.xs.blur` | dimension | `2` |
| `shadow.xs.spread` | dimension | `0` |
| `shadow.xs.color` | color | `#0000000d` |
| `blur.xl` | dimension | `64` |
| `blur.lg` | dimension | `32` |
| `blur.md` | dimension | `16` |
| `blur.sm` | dimension | `12` |
| `blur.xs` | dimension | `8` |
| `blur.xxs` | dimension | `4` |
| `width.6xl` | dimension | `96` |
| `width.5xl` | dimension | `80` |
| `width.4xl` | dimension | `72` |
| `width.3xl` | dimension | `64` |
| `width.xxl` | dimension | `48` |
| `width.xl` | dimension | `32` |
| `width.lg` | dimension | `24` |
| `width.md` | dimension | `20` |
| `width.sm` | dimension | `16` |
| `width.xs` | dimension | `12` |
| `width.xxs` | dimension | `8` |
| `width.3xs` | dimension | `4` |
| `height.6xl` | dimension | `96` |
| `height.5xl` | dimension | `80` |
| `height.4xl` | dimension | `72` |
| `height.3xl` | dimension | `64` |
| `height.xxl` | dimension | `48` |
| `height.xl` | dimension | `32` |
| `height.lg` | dimension | `24` |
| `height.md` | dimension | `20` |
| `height.sm` | dimension | `16` |
| `height.xs` | dimension | `12` |
| `height.xxs` | dimension | `8` |
| `height.3xs` | dimension | `4` |
| `semantic.level.level0` | color | `#070910` |
| `semantic.level.level1` | color | `#0b0f1a` |
| `semantic.level.level2` | color | `#131f2f` |
| `semantic.level.level3` | color | `#17273a` |
| `semantic.level.level4` | color | `#192f43` |
| `semantic.level.level5` | color | `#21374a` |
| `semantic.level.level6` | color | `#4c5d72` |
| `semantic.level.alpha.level1Alpha80` | color | `#070910cc` |
| `semantic.status.success` | color | `#4fa963` |
| `semantic.status.alpha.successAlpha10` | color | `#4fa9631a` |
| `semantic.status.alpha.successAlpha20` | color | `#4fa96333` |
| `semantic.status.alpha.warningAlpha10` | color | `#f0ae671a` |
| `semantic.status.alpha.warningAlpha20` | color | `#f0ae6733` |
| `semantic.status.alpha.dangerAlpha10` | color | `#dc33231a` |
| `semantic.status.alpha.dangerAlpha20` | color | `#dc332333` |
| `semantic.status.warning` | color | `#f0ae67` |
| `semantic.status.danger` | color | `#dc3323` |
| `semantic.status.primary` | color | `#005fae` |
| `semantic.status.focus` | color | `#f0f4f7` |
| `semantic.status.secondary` | color | `#858fa6` |
| `semantic.status.tertiary` | color | `#4c5d72` |
| `semantic.button.primary` | color | `#005fae` |
| `semantic.button.focus` | color | `#f0f4f7` |
| `semantic.button.secondary` | color | `#131f2f` |
| `semantic.button.disable` | color | `#070910` |
| `semantic.button.buy` | color | `#4fa963` |
| `semantic.button.sell` | color | `#dc3323` |
| `semantic.text.primary` | color | `#005fae` |
| `semantic.text.focus` | color | `#f0f4f7` |
| `semantic.text.secondary` | color | `#858fa6` |
| `semantic.text.tertiary` | color | `#4c5d72` |
| `semantic.text.disable` | color | `#192f43` |
| `semantic.text.reverse` | color | `#070910` |
| `semantic.text.baseWhite` | color | `#ffffff` |
| `semantic.text.baseBlack` | color | `#000000` |
| `semantic.text.success` | color | `#4fa963` |
| `semantic.text.warning` | color | `#f0ae67` |
| `semantic.text.danger` | color | `#dc3323` |
| `semantic.icon.primary` | color | `#005fae` |
| `semantic.icon.focus` | color | `#f0f4f7` |
| `semantic.icon.secondary` | color | `#858fa6` |
| `semantic.icon.tertiary` | color | `#4c5d72` |
| `semantic.icon.disable` | color | `#192f43` |
| `semantic.icon.reverse` | color | `#070910` |
| `semantic.icon.baseWhite` | color | `#ffffff` |
| `semantic.icon.baseBlack` | color | `#000000` |
| `semantic.icon.success` | color | `#4fa963` |
| `semantic.icon.warning` | color | `#f0ae67` |
| `semantic.icon.danger` | color | `#dc3323` |
| `semantic.border.primary` | color | `#005fae` |
| `semantic.border.focus` | color | `#f0f4f7` |
| `semantic.border.success` | color | `#4fa963` |
| `semantic.border.warning` | color | `#f0ae67` |
| `semantic.border.danger` | color | `#dc3323` |
| `semantic.border.level0` | color | `#070910` |
| `semantic.border.level1` | color | `#0b0f1a` |
| `semantic.border.level2` | color | `#131f2f` |
| `semantic.border.level3` | color | `#17273a` |
| `semantic.border.level4` | color | `#192f43` |
| `semantic.border.level5` | color | `#21374a` |
| `semantic.border.level6` | color | `#4c5d72` |
| `semantic.border.alpha.successAlpha10` | color | `#4fa9631a` |
| `semantic.border.alpha.successAlpha20` | color | `#4fa96333` |
| `semantic.border.alpha.warningAlpha10` | color | `#f0ae671a` |
| `semantic.border.alpha.warningAlpha20` | color | `#f0ae6733` |
| `semantic.border.alpha.dangerAlpha10` | color | `#dc33231a` |
| `semantic.border.alpha.dangerAlpha20` | color | `#dc332333` |
| `semantic.border.alpha.level1Alpha80` | color | `#070910cc` |

### Theme primitives — Light

`tokens/source/theme.light.json` · 143 tokens

| Path | Type | Value |
|---|---|---|
| `spacing.8xl` | dimension | `72` |
| `spacing.7xl` | dimension | `64` |
| `spacing.6xl` | dimension | `56` |
| `spacing.5xl` | dimension | `48` |
| `spacing.4xl` | dimension | `40` |
| `spacing.3xl` | dimension | `32` |
| `spacing.xxl` | dimension | `28` |
| `spacing.xl` | dimension | `24` |
| `spacing.lg` | dimension | `20` |
| `spacing.md` | dimension | `16` |
| `spacing.sm` | dimension | `12` |
| `spacing.xs` | dimension | `8` |
| `spacing.xxs` | dimension | `4` |
| `radius.xxl` | dimension | `28` |
| `radius.xl` | dimension | `24` |
| `radius.lg` | dimension | `20` |
| `radius.md` | dimension | `16` |
| `radius.sm` | dimension | `12` |
| `radius.xs` | dimension | `8` |
| `radius.xxs` | dimension | `4` |
| `shadow.xl.offsetX` | dimension | `0` |
| `shadow.xl.offsetY` | dimension | `8` |
| `shadow.xl.blur` | dimension | `8` |
| `shadow.xl.spread` | dimension | `-4` |
| `shadow.xl.color` | color | `#0000001a` |
| `shadow.lg.offsetX` | dimension | `0` |
| `shadow.lg.offsetY` | dimension | `4` |
| `shadow.lg.blur` | dimension | `6` |
| `shadow.lg.spread` | dimension | `-2` |
| `shadow.lg.color` | color | `#0000001a` |
| `shadow.md.offsetX` | dimension | `0` |
| `shadow.md.offsetY` | dimension | `4` |
| `shadow.md.blur` | dimension | `6` |
| `shadow.md.spread` | dimension | `-1` |
| `shadow.md.color` | color | `#0000001a` |
| `shadow.sm.offsetX` | dimension | `0` |
| `shadow.sm.offsetY` | dimension | `1` |
| `shadow.sm.blur` | dimension | `3` |
| `shadow.sm.spread` | dimension | `-1` |
| `shadow.sm.color` | color | `#0000001a` |
| `shadow.xs.offsetX` | dimension | `0` |
| `shadow.xs.offsetY` | dimension | `1` |
| `shadow.xs.blur` | dimension | `2` |
| `shadow.xs.spread` | dimension | `0` |
| `shadow.xs.color` | color | `#0000000d` |
| `blur.xl` | dimension | `64` |
| `blur.lg` | dimension | `32` |
| `blur.md` | dimension | `16` |
| `blur.sm` | dimension | `12` |
| `blur.xs` | dimension | `8` |
| `blur.xxs` | dimension | `4` |
| `width.6xl` | dimension | `96` |
| `width.5xl` | dimension | `80` |
| `width.4xl` | dimension | `72` |
| `width.3xl` | dimension | `64` |
| `width.xxl` | dimension | `48` |
| `width.xl` | dimension | `32` |
| `width.lg` | dimension | `24` |
| `width.md` | dimension | `20` |
| `width.sm` | dimension | `16` |
| `width.xs` | dimension | `12` |
| `width.xxs` | dimension | `8` |
| `width.3xs` | dimension | `4` |
| `height.6xl` | dimension | `96` |
| `height.5xl` | dimension | `80` |
| `height.4xl` | dimension | `72` |
| `height.3xl` | dimension | `64` |
| `height.xxl` | dimension | `48` |
| `height.xl` | dimension | `32` |
| `height.lg` | dimension | `24` |
| `height.md` | dimension | `20` |
| `height.sm` | dimension | `16` |
| `height.xs` | dimension | `12` |
| `height.xxs` | dimension | `8` |
| `height.3xs` | dimension | `4` |
| `semantic.level.level0` | color | `#f5f5f5` |
| `semantic.level.level1` | color | `#ffffff` |
| `semantic.level.level2` | color | `#f5f5f5` |
| `semantic.level.level3` | color | `#ebebeb` |
| `semantic.level.level4` | color | `#e0e0e0` |
| `semantic.level.level5` | color | `#d6d6d6` |
| `semantic.level.level6` | color | `#b0b0b0` |
| `semantic.level.alpha.level1Alpha80` | color | `#ffffffcc` |
| `semantic.status.success` | color | `#4fa963` |
| `semantic.status.alpha.successAlpha10` | color | `#4fa9631a` |
| `semantic.status.alpha.successAlpha20` | color | `#4fa96333` |
| `semantic.status.alpha.warningAlpha10` | color | `#db85001a` |
| `semantic.status.alpha.warningAlpha20` | color | `#db850033` |
| `semantic.status.alpha.dangerAlpha10` | color | `#dc33231a` |
| `semantic.status.alpha.dangerAlpha20` | color | `#dc332333` |
| `semantic.status.warning` | color | `#db8500` |
| `semantic.status.danger` | color | `#dc3323` |
| `semantic.status.primary` | color | `#005fae` |
| `semantic.status.focus` | color | `#070910` |
| `semantic.status.secondary` | color | `#707070` |
| `semantic.status.tertiary` | color | `#b7b7b7` |
| `semantic.button.primary` | color | `#005fae` |
| `semantic.button.focus` | color | `#070910` |
| `semantic.button.secondary` | color | `#f5f5f5` |
| `semantic.button.disable` | color | `#f5f5f5` |
| `semantic.button.buy` | color | `#4fa963` |
| `semantic.button.sell` | color | `#dc3323` |
| `semantic.text.primary` | color | `#005fae` |
| `semantic.text.focus` | color | `#070910` |
| `semantic.text.secondary` | color | `#707070` |
| `semantic.text.tertiary` | color | `#9f9f9f` |
| `semantic.text.disable` | color | `#e0e0e0` |
| `semantic.text.reverse` | color | `#f0f4f7` |
| `semantic.text.baseWhite` | color | `#ffffff` |
| `semantic.text.baseBlack` | color | `#000000` |
| `semantic.text.success` | color | `#4fa963` |
| `semantic.text.warning` | color | `#db8500` |
| `semantic.text.danger` | color | `#dc3323` |
| `semantic.icon.primary` | color | `#005fae` |
| `semantic.icon.focus` | color | `#070910` |
| `semantic.icon.secondary` | color | `#707070` |
| `semantic.icon.tertiary` | color | `#9f9f9f` |
| `semantic.icon.disable` | color | `#e0e0e0` |
| `semantic.icon.reverse` | color | `#f0f4f7` |
| `semantic.icon.baseWhite` | color | `#ffffff` |
| `semantic.icon.baseBlack` | color | `#000000` |
| `semantic.icon.success` | color | `#4fa963` |
| `semantic.icon.warning` | color | `#db8500` |
| `semantic.icon.danger` | color | `#dc3323` |
| `semantic.border.primary` | color | `#005fae` |
| `semantic.border.focus` | color | `#070910` |
| `semantic.border.success` | color | `#4fa963` |
| `semantic.border.warning` | color | `#db8500` |
| `semantic.border.danger` | color | `#dc3323` |
| `semantic.border.level0` | color | `#f5f5f5` |
| `semantic.border.level1` | color | `#ffffff` |
| `semantic.border.level2` | color | `#f5f5f5` |
| `semantic.border.level3` | color | `#ebebeb` |
| `semantic.border.level4` | color | `#e0e0e0` |
| `semantic.border.level5` | color | `#d6d6d6` |
| `semantic.border.level6` | color | `#b0b0b0` |
| `semantic.border.alpha.successAlpha10` | color | `#4fa9631a` |
| `semantic.border.alpha.successAlpha20` | color | `#4fa96333` |
| `semantic.border.alpha.warningAlpha10` | color | `#db85001a` |
| `semantic.border.alpha.warningAlpha20` | color | `#db850033` |
| `semantic.border.alpha.dangerAlpha10` | color | `#dc33231a` |
| `semantic.border.alpha.dangerAlpha20` | color | `#dc332333` |
| `semantic.border.alpha.level1Alpha80` | color | `#ffffffcc` |

### Semantic — Kripto · Dark

`tokens/source/semantic.kripto-dark.json` · 35 tokens

| Path | Type | Value |
|---|---|---|
| `semantic.text.focus` | color | `#f0f4f7` |
| `semantic.text.secondary` | color | `#858fa6` |
| `semantic.text.tertiary` | color | `#4c5d72` |
| `semantic.icon.focus` | color | `#f0f4f7` |
| `semantic.icon.inactive` | color | `#858fa6` |
| `semantic.icon.disabled` | color | `#4c5d72` |
| `semantic.level.basement` | color | `#070910` |
| `semantic.level.basementOpacity80` | color | `#070910cc` |
| `semantic.level.surface` | color | `#0b0f1a` |
| `semantic.level.surfaceOpacity80` | color | `#0b0f1acc` |
| `semantic.level.surfaceOpacity0` | color | `#0b0f1a00` |
| `semantic.level.elevation` | color | `#131f2f` |
| `semantic.level.elevation1` | color | `#17273a` |
| `semantic.level.elevation2` | color | `#192f43` |
| `semantic.level.elevation3` | color | `#21374a` |
| `semantic.level.elevation4` | color | `#4c5d72` |
| `semantic.brand.primary` | color | `#005fae` |
| `semantic.brand.primary10` | color | `#005fae1a` |
| `semantic.inverse.purewhite` | color | `#ffffff` |
| `semantic.inverse.puredark` | color | `#000000` |
| `semantic.inverse.swap` | color | `#000000` |
| `semantic.inverse.focus` | color | `#ffffff` |
| `semantic.actions.action01` | color | `#4fa963` |
| `semantic.actions.action0120` | color | `#4fa96333` |
| `semantic.actions.action02` | color | `#e93a40` |
| `semantic.actions.action0220` | color | `#e93a4033` |
| `semantic.actions.action03` | color | `#ffac2b` |
| `semantic.actions.action0320` | color | `#ffac2b33` |
| `semantic.actions.gradients.gradient01` | color | `#15ed45` |
| `semantic.actions.gradients.gradient02` | color | `#b32b31` |
| `semantic.button.buy` | color | `#48aa5c` |
| `semantic.button.sell` | color | `#b32b31` |
| `semantic.debug.undefined` | color | `#c5ff00` |
| `semantic.dedicated.overlay` | color | `#000000d9` |
| `semantic.sectionBg.undefined` | color | `#000000` |

### Semantic — Kripto · Light

`tokens/source/semantic.kripto-light.json` · 35 tokens

| Path | Type | Value |
|---|---|---|
| `semantic.text.focus` | color | `#070910` |
| `semantic.text.secondary` | color | `#707070` |
| `semantic.text.tertiary` | color | `#a3a3a3` |
| `semantic.icon.focus` | color | `#070910` |
| `semantic.icon.inactive` | color | `#707070` |
| `semantic.icon.disabled` | color | `#a3a3a3` |
| `semantic.level.basement` | color | `#f5f5f5` |
| `semantic.level.basementOpacity80` | color | `#f5f5f5cc` |
| `semantic.level.surface` | color | `#ffffff` |
| `semantic.level.surfaceOpacity80` | color | `#ffffffcc` |
| `semantic.level.surfaceOpacity0` | color | `#ffffff00` |
| `semantic.level.elevation` | color | `#f5f5f5` |
| `semantic.level.elevation1` | color | `#ebebeb` |
| `semantic.level.elevation2` | color | `#e0e0e0` |
| `semantic.level.elevation3` | color | `#d6d6d6` |
| `semantic.level.elevation4` | color | `#cccccc` |
| `semantic.brand.primary` | color | `#005fae` |
| `semantic.brand.primary10` | color | `#005fae1a` |
| `semantic.inverse.purewhite` | color | `#ffffff` |
| `semantic.inverse.puredark` | color | `#000000` |
| `semantic.inverse.swap` | color | `#ffffff` |
| `semantic.inverse.focus` | color | `#000000` |
| `semantic.actions.action01` | color | `#4ba22d` |
| `semantic.actions.action0120` | color | `#4ba22d33` |
| `semantic.actions.action02` | color | `#dc3323` |
| `semantic.actions.action0220` | color | `#dc332333` |
| `semantic.actions.action03` | color | `#db8500` |
| `semantic.actions.action0320` | color | `#db850033` |
| `semantic.actions.gradients.gradient01` | color | `#00f231` |
| `semantic.actions.gradients.gradient02` | color | `#d50b14` |
| `semantic.button.buy` | color | `#48aa5c` |
| `semantic.button.sell` | color | `#de393f` |
| `semantic.debug.undefined` | color | `#0064ff` |
| `semantic.dedicated.overlay` | color | `#000000bf` |
| `semantic.sectionBg.undefined` | color | `#e8e8e8` |

### Semantic — Hisse · Dark

`tokens/source/semantic.hisse-dark.json` · 35 tokens

| Path | Type | Value |
|---|---|---|
| `semantic.text.focus` | color | `#e7fefa` |
| `semantic.text.secondary` | color | `#5d8e89` |
| `semantic.text.tertiary` | color | `#245956` |
| `semantic.icon.focus` | color | `#e7fefa` |
| `semantic.icon.inactive` | color | `#5d8e89` |
| `semantic.icon.disabled` | color | `#245956` |
| `semantic.level.basement` | color | `#050a0a` |
| `semantic.level.basementOpacity80` | color | `#050a0acc` |
| `semantic.level.surface` | color | `#070d0d` |
| `semantic.level.surfaceOpacity80` | color | `#070d0dcc` |
| `semantic.level.surfaceOpacity0` | color | `#070d0d00` |
| `semantic.level.elevation` | color | `#0f1d1d` |
| `semantic.level.elevation1` | color | `#152a29` |
| `semantic.level.elevation2` | color | `#193433` |
| `semantic.level.elevation3` | color | `#1c3c3b` |
| `semantic.level.elevation4` | color | `#245956` |
| `semantic.brand.primary` | color | `#07ac92` |
| `semantic.brand.primary10` | color | `#07ac921a` |
| `semantic.inverse.purewhite` | color | `#ffffff` |
| `semantic.inverse.puredark` | color | `#000000` |
| `semantic.inverse.swap` | color | `#000000` |
| `semantic.inverse.focus` | color | `#ffffff` |
| `semantic.actions.action01` | color | `#6a992c` |
| `semantic.actions.action0120` | color | `#6a992c33` |
| `semantic.actions.action02` | color | `#ad403e` |
| `semantic.actions.action0220` | color | `#ad403e33` |
| `semantic.actions.action03` | color | `#ffac2b` |
| `semantic.actions.action0320` | color | `#ffac2b33` |
| `semantic.actions.gradients.gradient01` | color | `#4fed15` |
| `semantic.actions.gradients.gradient02` | color | `#cf363c` |
| `semantic.button.buy` | color | `#6a992c` |
| `semantic.button.sell` | color | `#ad403e` |
| `semantic.debug.undefined` | color | `#c5ff00` |
| `semantic.dedicated.overlay` | color | `#000000d9` |
| `semantic.sectionBg.undefined` | color | `#000000` |

### Semantic — Hisse · Light

`tokens/source/semantic.hisse-light.json` · 35 tokens

| Path | Type | Value |
|---|---|---|
| `semantic.text.focus` | color | `#0a0a0a` |
| `semantic.text.secondary` | color | `#707070` |
| `semantic.text.tertiary` | color | `#a3a3a3` |
| `semantic.icon.focus` | color | `#0a0a0a` |
| `semantic.icon.inactive` | color | `#707070` |
| `semantic.icon.disabled` | color | `#a3a3a3` |
| `semantic.level.basement` | color | `#f5f5f5` |
| `semantic.level.basementOpacity80` | color | `#f5f5f5cc` |
| `semantic.level.surface` | color | `#ffffff` |
| `semantic.level.surfaceOpacity80` | color | `#ffffffcc` |
| `semantic.level.surfaceOpacity0` | color | `#ffffff00` |
| `semantic.level.elevation` | color | `#f5f5f5` |
| `semantic.level.elevation1` | color | `#ebebeb` |
| `semantic.level.elevation2` | color | `#e0e0e0` |
| `semantic.level.elevation3` | color | `#d6d6d6` |
| `semantic.level.elevation4` | color | `#cccccc` |
| `semantic.brand.primary` | color | `#07ac92` |
| `semantic.brand.primary10` | color | `#07ac921a` |
| `semantic.inverse.purewhite` | color | `#ffffff` |
| `semantic.inverse.puredark` | color | `#000000` |
| `semantic.inverse.swap` | color | `#ffffff` |
| `semantic.inverse.focus` | color | `#000000` |
| `semantic.actions.action01` | color | `#4ba22d` |
| `semantic.actions.action0120` | color | `#4ba22d33` |
| `semantic.actions.action02` | color | `#dc3323` |
| `semantic.actions.action0220` | color | `#dc332333` |
| `semantic.actions.action03` | color | `#db8500` |
| `semantic.actions.action0320` | color | `#db850033` |
| `semantic.actions.gradients.gradient01` | color | `#00f231` |
| `semantic.actions.gradients.gradient02` | color | `#d50b14` |
| `semantic.button.buy` | color | `#4ba22d` |
| `semantic.button.sell` | color | `#dc3323` |
| `semantic.debug.undefined` | color | `#0064ff` |
| `semantic.dedicated.overlay` | color | `#000000bf` |
| `semantic.sectionBg.undefined` | color | `#e8e8e8` |

### Semantic — Global · Dark

`tokens/source/semantic.global-dark.json` · 35 tokens

| Path | Type | Value |
|---|---|---|
| `semantic.text.focus` | color | `#f0f4f7` |
| `semantic.text.secondary` | color | `#858fa6` |
| `semantic.text.tertiary` | color | `#4c5d72` |
| `semantic.icon.focus` | color | `#f0f4f7` |
| `semantic.icon.inactive` | color | `#858fa6` |
| `semantic.icon.disabled` | color | `#4c5d72` |
| `semantic.level.basement` | color | `#070910` |
| `semantic.level.basementOpacity80` | color | `#070910cc` |
| `semantic.level.surface` | color | `#0b0f1a` |
| `semantic.level.surfaceOpacity80` | color | `#0b0f1acc` |
| `semantic.level.surfaceOpacity0` | color | `#0b0f1a00` |
| `semantic.level.elevation` | color | `#131f2f` |
| `semantic.level.elevation1` | color | `#17273a` |
| `semantic.level.elevation2` | color | `#192f43` |
| `semantic.level.elevation3` | color | `#21374a` |
| `semantic.level.elevation4` | color | `#4c5d72` |
| `semantic.brand.primary` | color | `#005fae` |
| `semantic.brand.primary10` | color | `#005fae1a` |
| `semantic.inverse.purewhite` | color | `#ffffff` |
| `semantic.inverse.puredark` | color | `#000000` |
| `semantic.inverse.swap` | color | `#000000` |
| `semantic.inverse.focus` | color | `#ffffff` |
| `semantic.actions.action01` | color | `#4fa963` |
| `semantic.actions.action0120` | color | `#4fa96333` |
| `semantic.actions.action02` | color | `#e93a40` |
| `semantic.actions.action0220` | color | `#e93a4033` |
| `semantic.actions.action03` | color | `#ffac2b` |
| `semantic.actions.action0320` | color | `#ffac2b33` |
| `semantic.actions.gradients.gradient01` | color | `#15ed45` |
| `semantic.actions.gradients.gradient02` | color | `#b32b31` |
| `semantic.button.buy` | color | `#48aa5c` |
| `semantic.button.sell` | color | `#b32b31` |
| `semantic.debug.undefined` | color | `#c5ff00` |
| `semantic.dedicated.overlay` | color | `#000000d9` |
| `semantic.sectionBg.undefined` | color | `#000000` |

### Semantic — Global · Light

`tokens/source/semantic.global-light.json` · 35 tokens

| Path | Type | Value |
|---|---|---|
| `semantic.text.focus` | color | `#070910` |
| `semantic.text.secondary` | color | `#707070` |
| `semantic.text.tertiary` | color | `#a3a3a3` |
| `semantic.icon.focus` | color | `#070910` |
| `semantic.icon.inactive` | color | `#707070` |
| `semantic.icon.disabled` | color | `#a3a3a3` |
| `semantic.level.basement` | color | `#f5f5f5` |
| `semantic.level.basementOpacity80` | color | `#f5f5f5cc` |
| `semantic.level.surface` | color | `#ffffff` |
| `semantic.level.surfaceOpacity80` | color | `#ffffffcc` |
| `semantic.level.surfaceOpacity0` | color | `#ffffff00` |
| `semantic.level.elevation` | color | `#f5f5f5` |
| `semantic.level.elevation1` | color | `#ebebeb` |
| `semantic.level.elevation2` | color | `#e0e0e0` |
| `semantic.level.elevation3` | color | `#d6d6d6` |
| `semantic.level.elevation4` | color | `#cccccc` |
| `semantic.brand.primary` | color | `#005fae` |
| `semantic.brand.primary10` | color | `#005fae1a` |
| `semantic.inverse.purewhite` | color | `#ffffff` |
| `semantic.inverse.puredark` | color | `#000000` |
| `semantic.inverse.swap` | color | `#ffffff` |
| `semantic.inverse.focus` | color | `#000000` |
| `semantic.actions.action01` | color | `#4ba22d` |
| `semantic.actions.action0120` | color | `#4ba22d33` |
| `semantic.actions.action02` | color | `#dc3323` |
| `semantic.actions.action0220` | color | `#dc332333` |
| `semantic.actions.action03` | color | `#db8500` |
| `semantic.actions.action0320` | color | `#db850033` |
| `semantic.actions.gradients.gradient01` | color | `#00f231` |
| `semantic.actions.gradients.gradient02` | color | `#d50b14` |
| `semantic.button.buy` | color | `#48aa5c` |
| `semantic.button.sell` | color | `#de393f` |
| `semantic.debug.undefined` | color | `#0064ff` |
| `semantic.dedicated.overlay` | color | `#000000bf` |
| `semantic.sectionBg.undefined` | color | `#e8e8e8` |

---

**Grand total**: 851 tokens across 11 source files.

<!-- TOKEN_TABLES_END -->

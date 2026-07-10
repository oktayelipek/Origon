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

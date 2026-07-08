# Contributing to Origon UI

Thanks for helping evolve the design system. This guide covers the local
workflow, commit conventions, and release process.

## Local setup

```bash
# Requires Node 20+ (see .nvmrc) and pnpm 9+.
corepack enable
pnpm install
pnpm build:tokens
pnpm --filter @origon/docs dev  # → http://localhost:3000
```

Optional native tooling for parity checks:
- Flutter 3.24+ for `packages/flutter` and `packages/tokens-flutter`
- Xcode 15+ / swift 5.9 for `packages/swift` and `packages/tokens-swift`

## Repo layout

```
compo/
├── tokens/                     # DTCG source + build pipeline
│   ├── source/                 # Figma-synced JSON (single source of truth)
│   └── build.config.mjs        # → per-platform outputs
├── packages/
│   ├── tokens-{react,flutter,swift}/    # Generated + hand-written providers
│   └── {react,flutter,swift}/           # Component libraries
├── apps/docs/                   # Nextra guide (this site)
└── scripts/                     # Figma sync + icon/logo export
```

## Making a change

Component work flows in **canonical → ports** order:

1. Prototype in **React** (`packages/react/src/<Component>/<Component>.tsx`).
2. Write tests in `packages/react/test/<Component>.test.tsx`.
3. Add an MDX guide page in `apps/docs/pages/components/<slug>.mdx`.
4. Port to **Flutter** (`packages/flutter/lib/src/<component>.dart`) + tests.
5. Port to **Swift** (`packages/swift/Sources/OrigonUI/Origon<Component>.swift`) + tests.
6. Keep the API surface identical (prop names, sizes, defaults).

For **token changes**, edit in Figma and run `pnpm sync:figma`. Never hand-edit
files under `packages/tokens-*/generated/`.

## Commit convention (Conventional Commits)

Origon UI uses [Conventional Commits](https://www.conventionalcommits.org)
so [semantic-release](https://github.com/semantic-release/semantic-release)
can compute versions and generate the changelog automatically.

Format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Bumps version | Example |
| ---        | ---           | --- |
| `feat`     | **minor**     | `feat(button): add vertical direction` |
| `fix`      | **patch**     | `fix(dropdown): don't crash when options is empty` |
| `perf`     | patch         | `perf(chart): memoize domain calculation` |
| `refactor` | patch         | `refactor(tokens): split colors.json` |
| `docs`     | no bump       | `docs(button): document new prop` |
| `test`     | no bump       | `test(pin-input): cover paste path` |
| `chore`    | no bump       | `chore: update deps` |
| `ci`       | no bump       | `ci: cache pnpm store` |
| `style`    | no bump       | `style: run prettier` |
| `build`    | no bump       | `build: tighten tsconfig` |

### Breaking changes

Add `!` after the type or a `BREAKING CHANGE:` footer to trigger a **major**
bump:

```
feat(button)!: rename `iconPosition` to `iconSlot`

BREAKING CHANGE: `iconPosition` prop has been renamed to `iconSlot`.
Codemod: replace `iconPosition=` with `iconSlot=`.
```

### Scopes we use

Component names (`button`, `input`, `chart`, ...), package names
(`tokens`, `docs`, `flutter`, `swift`, `react`), or high-level areas
(`ci`, `release`, `figma`).

## Release process

Releases run automatically on every push to `main` via
`.github/workflows/release.yml`:

1. `semantic-release` inspects new commits since the last tag.
2. Computes the next version from Conventional Commit types.
3. Generates release notes and updates `CHANGELOG.md`.
4. Tags the commit, creates a GitHub release, and pushes back a
   `chore(release): x.y.z [skip ci]` commit (loop-safe).

Manual dry-run locally:

```bash
GITHUB_TOKEN=dummy pnpm release --dry-run
```

## CI checks

Every PR runs:
- **React**: Vitest — 96 tests
- **Flutter**: `flutter analyze` + `flutter test` — 14 tests
- **Swift**: `swift build` + `swift test` — 12 tests
- **Docs**: `next build`

Green CI is required to merge.

## Reporting issues

- Bug reports: include repro, expected vs actual, platform, browser/OS.
- Design questions: reference the Figma frame ID (`##:##`).
- Feature requests: describe the user need first, not the solution.

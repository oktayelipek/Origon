// Enforce Conventional Commits so semantic-release can compute versions.
// See https://www.conventionalcommits.org and CONTRIBUTING.md for examples.

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed types map to release rules in .releaserc.json.
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'perf', 'refactor', 'docs', 'style', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    // Allow longer subject lines (component names are verbose).
    'subject-max-length': [2, 'always', 100],
    // Suggest — not enforce — a scope so we can drop it for global changes.
    'scope-empty': [1, 'never'],
    // No period at end.
    'subject-full-stop': [2, 'never', '.'],
  },
};

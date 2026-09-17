# Contributing to Smart Weather

Thanks for considering a contribution! This is a small static project, so the
process is intentionally lightweight.

## Before you start

- For anything beyond a small fix, open an issue first to discuss the change.
- This project has no build step — please keep it that way. Contributions
  that introduce a bundler, framework, or backend for a purely cosmetic
  reason will likely be declined.

## Development

1. Clone the repository.
2. Serve the `smart-weather/` folder with any static file server (see
   [README.md](README.md#running-it-locally) — ES modules need `http://`,
   not `file://`).
3. Make your change.
4. Manually verify: all four languages still render with no leftover English
   text, both themes look correct, and the app still works with location
   permission denied (manual search path).

## Code style

- Vanilla ES modules, no TypeScript, no bundler.
- Keep files single-responsibility and under a few hundred lines.
- Prefer clear, beginner-readable code over clever one-liners. Comment the
  *why*, not the *what*.
- `js/recommendations.js` must stay language-neutral — no user-facing text,
  no `i18n` imports.
- `js/ui.js` must stay free of business logic — it only reads data and
  updates the DOM.

## Adding a language

See the step-by-step guide in [README.md](README.md#adding-a-new-language).

## Reporting bugs

Open an issue with: what you expected, what happened instead, your browser,
and (if relevant) which language/units/theme you had selected.

## Security issues

Please don't open a public issue for security vulnerabilities — see
[SECURITY.md](SECURITY.md).

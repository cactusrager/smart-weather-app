# Smart Weather

A static, privacy-first, multilingual weather app. No accounts, no cookies,
no trackers, no backend, no build step — just static files you can open
directly or host on GitHub Pages.

## What it does

- Current conditions, an hourly timeline, and a 7-day forecast.
- Three plain-language guidance sections — **How It Feels**, **What to
  Wear**, **Before You Go** — built from a small rules engine (see
  [METHODOLOGY.md](METHODOLOGY.md)), plus a "best time to go outside today"
  callout.
- Location via browser geolocation (with an explicit, translated consent
  message shown *before* the permission prompt) or by searching for a place
  by name.
- Four fully-translated languages: English, Deutsch, Français, Italiano.
- Light/dark theme (follows your system by default), metric/imperial units,
  and a reduced-motion setting.
- Nothing leaves your device except requests to the weather/geocoding APIs
  themselves — see [PRIVACY.md](PRIVACY.md).

## Tech stack

| Piece | Choice |
|---|---|
| CSS | Bootstrap 5 (CDN) + a small custom theme layer (`css/themes.css`, `css/main.css`) |
| Icons | Bootstrap Icons (CDN) |
| Font | Inter, self-hosted as `.woff2` in `assets/fonts/` |
| Weather data | [Open-Meteo](https://open-meteo.com/) forecast API |
| Geocoding | Open-Meteo Geocoding API (place search) + BigDataCloud (reverse geocoding) |
| JavaScript | Vanilla ES modules, no bundler, no framework |
| State | `localStorage` only |

Nothing here needs `npm install` or a build step. The whole app is the
`index.html` file plus the `css/`, `js/`, and `assets/` folders next to it.

## Running it locally

Because the JavaScript uses ES modules (`<script type="module">`), opening
`index.html` directly via a `file://` URL will be blocked by the browser's
module CORS rules. Serve the folder over HTTP instead — any static file
server works, for example:

```bash
npx serve smart-weather
```

or, with Python:

```bash
python -m http.server --directory smart-weather 8080
```

Then open the printed local URL in your browser.

## Deploying to GitHub Pages

Smart Weather is just static files, so deployment is:

1. Push this repository (with `index.html` at the root of the `smart-weather/`
   folder, or move its contents to your repo root) to GitHub.
2. In the repo's **Settings → Pages**, set the source to the branch and
   folder containing `index.html` (e.g. `main` branch, `/ (root)` — or `/docs`
   if you've placed the app there).
3. GitHub Pages will serve it at `https://<username>.github.io/<repo>/`.

A ready-made GitHub Actions workflow that publishes the `smart-weather/`
folder on every push to `main` is included at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — enable it by
setting Pages' source to "GitHub Actions" in the repo settings.

## How language detection and switching works

Language resolution priority (see [`js/i18n.js`](js/i18n.js)):

1. An explicit language saved in `localStorage` (you picked one).
2. Your browser's language (`navigator.languages`), matched against the four
   supported codes.
3. English, as the final fallback.

Switching languages (via the 🌐 button in the header, or the fuller list in
Settings) re-renders all visible text immediately — no page reload. Choosing
"Follow browser" clears any explicit choice and re-detects your browser
language on future visits too.

Translations never affect the recommendation *logic* — see
[METHODOLOGY.md](METHODOLOGY.md) for why that's a deliberate separation.

## How date/time localization works

All dates, times, and numbers are formatted with the browser's built-in
`Intl` APIs (`Intl.DateTimeFormat`, `Intl.NumberFormat`,
`Intl.RelativeTimeFormat`) — keyed to a locale per active language (e.g.
`de-CH` for Deutsch) — never a bundled date library. Every date/time is
formatted using the **forecast location's own timezone** (from Open-Meteo's
`timezone=auto`), not your device's timezone, so the times you see always
match what a local clock at that location would show.

## Adding a new language

1. Copy `js/translations/en.js` to `js/translations/<code>.js` (use a
   two-letter ISO 639-1 code, e.g. `es.js` for Spanish).
2. Translate every string value — keep every key exactly as in `en.js`.
   Write natural phrasing for each `recommendation.*` key rather than a literal
   translation of the English sentence.
3. In `js/i18n.js`:
   - Import the new file and add it to the `TRANSLATIONS` object.
   - Add the code to `SUPPORTED_LANGUAGES`.
   - Add an entry to `INTL_LOCALE_BY_LANGUAGE` (pick a sensible regional
     locale, e.g. `es-ES`).
4. In `index.html`, add a matching radio button in the Settings language
   `<fieldset>` (`id="settings-language-<code>"`), following the existing
   pattern.
5. Reload the app, switch to the new language from Settings, and check every
   section for leftover English text — the Phase 8 checklist in the original
   build spec calls this out explicitly.

## Project structure

```
smart-weather/
├── index.html
├── css/            main.css, themes.css (light/dark tokens)
├── js/
│   ├── app.js              orchestration / event wiring
│   ├── weather-api.js      Open-Meteo fetch + normalization + caching
│   ├── geolocation.js      Geolocation API wrapper
│   ├── geocoding.js        forward search + reverse lookup
│   ├── recommendations.js  language-neutral rules engine
│   ├── temperature-icons.js icon/color lookup for What to Wear's thermometer
│   ├── i18n.js             language resolution, switching, Intl helpers
│   ├── storage.js          typed localStorage helpers
│   ├── ui.js               DOM rendering only, no business logic
│   └── translations/       en.js, de.js, fr.js, it.js
└── assets/fonts/   self-hosted Inter .woff2 + OFL license
```

## Documentation

- [PRIVACY.md](PRIVACY.md) — what data is used, what's stored, why there's no
  cookie banner.
- [TERMS.md](TERMS.md) — terms of use.
- [METHODOLOGY.md](METHODOLOGY.md) — the recommendation engine's thresholds
  and data sources.
- [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) — every third-party
  library, font, and API this app uses.
- [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md),
  [SECURITY.md](SECURITY.md) — standard open-source project boilerplate.

## License

MIT — see [LICENSE](LICENSE).

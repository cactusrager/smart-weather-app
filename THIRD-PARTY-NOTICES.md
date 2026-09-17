# Third-Party Notices

Smart Weather uses the following third-party software and data sources.

## Bootstrap

- **Purpose:** CSS framework for layout, forms, and components.
- **Source:** https://getbootstrap.com/ (loaded from the jsDelivr CDN)
- **License:** MIT
- **Bundled or external:** Loaded externally from jsDelivr at runtime (not
  bundled in this repository). Requires a network request on every page
  load; sends no user data beyond a standard HTTP request for the file.

## Bootstrap Icons

- **Purpose:** Icon set used throughout the UI.
- **Source:** https://icons.getbootstrap.com/ (loaded from the jsDelivr CDN)
- **License:** MIT
- **Bundled or external:** Loaded externally from jsDelivr at runtime, same
  as Bootstrap above.

## Inter

- **Purpose:** The app's typeface.
- **Source:** https://rsms.me/inter/
- **License:** SIL Open Font License 1.1 (full text in
  [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt))
- **Bundled or external:** **Bundled.** The `.woff2` files live in
  `assets/fonts/` and are served from this app's own origin — no request to
  Google Fonts or any other third-party font CDN is ever made.

## Open-Meteo

- **Purpose:** Weather forecast data (current, hourly, daily) and forward
  place-name search (geocoding).
- **Source:** https://open-meteo.com/
- **License:** Data and API usable free of charge for non-commercial and
  commercial use under Open-Meteo's terms
  (https://open-meteo.com/en/license); no API key required.
- **Bundled or external:** External API, called at runtime. See
  [PRIVACY.md](PRIVACY.md) for exactly what's sent.

## BigDataCloud

- **Purpose:** Reverse geocoding (turning GPS coordinates into a place name)
  when you choose "Use my location."
- **Source:** https://www.bigdatacloud.com/
- **License:** Free client-side reverse-geocode API, explicitly designed for
  unauthenticated browser use; no API key required.
- **Bundled or external:** External API, called at runtime. See
  [PRIVACY.md](PRIVACY.md) for exactly what's sent.

---

Smart Weather's own source code is licensed separately — see
[LICENSE](LICENSE) (MIT).

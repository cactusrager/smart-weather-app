# Privacy Policy

Smart Weather is designed to work without collecting anything about you. This
document describes exactly what data the app touches, where it goes, and what
it stores on your device — matched to what's actually implemented in this
repository, not an aspirational goal.

## What location data is used for

If you choose **"Use my location"**, your browser's Geolocation API gives the
page a latitude/longitude pair. That coordinate:

- Is held only in memory, for the duration of resolving it to a place name
  and fetching the forecast.
- Is sent to **BigDataCloud's reverse-geocode API** (to turn it into a place
  name) and to **Open-Meteo's forecast API** (to get the weather there).
- Is **never written to `localStorage`, a cookie, or anywhere else long-term.**

If you search for a place by name instead, your search text is sent only to
**Open-Meteo's geocoding API** to find matching places.

## What's stored on your device

Smart Weather uses `localStorage` only — no cookies. The keys it writes are:

| Data | Purpose |
|---|---|
| Resolved location (place name, country, admin area, its coordinates, timezone) | So the app can reload your forecast without asking again. This is the *place* Open-Meteo/BigDataCloud returned, not your raw GPS reading. |
| Language preference | Remembers an explicit language choice (or that you want to follow the browser). |
| Theme preference | Light / dark / follow-system. |
| Units preference | Metric or imperial. |
| Reduced-motion preference | Whether you've explicitly asked for fewer animations. |
| Cached forecast responses | A short-lived (10-minute) cache per location + units, so reloading the page doesn't always refetch. |

**To clear all of this:** open Settings and use **"Reset all settings"**, or
clear this site's data from your browser's own site-settings/privacy screen.

## Cookies and tracking

Smart Weather sets **no cookies**, includes **no analytics**, and includes
**no third-party tracking scripts** of any kind. Because of that, there is
**no cookie-consent banner** — there is nothing to consent to. If a future
change ever introduced a cookie or a tracking/analytics script, this document
and that banner-free posture would need to change first; until then, treat
that as something that should never happen silently.

## Every outbound network request this app makes

The app loads Bootstrap and Bootstrap Icons (its CSS framework and icon set)
from the jsDelivr CDN, as a static asset request with no personal data
attached — see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Beyond
that and its own static files (HTML/CSS/JS/fonts), the only requests that
carry any of *your* data are:

1. **Open-Meteo Forecast API** (`api.open-meteo.com`) — sent: latitude,
   longitude, unit preference. Used to fetch current/hourly/daily weather.
2. **Open-Meteo Geocoding API** (`geocoding-api.open-meteo.com`) — sent: your
   search text, chosen language. Used for the place-search dropdown.
3. **BigDataCloud reverse geocoding** (`api.bigdatacloud.net`) — sent:
   latitude, longitude. Used to turn "use my location" into a place name.

None of these services require an API key from you, and none of them are sent
anything beyond what's listed above (no identifiers, no analytics payloads).

## Translations

All UI text is bundled with the app in `js/translations/`. No translation
service is ever called at runtime — switching languages is instant and
offline.

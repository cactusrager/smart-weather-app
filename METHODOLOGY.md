# Methodology

This page explains, in plain language, where Smart Weather's numbers come
from and how it decides what to recommend. All of the logic described here
lives in [`js/recommendations.js`](js/recommendations.js), which is
deliberately kept free of any language-specific text — it only ever outputs
structured data like `{ type: "uv", severity: "high", uvIndex: 8 }`, which the
UI then looks up a translated sentence for.

## Data source

All forecast data — current conditions, hourly and 7-day forecasts,
precipitation probability, UV index, humidity, wind, cloud cover, and
sunrise/sunset — comes from [Open-Meteo](https://open-meteo.com/), a free,
no-API-key weather service. Smart Weather requests everything in one call
with `timezone=auto`, so all displayed times use the *forecast location's*
timezone, not your device's.

Open-Meteo reports weather conditions as numeric
[WMO weather codes](https://www.open-meteo.com/en/docs). Smart Weather maps
every code down to one of eight simplified condition types — `clear`,
`cloudy`, `overcast`, `fog`, `drizzle`, `rain`, `snow`, `thunderstorm` — and
the rest of the app only ever works with those, never the raw numeric code.

## How It Feels: cold and heat guidance

These are simplified, general-purpose bands — not a formal wind-chill or
heat-index formula — meant to give a quick, sensible nudge, not a precise
meteorological calculation.

- **Wind chill guidance** triggers when wind is at least 15 km/h *and* the
  "feels like" temperature is 10°C or below. Severity increases as the feels-like
  temperature drops (10°C → moderate around 5°C and below → high around -5°C
  and below).
- **Heat/hydration guidance** triggers at 28°C and above, increasing in
  severity at 32°C and 36°C.

## What to Wear: UV guidance

UV guidance follows the same exposure categories as the World Health
Organization's Global Solar UV Index public-health convention:

| UV Index | Category |
|---|---|
| 0–2 | Low (no guidance shown — nothing notable) |
| 3–5 | Moderate |
| 6–7 | High |
| 8–10 | Very High |
| 11+ | Extreme |

Reference: [WHO — The ultraviolet (UV) index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index)

## Before You Go: rain guidance

Smart Weather looks at the next 12 hours of hourly forecasts and finds the
single hour with the highest precipitation probability. If that peak is:

- **30–49%** → low-severity rain guidance
- **50–74%** → moderate-severity rain guidance
- **75%+** → high-severity rain guidance (and marked "high confidence")

Below 30%, no rain guidance is shown at all.

## Best time to go outside

For the next 12 hours of daylight, each hour gets a simple "discomfort
score": `2 × rain chance + 3 × UV index + 1.5 × distance from a mild 20°C`.
The hour with the lowest score is surfaced as the day's best window. This is
a heuristic for a quick suggestion, not a guarantee of comfort — it doesn't
account for wind, humidity, or personal preference.

## What these thresholds never do

The thresholds above are **fixed constants**, defined once in
`recommendations.js`, and never change based on your selected language or
theme. Translating the app into a new language only changes the *sentence*
shown for a given `type` + `severity` pair — never the science behind when
that pair is chosen.

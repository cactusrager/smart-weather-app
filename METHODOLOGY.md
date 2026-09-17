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
meteorological calculation. Both are driven by "feels like" (apparent)
temperature, not raw air temperature.

- **Cold guidance** is based on temperature alone, so it fires correctly even
  in still, windless air — a calm -40°C is dangerous whether or not the wind
  is blowing. Bands: 2°C and below → not shown (mild enough); 2 to -10°C →
  moderate; -10 to -25°C → high; -25°C and below → extreme. If wind is also
  at least 20 km/h, the severity is bumped up one tier, since moving air does
  make a given temperature feel worse.
- **Heat guidance** bands: 26°C and above → low; 32°C → moderate; 36°C →
  high; 40°C and above → extreme.

Whichever of the two applies (a location is never both hot and cold at once)
shows in the How It Feels card; if neither applies, the card shows today's
actual temperature with a reassuring "nothing special to prepare for" note
rather than a generic message, so a comfortable 18°C reads differently from
a comfortable 22°C.

## What to Wear: clothing guidance

A color-coded thermometer icon + one-line clothing label, chosen from seven
tiers by "feels like" temperature — this is a direct, visual answer to
"what should I put on," independent of the more detailed health guidance
above. The icon's fill level (empty → full) and color (blue → red) both
track the same tier, so cold and hot are readable at a glance even without
the text.

| Feels like | Tier |
|---|---|
| ≤ -15°C | Heavy coat, hat, gloves & scarf |
| -15 to -5°C | Warm coat |
| -5 to 5°C | Jacket |
| 5 to 12°C | Sweater or light jacket |
| 12 to 18°C | Long sleeves |
| 18 to 24°C | T-shirt |
| > 24°C | T-shirt and shorts |

Two extra badges can appear alongside the pictogram: an umbrella, if today's
peak precipitation probability is 30% or higher; and sunglasses, if today's
peak UV index is 6 or higher (the "high" band and up — see below).

## UV Index

Its own section, always showing today's peak UV index and category — not
just a warning that appears at high values — following the World Health
Organization's Global Solar UV Index public-health convention:

| UV Index | Category |
|---|---|
| 0–2 | Low |
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

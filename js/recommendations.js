// Pure, language-neutral recommendation engine.
//
// This module never imports i18n and never produces user-facing text — it
// only returns structured objects like { type, severity, ... }. The UI layer
// looks up a translation key such as `recommendation.rain.moderate` for each
// object. Keeping this file language-free means the thresholds below are
// identical no matter which language the visitor reads the app in.

// UV Index exposure bands, following the WHO/WMO Global Solar UV Index
// public-health convention (Low 0-2, Moderate 3-5, High 6-7, Very High 8-10,
// Extreme 11+). https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index
const UV_BANDS = [
  { max: 2, severity: "low" },
  { max: 5, severity: "moderate" },
  { max: 7, severity: "high" },
  { max: 10, severity: "very_high" },
  { max: Infinity, severity: "extreme" },
];

// Precipitation-probability bands for the rain recommendation. These are a
// simple, general-purpose split, not a formal meteorological standard.
const RAIN_PROBABILITY_BANDS = [
  { min: 30, max: 50, severity: "low" },
  { min: 50, max: 75, severity: "moderate" },
  { min: 75, max: 101, severity: "high" },
];

// "Feels like" (apparent temperature) bands, in °C, for cold guidance. These
// trigger on temperature alone — Yakutsk in still, windless -45°C air is
// dangerously cold whether or not the wind is blowing, so cold guidance must
// never require wind. Wind is only used afterwards to *bump* the severity up
// one notch, because moving air does make a given temperature feel worse.
// Simplified general-purpose bands, not a formal wind-chill formula.
const COLD_BANDS = [
  { max: -25, severity: "extreme" },
  { max: -10, severity: "high" },
  { max: 2, severity: "moderate" },
  { max: 10, severity: "low" },
];
const COLD_WIND_BUMP_KMH = 20; // wind at/above this bumps cold severity up one tier

// "Feels like" bands, in °C, for heat/hydration guidance. Simplified
// general-purpose bands, not a formal heat-index formula.
const HEAT_BANDS = [
  { min: 40, severity: "extreme" },
  { min: 36, severity: "high" },
  { min: 32, severity: "moderate" },
  { min: 26, severity: "low" },
];

// What-to-wear tiers, in °C "feels like" temperature. Each tier is a single
// clothing pictogram (see js/clothing-icons.js) plus a short translated
// label — this is the direct, visual answer to "what should I put on",
// separate from the more detailed cold/heat health guidance above.
const CLOTHING_TIERS = [
  { max: -15, tier: "extreme_cold" },
  { max: -5, tier: "cold" },
  { max: 5, tier: "cool" },
  { max: 12, tier: "mild_cool" },
  { max: 18, tier: "mild" },
  { max: 24, tier: "warm" },
  { max: Infinity, tier: "hot" },
];

const SEVERITY_ORDER = ["low", "moderate", "high", "extreme"];

const CELSIUS_PER_FAHRENHEIT = 5 / 9;
const KMH_PER_MPH = 1.60934;

function toCelsius(temperature, units) {
  return units === "imperial" ? (temperature - 32) * CELSIUS_PER_FAHRENHEIT : temperature;
}

function toKmh(speed, units) {
  return units === "imperial" ? speed * KMH_PER_MPH : speed;
}

function bandFor(bands, value, key = "max") {
  return bands.find((band) => (key === "max" ? value <= band.max : value >= band.min));
}

function bumpSeverity(severity, steps) {
  const index = SEVERITY_ORDER.indexOf(severity);
  const bumped = Math.min(index + steps, SEVERITY_ORDER.length - 1);
  return SEVERITY_ORDER[bumped];
}

function buildRainRecommendation(hourly) {
  // Look at the next 12 hours for the heaviest expected precipitation probability.
  const window = hourly.slice(0, 12);
  if (window.length === 0) return null;

  const peak = window.reduce((max, hour) =>
    hour.precipitationProbability > max.precipitationProbability ? hour : max
  );

  if (peak.precipitationProbability < RAIN_PROBABILITY_BANDS[0].min) return null;

  const band = RAIN_PROBABILITY_BANDS.find(
    (b) => peak.precipitationProbability >= b.min && peak.precipitationProbability < b.max
  );
  if (!band) return null;

  return {
    type: "rain",
    severity: band.severity,
    confidence: peak.precipitationProbability >= 75 ? "high" : "medium",
    startTime: peak.time,
    endTime: peak.time,
    precipitationProbability: peak.precipitationProbability,
  };
}

/**
 * The UV card is always shown (it's its own section now, not a conditional
 * warning), so this always returns an object — including at low UV, where
 * the severity is simply "low" and the UI shows a reassuring message.
 */
function buildUvRecommendation(daily) {
  const today = daily[0];
  if (!today || today.uvIndexMax == null) return null;

  // Round before banding, not after: the band shown must always match the
  // whole-number UV index displayed to the user (e.g. a raw 5.4 rounding
  // down to a displayed "5" should never be labelled "high").
  const uvIndex = Math.round(today.uvIndexMax);
  const band = bandFor(UV_BANDS, uvIndex);

  return {
    type: "uv",
    severity: band.severity,
    uvIndex,
  };
}

function buildColdRecommendation(current, units) {
  const feelsLikeC = toCelsius(current.feelsLike, units);
  const band = bandFor(COLD_BANDS, feelsLikeC);
  if (!band || band.severity === "low") return null;

  const windKmh = toKmh(current.windSpeed, units);
  const windy = windKmh >= COLD_WIND_BUMP_KMH;

  return {
    type: "cold",
    severity: windy ? bumpSeverity(band.severity, 1) : band.severity,
    temperature: current.feelsLike,
    windy,
  };
}

function buildHeatRecommendation(current, units) {
  const feelsLikeC = toCelsius(current.feelsLike, units);
  const band = HEAT_BANDS.find((b) => feelsLikeC >= b.min);
  if (!band) return null;

  return {
    type: "heat",
    severity: band.severity,
    temperature: current.feelsLike,
  };
}

/**
 * Always returns a clothing tier — "what to wear" should never be blank.
 * `extras` flags simple add-ons (umbrella, sun protection) layered on top of
 * the base tier, driven by today's rain/UV outlook rather than the tier itself.
 */
function buildClothingRecommendation(current, today, units) {
  const feelsLikeC = toCelsius(current.feelsLike, units);
  const { tier } = CLOTHING_TIERS.find((band) => feelsLikeC <= band.max);

  const extras = [];
  if (today && today.precipitationProbabilityMax >= RAIN_PROBABILITY_BANDS[0].min) {
    extras.push("umbrella");
  }
  if (today && today.uvIndexMax >= UV_BANDS[1].max + 1) {
    // Above the "moderate" band's ceiling, i.e. high UV or more.
    extras.push("sunglasses");
  }

  return {
    type: "clothing",
    tier,
    extras,
    temperature: current.feelsLike,
  };
}

/**
 * Picks the most comfortable stretch of daylight in the next 12 hours:
 * lowest combined score of rain chance, UV, and distance from a mild 20°C.
 * Returns null if there's no daytime data available (e.g. it's already night
 * with no more daylight hours in range).
 */
function buildBestWindow(hourly, units) {
  const window = hourly.slice(0, 12).filter((hour) => hour.isDay);
  if (window.length === 0) return null;

  let best = null;
  let bestScore = Infinity;

  for (const hour of window) {
    const tempC = toCelsius(hour.temperature, units);
    const score =
      hour.precipitationProbability * 2 + hour.uvIndex * 3 + Math.abs(tempC - 20) * 1.5;
    if (score < bestScore) {
      bestScore = score;
      best = hour;
    }
  }

  if (!best) return null;

  return {
    type: "best_window",
    startTime: best.time,
    temperature: best.temperature,
    precipitationProbability: best.precipitationProbability,
    uvIndex: best.uvIndex,
  };
}

/**
 * Runs the full engine over normalized weather data.
 * `units` is "metric" | "imperial" — needed only so thresholds (defined in
 * metric) can be compared correctly against imperial input values.
 *
 * Returns:
 * {
 *   feelsLike: [...],   // cold / heat health guidance (0 or 1 item)
 *   wear: [...],        // clothing tier pictogram (always 1 item)
 *   uv: {...} | null,   // today's UV index, always shown when data exists
 *   beforeYouGo: [...], // rain recommendation + best window
 * }
 */
export function buildRecommendations(weatherData, units) {
  const { current, hourly, daily } = weatherData;
  const today = daily[0];

  const cold = buildColdRecommendation(current, units);
  const heat = buildHeatRecommendation(current, units);
  const clothing = buildClothingRecommendation(current, today, units);
  const uv = buildUvRecommendation(daily);
  const rain = buildRainRecommendation(hourly);
  const bestWindow = buildBestWindow(hourly, units);

  return {
    feelsLike: [cold, heat].filter(Boolean),
    wear: [clothing],
    uv,
    beforeYouGo: [rain, bestWindow].filter(Boolean),
  };
}

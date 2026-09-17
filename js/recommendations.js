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

// Cold + wind guidance is triggered off "feels like" temperature, in °C,
// when wind is making it feel noticeably colder than the air temperature
// alone. Thresholds are simplified general-purpose bands, not a formal
// wind-chill index formula.
const WIND_CHILL_MIN_WIND_KMH = 15;
const WIND_CHILL_BANDS = [
  { max: -5, severity: "high" },
  { max: 5, severity: "moderate" },
  { max: 10, severity: "low" },
];

// Heat + hydration guidance, in °C air temperature. Simplified general-purpose
// bands, not a formal heat-index formula.
const HEAT_BANDS = [
  { min: 36, severity: "high" },
  { min: 32, severity: "moderate" },
  { min: 28, severity: "low" },
];

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

function buildUvRecommendation(daily) {
  const today = daily[0];
  if (!today || today.uvIndexMax == null) return null;

  // Round before banding, not after: the band shown must always match the
  // whole-number UV index displayed to the user (e.g. a raw 5.4 rounding
  // down to a displayed "5" should never be labelled "high").
  const uvIndex = Math.round(today.uvIndexMax);
  const band = bandFor(UV_BANDS, uvIndex);
  if (band.severity === "low") return null; // Nothing worth flagging at low UV.

  return {
    type: "uv",
    severity: band.severity,
    uvIndex,
  };
}

function buildWindChillRecommendation(current, units) {
  const feelsLikeC = toCelsius(current.feelsLike, units);
  const windKmh = toKmh(current.windSpeed, units);

  if (windKmh < WIND_CHILL_MIN_WIND_KMH) return null;

  const band = bandFor(WIND_CHILL_BANDS, feelsLikeC);
  if (!band) return null;

  return {
    type: "wind_chill",
    severity: band.severity,
    temperature: current.temperature,
    windSpeed: current.windSpeed,
  };
}

function buildHeatHydrationRecommendation(current, units) {
  const tempC = toCelsius(current.temperature, units);
  const band = HEAT_BANDS.find((b) => tempC >= b.min);
  if (!band) return null;

  return {
    type: "heat_hydration",
    severity: band.severity,
    temperature: current.temperature,
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
 *   feelsLike: [...],   // wind_chill / heat_hydration recommendations
 *   wear: [...],        // uv recommendation (clothing/sun protection angle)
 *   beforeYouGo: [...], // rain recommendation + best window
 * }
 */
export function buildRecommendations(weatherData, units) {
  const { current, hourly, daily } = weatherData;

  const windChill = buildWindChillRecommendation(current, units);
  const heat = buildHeatHydrationRecommendation(current, units);
  const uv = buildUvRecommendation(daily);
  const rain = buildRainRecommendation(hourly);
  const bestWindow = buildBestWindow(hourly, units);

  return {
    feelsLike: [windChill, heat].filter(Boolean),
    wear: [uv].filter(Boolean),
    beforeYouGo: [rain, bestWindow].filter(Boolean),
  };
}

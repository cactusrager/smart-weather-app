import { getCachedWeather, saveCachedWeather } from "./storage.js";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// How long a cached forecast stays valid before we bother refetching.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Open-Meteo's WMO weather codes collapsed down to the small set of
// conditionCode strings the rest of the app is allowed to branch on.
// Never compare against a raw WMO number outside this file.
const WMO_TO_CONDITION_CODE = {
  0: "clear",
  1: "clear",
  2: "cloudy",
  3: "overcast",
  45: "fog",
  48: "fog",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  56: "drizzle",
  57: "drizzle",
  61: "rain",
  63: "rain",
  65: "rain",
  66: "rain",
  67: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  85: "snow",
  86: "snow",
  95: "thunderstorm",
  96: "thunderstorm",
  99: "thunderstorm",
};

function toConditionCode(wmoCode) {
  return WMO_TO_CONDITION_CODE[wmoCode] || "cloudy";
}

/** Rounds coordinates to ~1.1km precision so nearby requests share a cache entry. */
function cacheKeyFor(latitude, longitude, units) {
  return `${latitude.toFixed(2)},${longitude.toFixed(2)},${units}`;
}

/**
 * Fetches and normalizes the forecast for a location. `units` is
 * "metric" | "imperial". Uses a 10-minute localStorage cache keyed by
 * rounded coordinates + units, so switching units or location always
 * refetches, but reloading the page usually doesn't.
 */
export async function fetchWeather(latitude, longitude, units, { signal } = {}) {
  const cacheKey = cacheKeyFor(latitude, longitude, units);
  const cached = getCachedWeather(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = buildForecastUrl(latitude, longitude, units);
  const response = await fetch(url, { signal });

  if (!response.ok) {
    if (response.status === 429) {
      throw Object.assign(new Error("Weather API rate limit exceeded"), { code: "rate_limited" });
    }
    throw Object.assign(new Error(`Weather request failed with status ${response.status}`), {
      code: "network",
    });
  }

  const raw = await response.json();
  const data = normalizeForecast(raw);

  saveCachedWeather(cacheKey, { fetchedAt: Date.now(), data });
  return data;
}

function buildForecastUrl(latitude, longitude, units) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "cloud_cover",
      "weather_code",
      "is_day",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "weather_code",
      "precipitation_probability",
      "precipitation",
      "uv_index",
      "is_day",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_probability_max",
    ].join(",")
  );

  if (units === "imperial") {
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("wind_speed_unit", "mph");
    url.searchParams.set("precipitation_unit", "inch");
  }

  return url;
}

function normalizeForecast(raw) {
  return {
    timezone: raw.timezone,
    current: normalizeCurrent(raw.current),
    hourly: normalizeHourly(raw.hourly),
    daily: normalizeDaily(raw.daily),
  };
}

function normalizeCurrent(current) {
  return {
    time: current.time,
    conditionCode: toConditionCode(current.weather_code),
    temperature: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    cloudCover: current.cloud_cover,
    isDay: current.is_day === 1,
  };
}

function normalizeHourly(hourly) {
  const entries = [];
  for (let i = 0; i < hourly.time.length; i++) {
    entries.push({
      time: hourly.time[i],
      conditionCode: toConditionCode(hourly.weather_code[i]),
      temperature: hourly.temperature_2m[i],
      precipitationProbability: hourly.precipitation_probability[i],
      precipitationAmount: hourly.precipitation[i],
      uvIndex: hourly.uv_index[i],
      isDay: hourly.is_day[i] === 1,
    });
  }
  return entries;
}

function normalizeDaily(daily) {
  const entries = [];
  for (let i = 0; i < daily.time.length; i++) {
    entries.push({
      date: daily.time[i],
      conditionCodeMax: toConditionCode(daily.weather_code[i]),
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      uvIndexMax: daily.uv_index_max[i],
      precipitationProbabilityMax: daily.precipitation_probability_max[i],
    });
  }
  return entries;
}

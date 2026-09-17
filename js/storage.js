// Typed helpers around localStorage. Every key the app uses lives here so it's
// easy to see, at a glance, exactly what we persist on a user's device.

const KEYS = {
  LOCATION: "smartweather.location",
  LANGUAGE: "smartweather.language",
  THEME: "smartweather.theme",
  UNITS: "smartweather.units",
  REDUCED_MOTION: "smartweather.reducedMotion",
  WEATHER_CACHE_PREFIX: "smartweather.weatherCache.",
};

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    // Corrupt or unavailable storage should never crash the app.
    return null;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or disabled (e.g. private browsing). Fail silently;
    // the app still works, it just won't remember preferences.
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

/**
 * The resolved, low-precision place the user is viewing weather for.
 * We deliberately never store raw high-precision GPS coordinates here —
 * only the place Open-Meteo already told us about (name + its own lat/lon).
 * Shape: { name, admin1, country, latitude, longitude, timezone }
 */
export function getSavedLocation() {
  return readJSON(KEYS.LOCATION);
}

export function saveLocation(location) {
  writeJSON(KEYS.LOCATION, location);
}

export function clearLocation() {
  remove(KEYS.LOCATION);
}

/** Explicit language code chosen by the user, or null to follow the browser. */
export function getSavedLanguage() {
  return readJSON(KEYS.LANGUAGE);
}

export function saveLanguage(languageCode) {
  writeJSON(KEYS.LANGUAGE, languageCode);
}

export function clearSavedLanguage() {
  remove(KEYS.LANGUAGE);
}

/** "light" | "dark" | null (null = follow the OS). */
export function getSavedTheme() {
  return readJSON(KEYS.THEME);
}

export function saveTheme(theme) {
  writeJSON(KEYS.THEME, theme);
}

/** "metric" | "imperial". */
export function getSavedUnits() {
  return readJSON(KEYS.UNITS);
}

export function saveUnits(units) {
  writeJSON(KEYS.UNITS, units);
}

export function getSavedReducedMotion() {
  return readJSON(KEYS.REDUCED_MOTION);
}

export function saveReducedMotion(enabled) {
  writeJSON(KEYS.REDUCED_MOTION, enabled);
}

/**
 * Weather responses are cached per rounded coordinate so refreshing the page,
 * or briefly losing connectivity, doesn't force an immediate refetch.
 */
export function getCachedWeather(cacheKey) {
  return readJSON(KEYS.WEATHER_CACHE_PREFIX + cacheKey);
}

export function saveCachedWeather(cacheKey, payload) {
  writeJSON(KEYS.WEATHER_CACHE_PREFIX + cacheKey, payload);
}

/** Removes every cached weather entry, e.g. when units change. */
export function clearAllWeatherCache() {
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEYS.WEATHER_CACHE_PREFIX)) {
      toRemove.push(key);
    }
  }
  toRemove.forEach(remove);
}

/** Wipes every Smart Weather key, used by the "reset settings" action. */
export function resetAllSettings() {
  clearLocation();
  clearSavedLanguage();
  remove(KEYS.THEME);
  remove(KEYS.UNITS);
  remove(KEYS.REDUCED_MOTION);
  clearAllWeatherCache();
}

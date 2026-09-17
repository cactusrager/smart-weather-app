// Forward search (place name -> coordinates) via the Open-Meteo Geocoding API,
// and reverse lookup (coordinates -> place name) via BigDataCloud.
//
// Both are free, keyless, and CORS-enabled for direct browser use. We never
// use Nominatim for reverse geocoding here: its usage policy discourages
// unauthenticated client-side/bulk requests, which is exactly what this app
// would be doing.

const FORWARD_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_GEOCODING_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

/**
 * Searches for places matching `query`. `language` should be one of the
 * app's supported locale codes (e.g. "en", "de", "fr", "it") — Open-Meteo
 * uses it to localize result names where it has a translation.
 *
 * Returns an array of normalized places:
 * { name, admin1, country, latitude, longitude, timezone }
 */
export async function searchPlaces(query, language, { signal } = {}) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(FORWARD_GEOCODING_URL);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const data = await response.json();
  const results = data.results || [];
  return results.map(normalizeForwardResult);
}

function normalizeForwardResult(result) {
  return {
    name: result.name,
    admin1: result.admin1 || "",
    country: result.country || "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

/**
 * Resolves { latitude, longitude } (kept only in memory by the caller) to a
 * human-readable place. Returns the same normalized shape as searchPlaces,
 * but without a timezone — the caller should fetch weather with
 * timezone=auto and use the timezone Open-Meteo returns instead.
 */
export async function reverseGeocode(latitude, longitude, { signal } = {}) {
  const url = new URL(REVERSE_GEOCODING_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", "en");

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Reverse geocoding request failed with status ${response.status}`);
  }

  const data = await response.json();
  const name = data.city || data.locality || data.principalSubdivision || "Unknown location";

  return {
    name,
    admin1: data.principalSubdivision || "",
    country: data.countryName || "",
    latitude,
    longitude,
    timezone: undefined,
  };
}

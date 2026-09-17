// Entry point / orchestration. This file wires the other modules together
// following the app's fixed UX flow:
//
//   language -> location -> fetch weather -> normalize -> recommendations
//   -> localize + render
//
// It holds the one mutable `AppState` object; every other module is either
// pure (recommendations.js, weather-api.js's normalizers) or a narrow wrapper
// around a browser/network API (geolocation.js, geocoding.js, storage.js).

import * as storage from "./storage.js";
import * as i18n from "./i18n.js";
import * as ui from "./ui.js";
import { requestCurrentPosition } from "./geolocation.js";
import { searchPlaces, reverseGeocode } from "./geocoding.js";
import { fetchWeather } from "./weather-api.js";
import { buildRecommendations } from "./recommendations.js";

const SEARCH_DEBOUNCE_MS = 350;

const AppState = {
  units: storage.getSavedUnits() || "metric",
  theme: storage.getSavedTheme() || "system",
  reducedMotion: storage.getSavedReducedMotion() ?? false,
  place: storage.getSavedLocation(),
  weather: null,
  recommendations: null,
};

let searchDebounceTimer = null;
let searchAbortController = null;

function init() {
  applyTheme(AppState.theme);
  applyReducedMotion(AppState.reducedMotion);

  i18n.applyDocumentLanguageMetadata();
  ui.applyStaticTranslations();
  ui.renderLanguageSelector(handleLanguageSelected);
  ui.updateSettingsControls(AppState);

  wireLocationControls();
  wireSettingsControls();
  wireAnnouncer();

  i18n.onLanguageChange(() => {
    ui.applyStaticTranslations();
    ui.renderLanguageSelector(handleLanguageSelected);
    ui.updateSettingsControls(AppState);
    if (AppState.place) {
      ui.setLocationDisplayText(AppState.place);
    }
    if (AppState.weather && AppState.recommendations) {
      renderCurrentWeather();
    }
  });

  if (AppState.place) {
    ui.setLocationDisplayText(AppState.place);
    loadWeatherForCurrentLocation();
  } else {
    ui.showLocationConsentCard();
  }
}

// ---------- Location flow ----------

function wireLocationControls() {
  document.getElementById("use-my-location-button").addEventListener("click", handleUseMyLocation);
  document.getElementById("search-instead-button").addEventListener("click", () => {
    ui.showLocationSearch();
  });
  document.getElementById("location-display-button").addEventListener("click", () => {
    ui.showLocationConsentCard();
  });
  document.getElementById("change-location-button").addEventListener("click", () => {
    bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("settings-panel")).hide();
    ui.showLocationConsentCard();
  });

  const searchInput = document.getElementById("location-search-input");
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    const query = searchInput.value;
    searchDebounceTimer = setTimeout(() => runLocationSearch(query), SEARCH_DEBOUNCE_MS);
  });
}

async function handleUseMyLocation() {
  ui.setLocationSearchStatus(i18n.t("location.resolving"));
  try {
    const { latitude, longitude } = await requestCurrentPosition();
    const place = await reverseGeocode(latitude, longitude);
    await selectLocation(place);
  } catch (error) {
    const key = error.code === "denied" || error.code === "unavailable" || error.code === "timeout" || error.code === "unsupported"
      ? error.code
      : "reverseGeocodeFailed";
    ui.showLocationSearch();
    ui.setLocationSearchStatus(i18n.t(`locationErrors.${key}`));
  }
}

async function runLocationSearch(query) {
  if (searchAbortController) searchAbortController.abort();

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    ui.clearLocationSearchResults();
    ui.setLocationSearchStatus("");
    return;
  }

  searchAbortController = new AbortController();
  ui.setLocationSearchStatus(i18n.t("location.searching"));

  try {
    const results = await searchPlaces(trimmed, i18n.getLanguage(), { signal: searchAbortController.signal });
    ui.renderLocationSearchResults(results, selectLocation);
    ui.setLocationSearchStatus(results.length === 0 ? i18n.t("location.noResults") : "");
  } catch (error) {
    if (error.name === "AbortError") return;
    ui.setLocationSearchStatus(i18n.t("locationErrors.searchFailed"));
  }
}

async function selectLocation(place) {
  AppState.place = place;
  storage.saveLocation(place);
  storage.clearAllWeatherCache();

  ui.hideLocationConsentCard();
  ui.hideLocationSearch();
  ui.setLocationDisplayText(place);

  await loadWeatherForCurrentLocation();
}

// ---------- Weather flow ----------

async function loadWeatherForCurrentLocation() {
  const place = AppState.place;
  if (!place) return;

  ui.showLoadingState();

  try {
    const weather = await fetchWeather(place.latitude, place.longitude, AppState.units);
    AppState.weather = weather;
    AppState.recommendations = buildRecommendations(weather, AppState.units);
    renderCurrentWeather();
    ui.showWeatherContent();
  } catch (error) {
    const bodyKey = error.code === "rate_limited" ? "errors.rateLimited" : "errors.networkBody";
    ui.showErrorState("errors.networkTitle", bodyKey);
  }
}

function renderCurrentWeather() {
  ui.renderWeather({
    place: AppState.place,
    weather: AppState.weather,
    recommendations: AppState.recommendations,
    units: AppState.units,
  });
}

// ---------- Settings ----------

function wireSettingsControls() {
  document.getElementById("units-metric").addEventListener("change", () => handleUnitsChanged("metric"));
  document.getElementById("units-imperial").addEventListener("change", () => handleUnitsChanged("imperial"));

  document.getElementById("theme-system").addEventListener("change", () => handleThemeChanged("system"));
  document.getElementById("theme-light").addEventListener("change", () => handleThemeChanged("light"));
  document.getElementById("theme-dark").addEventListener("change", () => handleThemeChanged("dark"));

  document.getElementById("settings-language-follow").addEventListener("change", () => i18n.followBrowserLanguage());
  i18n.SUPPORTED_LANGUAGES.forEach((code) => {
    document.getElementById(`settings-language-${code}`).addEventListener("change", () => handleLanguageSelected(code));
  });

  document.getElementById("reduced-motion-toggle").addEventListener("change", (event) => {
    AppState.reducedMotion = event.target.checked;
    storage.saveReducedMotion(AppState.reducedMotion);
    applyReducedMotion(AppState.reducedMotion);
  });

  document.getElementById("reset-settings-button").addEventListener("click", handleResetSettings);
  document.getElementById("error-retry-button").addEventListener("click", loadWeatherForCurrentLocation);
}

function handleLanguageSelected(code) {
  if (code === "follow") {
    i18n.followBrowserLanguage();
  } else {
    i18n.setLanguage(code);
  }
}

async function handleUnitsChanged(units) {
  if (units === AppState.units) return;
  AppState.units = units;
  storage.saveUnits(units);
  storage.clearAllWeatherCache();
  if (AppState.place) {
    await loadWeatherForCurrentLocation();
  }
}

function handleThemeChanged(theme) {
  AppState.theme = theme;
  storage.saveTheme(theme === "system" ? null : theme);
  applyTheme(theme);
}

const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
systemThemeQuery.addEventListener("change", () => {
  if (AppState.theme === "system") {
    applySystemBsTheme();
  }
});

function applyTheme(theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    applySystemBsTheme();
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    // Bootstrap's own dark-mode-aware styles (offcanvas, dropdowns, form
    // controls) follow [data-bs-theme] independently of our CSS variables.
    document.documentElement.setAttribute("data-bs-theme", theme);
  }
}

function applySystemBsTheme() {
  document.documentElement.setAttribute("data-bs-theme", systemThemeQuery.matches ? "dark" : "light");
}

function applyReducedMotion(enabled) {
  document.documentElement.setAttribute("data-reduced-motion", String(enabled));
}

function handleResetSettings() {
  // eslint-disable-next-line no-alert -- a native confirm is the simplest
  // reliable way to guard a destructive action with zero extra dependencies.
  const confirmed = window.confirm(i18n.t("settings.resetConfirm"));
  if (!confirmed) return;

  storage.resetAllSettings();
  window.location.reload();
}

// ---------- Accessibility announcements ----------

function wireAnnouncer() {
  const region = document.getElementById("a11y-announcer");
  document.addEventListener("smartweather:announce", (event) => {
    region.textContent = event.detail;
  });
}

// Called last, once every function and const above it exists — `init` reads
// `systemThemeQuery` (via applyTheme) before that const's own line runs
// otherwise, which throws in a module's strict temporal-dead-zone scoping.
init();

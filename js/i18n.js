import en from "./translations/en.js";
import de from "./translations/de.js";
import fr from "./translations/fr.js";
import it from "./translations/it.js";
import { getSavedLanguage, saveLanguage } from "./storage.js";

export const SUPPORTED_LANGUAGES = ["en", "de", "fr", "it"];

const TRANSLATIONS = { en, de, fr, it };

// This app is built for a multilingual audience where German/French/Italian
// map to Swiss regional conventions (date/number formatting), while English
// uses a general international default. Only used for Intl formatting —
// never affects which translation strings are shown.
const INTL_LOCALE_BY_LANGUAGE = {
  en: "en-US",
  de: "de-CH",
  fr: "fr-CH",
  it: "it-CH",
};

let currentLanguage = resolveInitialLanguage();
const changeListeners = new Set();

function resolveInitialLanguage() {
  const saved = getSavedLanguage();
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;

  const browserLanguages = navigator.languages || [navigator.language || "en"];
  for (const tag of browserLanguages) {
    const base = tag.slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(base)) return base;
  }

  return "en";
}

export function getLanguage() {
  return currentLanguage;
}

export function getLocale() {
  return INTL_LOCALE_BY_LANGUAGE[currentLanguage];
}

/**
 * Switches the active language at runtime (no page reload). `persist: false`
 * is used for the "follow browser" mode, which re-detects on every visit
 * instead of locking in whatever the browser reported once.
 */
export function setLanguage(languageCode, { persist = true } = {}) {
  if (!SUPPORTED_LANGUAGES.includes(languageCode)) return;

  currentLanguage = languageCode;
  if (persist) {
    saveLanguage(languageCode);
  }

  applyDocumentLanguageMetadata();
  changeListeners.forEach((listener) => listener(currentLanguage));
}

/** Reverts to following the browser's language, forgetting any explicit choice. */
export function followBrowserLanguage() {
  saveLanguage(null);
  const browserLanguages = navigator.languages || [navigator.language || "en"];
  let detected = "en";
  for (const tag of browserLanguages) {
    const base = tag.slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(base)) {
      detected = base;
      break;
    }
  }
  setLanguage(detected, { persist: false });
}

export function isFollowingBrowserLanguage() {
  return getSavedLanguage() === null;
}

export function onLanguageChange(listener) {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

/** Looks up a dot-path key (e.g. "recommendation.rain.high") and fills in {placeholders}. */
export function t(key, params = {}) {
  const template = lookup(TRANSLATIONS[currentLanguage], key) ?? lookup(TRANSLATIONS.en, key);

  if (template === undefined) {
    console.warn(`Missing translation key: ${key}`);
    return key;
  }

  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  );
}

function lookup(dictionary, key) {
  return key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

/** Updates <html lang>, the document title, and other page-level metadata. */
export function applyDocumentLanguageMetadata() {
  document.documentElement.lang = currentLanguage;
  document.title = `${t("app.name")} — ${t("app.tagline")}`;
}

// ---------- Intl-backed formatting helpers ----------
// All dates/times respect the forecast location's own timezone (passed in as
// `timeZone`), not the visitor's browser timezone, per the app's locked-in
// i18n decisions.

export function formatTemperature(value, units) {
  const unitKey = units === "imperial" ? "fahrenheit" : "celsius";
  const rounded = Math.round(value);
  return `${new Intl.NumberFormat(getLocale()).format(rounded)}${t(`units.${unitKey}`)}`;
}

export function formatWindSpeed(value, units) {
  const unitKey = units === "imperial" ? "mph" : "kmh";
  const rounded = Math.round(value);
  return `${new Intl.NumberFormat(getLocale()).format(rounded)} ${t(`units.${unitKey}`)}`;
}

export function formatPercent(value) {
  return new Intl.NumberFormat(getLocale(), { style: "percent", maximumFractionDigits: 0 }).format(
    value / 100
  );
}

export function formatHour(isoString, timeZone) {
  return new Intl.DateTimeFormat(getLocale(), {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(isoString));
}

export function formatWeekday(isoDateString, timeZone) {
  return new Intl.DateTimeFormat(getLocale(), { weekday: "short", timeZone }).format(
    new Date(isoDateString)
  );
}

export function formatShortDate(isoDateString, timeZone) {
  return new Intl.DateTimeFormat(getLocale(), { month: "short", day: "numeric", timeZone }).format(
    new Date(isoDateString)
  );
}

/** "today" / "tomorrow" / a weekday name, using Intl.RelativeTimeFormat where possible. */
export function formatRelativeDay(isoDateString, timeZone) {
  const target = new Date(isoDateString);
  const now = new Date();

  const todayLabel = new Intl.DateTimeFormat("en-CA", { timeZone }).format(now); // YYYY-MM-DD, stable to diff
  const targetLabel = new Intl.DateTimeFormat("en-CA", { timeZone }).format(target);
  const dayDiff = Math.round((Date.parse(targetLabel) - Date.parse(todayLabel)) / 86_400_000);

  if (dayDiff === 0 || dayDiff === 1) {
    const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });
    return rtf.format(dayDiff, "day");
  }

  return formatWeekday(isoDateString, timeZone);
}

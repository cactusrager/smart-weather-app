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
//
// Open-Meteo (requested with timezone=auto) already gives us every date/time
// string as plain local wall-clock time *at the forecast location* — e.g.
// "2026-09-17T14:00" means 2pm there, with no UTC offset written down.
// JavaScript's Date parser does NOT treat that as "local time at some named
// zone": a date-only string parses as UTC midnight, while a date+time string
// without an offset parses as local time *in the visitor's own browser*.
// Passing either straight into `new Date()` and then asking Intl to convert
// it into the forecast location's timeZone would silently shift it by
// whatever the offset difference between the visitor and that location is.
//
// So instead: parse the wall-clock numbers directly out of the string, and
// anchor them to UTC ourselves. Formatting that anchored instant with
// timeZone: "UTC" then reproduces exactly the numbers we parsed, and we
// still get full Intl benefits (translated weekday/month names, the
// locale's preferred hour cycle) for free. This function never performs a
// real timezone conversion — the string is already the time we want to show.
function parseLocalParts(isoString) {
  const [datePart, timePart] = isoString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = (timePart || "0:0").split(":").map(Number);
  return { year, month, day, hour, minute };
}

function anchorToUtc(isoString) {
  const { year, month, day, hour, minute } = parseLocalParts(isoString);
  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

export function formatTemperature(value, units) {
  const unitKey = units === "imperial" ? "fahrenheit" : "celsius";
  // Math.round(-0.3) is -0, and Intl.NumberFormat dutifully prints that as
  // "-0" — technically correct, but reads as a mistake. Normalize it away.
  const rounded = Math.round(value) || 0;
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

export function formatHour(isoString) {
  return new Intl.DateTimeFormat(getLocale(), {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(anchorToUtc(isoString));
}

export function formatWeekday(isoDateString) {
  return new Intl.DateTimeFormat(getLocale(), { weekday: "short", timeZone: "UTC" }).format(
    anchorToUtc(isoDateString)
  );
}

export function formatShortDate(isoDateString) {
  return new Intl.DateTimeFormat(getLocale(), { month: "short", day: "numeric", timeZone: "UTC" }).format(
    anchorToUtc(isoDateString)
  );
}

/**
 * "today" / "tomorrow" / a weekday name, using Intl.RelativeTimeFormat where
 * possible. `todayDateString` should be the forecast location's own idea of
 * "today" — i.e. weather.daily[0].date — not the browser's clock, so this
 * never needs a timezone conversion either.
 */
export function formatRelativeDay(isoDateString, todayDateString) {
  const dayDiff = Math.round(
    (anchorToUtc(isoDateString) - anchorToUtc(todayDateString)) / 86_400_000
  );

  if (dayDiff === 0 || dayDiff === 1) {
    const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" });
    return rtf.format(dayDiff, "day");
  }

  return formatWeekday(isoDateString);
}

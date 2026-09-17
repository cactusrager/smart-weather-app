// DOM rendering only — no fetching, no business logic. Every function here
// takes already-computed data (weather, recommendations, settings) and
// updates the page. app.js decides *when* to call these.

import {
  t,
  getLanguage,
  SUPPORTED_LANGUAGES,
  isFollowingBrowserLanguage,
  formatTemperature,
  formatWindSpeed,
  formatPercent,
  formatHour,
  formatRelativeDay,
} from "./i18n.js";

// Bootstrap Icons class per normalized conditionCode + isDay.
const CONDITION_ICONS = {
  clear: { day: "bi-sun", night: "bi-moon-stars" },
  cloudy: { day: "bi-cloud-sun", night: "bi-cloud-moon" },
  overcast: { day: "bi-clouds", night: "bi-clouds" },
  fog: { day: "bi-cloud-fog2", night: "bi-cloud-fog2" },
  drizzle: { day: "bi-cloud-drizzle", night: "bi-cloud-drizzle" },
  rain: { day: "bi-cloud-rain", night: "bi-cloud-rain" },
  snow: { day: "bi-snow", night: "bi-snow" },
  thunderstorm: { day: "bi-cloud-lightning-rain", night: "bi-cloud-lightning-rain" },
};

const SEVERITY_ICON = {
  low: "bi-info-circle",
  moderate: "bi-exclamation-circle",
  high: "bi-exclamation-triangle-fill",
  very_high: "bi-exclamation-triangle-fill",
  extreme: "bi-exclamation-triangle-fill",
};

function conditionIconClass(conditionCode, isDay) {
  const entry = CONDITION_ICONS[conditionCode] || CONDITION_ICONS.cloudy;
  return isDay ? entry.day : entry.night;
}

function el(id) {
  return document.getElementById(id);
}

// ---------- Static text (anything marked with data-i18n-*) ----------

export function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n-text]").forEach((node) => {
    node.textContent = t(node.dataset.i18nText);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });
}

// ---------- Language selector ----------

export function renderLanguageSelector(onSelect) {
  const menu = el("language-selector-menu");
  menu.innerHTML = "";

  const followItem = buildLanguageMenuItem(t("language.followBrowser"), "follow", onSelect);
  menu.appendChild(followItem);

  SUPPORTED_LANGUAGES.forEach((code) => {
    menu.appendChild(buildLanguageMenuItem(t(`language.${code}`), code, onSelect));
  });

  updateLanguageSelectorLabel();
}

function buildLanguageMenuItem(label, value, onSelect) {
  const li = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dropdown-item";
  button.textContent = label;
  button.addEventListener("click", () => onSelect(value));
  li.appendChild(button);
  return li;
}

export function updateLanguageSelectorLabel() {
  el("language-selector-current").textContent = t(`language.${getLanguage()}`);
}

export function updateSettingsLanguageRadios() {
  const followingBrowser = isFollowingBrowserLanguage();
  el("settings-language-follow").checked = followingBrowser;
  SUPPORTED_LANGUAGES.forEach((code) => {
    el(`settings-language-${code}`).checked = !followingBrowser && getLanguage() === code;
  });
}

// ---------- Location ----------

export function showLocationConsentCard() {
  toggleHidden("location-consent-card", false);
  toggleHidden("location-search-section", true);
  setStates({});
}

export function hideLocationConsentCard() {
  toggleHidden("location-consent-card", true);
}

export function showLocationSearch() {
  toggleHidden("location-consent-card", true);
  toggleHidden("location-search-section", false);
  setStates({});
  el("location-search-input").focus();
}

export function hideLocationSearch() {
  toggleHidden("location-search-section", true);
  clearLocationSearchResults();
}

export function setLocationDisplayText(place) {
  el("location-display-text").textContent = place ? place.name : "—";
}

export function setLocationSearchStatus(message) {
  el("location-search-status").textContent = message || "";
}

export function renderLocationSearchResults(places, onSelect) {
  const list = el("location-search-results");
  list.innerHTML = "";

  if (places.length === 0) {
    toggleHidden("location-search-results", true);
    return;
  }

  places.forEach((place) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-item px-3 py-2";
    const parts = [place.name, place.admin1, place.country].filter(Boolean);
    button.textContent = parts.join(", ");
    button.addEventListener("click", () => onSelect(place));

    li.appendChild(button);
    list.appendChild(li);
  });

  toggleHidden("location-search-results", false);
}

export function clearLocationSearchResults() {
  el("location-search-results").innerHTML = "";
  toggleHidden("location-search-results", true);
}

// ---------- Page states ----------

export function showLoadingState() {
  setStates({ loading: true });
}

export function showErrorState(titleKey, bodyKey) {
  el("error-title").textContent = t(titleKey);
  el("error-body").textContent = t(bodyKey);
  setStates({ error: true });
}

export function showWeatherContent() {
  setStates({ content: true });
}

function setStates({ loading = false, error = false, content = false }) {
  toggleHidden("loading-state", !loading);
  toggleHidden("error-state", !error);
  toggleHidden("weather-content", !content);
}

function toggleHidden(id, hidden) {
  const node = el(id);
  if (hidden) {
    node.setAttribute("hidden", "");
  } else {
    node.removeAttribute("hidden");
  }
}

// ---------- Weather rendering ----------

export function renderWeather({ place, weather, recommendations, units }) {
  renderCurrentConditions(place, weather.current, weather.timezone, units);
  renderRecommendationList("how-it-feels-list", recommendations.feelsLike, "feelsLike", units);
  renderRecommendationList("what-to-wear-list", recommendations.wear, "wear", units);
  const beforeYouGoNotices = recommendations.beforeYouGo.filter((item) => item.type !== "best_window");
  renderRecommendationList("before-you-go-list", beforeYouGoNotices, "beforeYouGo", units, weather.timezone);
  renderBestWindow(recommendations.beforeYouGo, weather.timezone);
  renderHourly(weather.hourly, weather.timezone, units);
  renderDaily(weather.daily, weather.timezone, units);

  document.dispatchEvent(
    new CustomEvent("smartweather:announce", {
      detail: t("a11y.weatherUpdatedAnnouncement", { place: place.name }),
    })
  );
}

function renderCurrentConditions(place, current, timeZone, units) {
  const hero = el("current-hero");
  hero.dataset.condition = current.conditionCode;
  hero.dataset.isday = String(current.isDay);

  el("current-location-name").textContent = place.name;
  el("current-condition-icon").className = `bi ${conditionIconClass(current.conditionCode, current.isDay)} current-condition-icon`;
  el("current-temperature").textContent = formatTemperature(current.temperature, units);
  el("current-condition-text").textContent = t(`condition.${current.conditionCode}`);
  el("current-feels-like").textContent = t("current.feelsLike", {
    value: formatTemperature(current.feelsLike, units),
  });
  el("current-humidity").textContent = `${t("current.humidity")}: ${formatPercent(current.humidity)}`;
  el("current-wind").textContent = `${t("current.wind")}: ${formatWindSpeed(current.windSpeed, units)}`;
  el("current-cloud-cover").textContent = `${t("current.cloudCover")}: ${formatPercent(current.cloudCover)}`;
  el("current-updated").textContent = t("current.updated", { time: formatHour(current.time, timeZone) });
}

function renderRecommendationList(listId, items, emptyKey, units, timeZone) {
  const list = el(listId);
  list.innerHTML = "";

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "recommendation-empty";
    li.textContent = t(`recommendation.empty.${emptyKey}`);
    list.appendChild(li);
    return;
  }

  items.forEach((item) => {
    list.appendChild(buildRecommendationListItem(item, units, timeZone));
  });
}

function buildRecommendationListItem(item, units, timeZone) {
  const li = document.createElement("li");
  li.className = "recommendation-item d-flex align-items-start gap-2";

  const icon = document.createElement("i");
  icon.className = `bi ${SEVERITY_ICON[item.severity] || "bi-info-circle"} recommendation-icon severity-${item.severity} mt-1`;
  icon.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.textContent = recommendationText(item, units, timeZone);

  li.append(icon, text);
  return li;
}

function recommendationText(item, units, timeZone) {
  switch (item.type) {
    case "rain":
      return t(`recommendation.rain.${item.severity}`, {
        time: timeZone ? formatHour(item.startTime, timeZone) : item.startTime,
        probability: item.precipitationProbability,
      });
    case "uv":
      return t(`recommendation.uv.${item.severity}`, { uvIndex: item.uvIndex });
    case "wind_chill":
      return t(`recommendation.wind_chill.${item.severity}`, {
        temperature: formatTemperature(item.temperature, units),
      });
    case "heat_hydration":
      return t(`recommendation.heat_hydration.${item.severity}`, {
        temperature: formatTemperature(item.temperature, units),
      });
    default:
      return "";
  }
}

function renderBestWindow(beforeYouGoItems, timeZone) {
  const bestWindow = beforeYouGoItems.find((item) => item.type === "best_window");
  if (!bestWindow) {
    toggleHidden("best-window-callout", true);
    return;
  }

  el("best-window-text").textContent = t("recommendation.bestWindow", {
    time: formatHour(bestWindow.startTime, timeZone),
  });
  toggleHidden("best-window-callout", false);
}

function renderHourly(hourly, timeZone, units) {
  const container = el("hourly-list");
  container.innerHTML = "";

  hourly.slice(0, 24).forEach((hour) => {
    const item = document.createElement("div");
    item.className = "hourly-item";

    const time = document.createElement("div");
    time.className = "hourly-time";
    time.textContent = formatHour(hour.time, timeZone);

    const icon = document.createElement("i");
    icon.className = `bi ${conditionIconClass(hour.conditionCode, hour.isDay)} fs-4`;
    icon.setAttribute("aria-hidden", "true");

    const temp = document.createElement("div");
    temp.className = "hourly-temp";
    temp.textContent = formatTemperature(hour.temperature, units);

    item.append(time, icon, temp);
    container.appendChild(item);
  });
}

function renderDaily(daily, timeZone, units) {
  const container = el("daily-list");
  container.innerHTML = "";

  const allTemps = daily.flatMap((day) => [day.tempMin, day.tempMax]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const range = Math.max(maxTemp - minTemp, 1);

  daily.forEach((day) => {
    const row = document.createElement("div");
    row.className = "daily-row";

    const label = document.createElement("div");
    label.textContent = formatRelativeDay(day.date, timeZone);

    const icon = document.createElement("i");
    icon.className = `bi ${conditionIconClass(day.conditionCodeMax, true)}`;
    icon.setAttribute("aria-hidden", "true");

    const barWrap = document.createElement("div");
    barWrap.className = "daily-bar-track";
    const bar = document.createElement("div");
    bar.className = "daily-bar-fill";
    const start = ((day.tempMin - minTemp) / range) * 100;
    const width = ((day.tempMax - day.tempMin) / range) * 100;
    bar.style.marginLeft = `${start}%`;
    bar.style.width = `${Math.max(width, 4)}%`;
    barWrap.appendChild(bar);

    const temps = document.createElement("div");
    temps.className = "text-end";
    temps.textContent = `${formatTemperature(day.tempMax, units)} / ${formatTemperature(day.tempMin, units)}`;

    row.append(label, icon, barWrap, temps);
    container.appendChild(row);
  });
}

// ---------- Settings panel reflection ----------

export function updateSettingsControls({ units, theme, reducedMotion }) {
  el(`units-${units}`).checked = true;
  el(`theme-${theme}`).checked = true;
  el("reduced-motion-toggle").checked = reducedMotion;
  updateSettingsLanguageRadios();
}

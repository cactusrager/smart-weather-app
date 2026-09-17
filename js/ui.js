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
  formatShortDate,
  formatRelativeDay,
} from "./i18n.js";
import { TEMPERATURE_ICON_CLASS, TEMPERATURE_TIER_COLOR, EXTRA_ICON_CLASS } from "./temperature-icons.js";

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

// UV category -> a position (0-100%) along the gauge track and a color
// token, so the same five bands used by recommendations.js drive both the
// label and the gauge fill.
const UV_GAUGE = {
  low: { percent: 15, color: "var(--color-success)" },
  moderate: { percent: 38, color: "var(--color-warning)" },
  high: { percent: 60, color: "var(--color-warning)" },
  very_high: { percent: 82, color: "var(--color-danger)" },
  extreme: { percent: 100, color: "var(--color-danger)" },
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
  renderCurrentConditions(place, weather.current, units);
  renderFeelsLike(recommendations.feelsLike, weather.current, units);
  renderClothingCard(recommendations.wear[0], units);
  renderUvCard(recommendations.uv);

  const beforeYouGoNotices = recommendations.beforeYouGo.filter((item) => item.type !== "best_window");
  renderRecommendationList("before-you-go-list", beforeYouGoNotices, "beforeYouGo");
  renderBestWindow(recommendations.beforeYouGo);

  renderDailyList(weather.daily, weather.hourly, units);

  document.dispatchEvent(
    new CustomEvent("smartweather:announce", {
      detail: t("a11y.weatherUpdatedAnnouncement", { place: place.name }),
    })
  );
}

function renderCurrentConditions(place, current, units) {
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
  el("current-updated").textContent = t("current.updated", { time: formatHour(current.time) });
}

// Generic list renderer, used for "Before You Go" (rain notices). How It
// Feels, What to Wear, and UV Index each have their own richer layout below.
function renderRecommendationList(listId, items, emptyKey) {
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
    list.appendChild(buildRecommendationListItem(item));
  });
}

function buildRecommendationListItem(item) {
  const li = document.createElement("li");
  li.className = "recommendation-item d-flex align-items-start gap-2";

  const icon = document.createElement("i");
  icon.className = `bi ${SEVERITY_ICON[item.severity] || "bi-info-circle"} recommendation-icon severity-${item.severity} mt-1`;
  icon.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.textContent = t(`recommendation.rain.${item.severity}`, {
    time: formatHour(item.startTime),
    probability: item.precipitationProbability,
  });

  li.append(icon, text);
  return li;
}

// ---------- How It Feels ----------

function renderFeelsLike(feelsLikeItems, current, units) {
  const list = el("how-it-feels-list");
  list.innerHTML = "";

  if (feelsLikeItems.length === 0) {
    const li = document.createElement("li");
    li.className = "recommendation-empty";
    li.textContent = t("recommendation.empty.feelsLike", {
      temperature: formatTemperature(current.feelsLike, units),
    });
    list.appendChild(li);
    return;
  }

  feelsLikeItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "recommendation-item d-flex align-items-start gap-2";

    const icon = document.createElement("i");
    const iconClass = item.type === "cold" ? "bi-thermometer-snow" : "bi-thermometer-sun";
    icon.className = `bi ${iconClass} recommendation-icon severity-${item.severity} mt-1`;
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    let sentence = t(`recommendation.${item.type}.${item.severity}`, {
      temperature: formatTemperature(item.temperature, units),
    });
    if (item.type === "cold" && item.windy) {
      sentence += t("recommendation.cold.windNote");
    }
    text.textContent = sentence;

    li.append(icon, text);
    list.appendChild(li);
  });
}

// ---------- What to Wear ----------

function renderClothingCard(clothing, units) {
  const container = el("what-to-wear-content");
  container.innerHTML = "";
  if (!clothing) return;

  const iconColor = TEMPERATURE_TIER_COLOR[clothing.tier] || TEMPERATURE_TIER_COLOR.mild;
  const icon = document.createElement("i");
  icon.className = `bi ${TEMPERATURE_ICON_CLASS[clothing.tier] || "bi-thermometer-half"} clothing-icon`;
  icon.style.color = iconColor;
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("p");
  label.className = "clothing-label mb-0";
  label.textContent = t(`clothing.${clothing.tier}`);

  container.append(icon, label);

  if (clothing.extras.length > 0) {
    const extrasRow = document.createElement("div");
    extrasRow.className = "clothing-extras";
    clothing.extras.forEach((extra) => {
      const extraLabel = t(`clothing.extras.${extra}`);
      const badge = document.createElement("span");
      badge.className = "clothing-extra-badge";

      const extraIcon = document.createElement("i");
      extraIcon.className = `bi ${EXTRA_ICON_CLASS[extra] || "bi-info-circle"}`;
      extraIcon.setAttribute("aria-hidden", "true");

      badge.appendChild(extraIcon);
      badge.append(` ${extraLabel}`);
      extrasRow.appendChild(badge);
    });
    container.appendChild(extrasRow);
  }

  const caption = document.createElement("p");
  caption.className = "clothing-temp form-text mb-0";
  caption.textContent = t("current.feelsLike", { value: formatTemperature(clothing.temperature, units) });
  container.appendChild(caption);
}

// ---------- UV Index ----------

function renderUvCard(uv) {
  const container = el("uv-index-content");
  container.innerHTML = "";
  if (!uv) return;

  const gauge = UV_GAUGE[uv.severity] || UV_GAUGE.low;

  const track = document.createElement("div");
  track.className = "uv-gauge-track";
  const fill = document.createElement("div");
  fill.className = "uv-gauge-fill";
  fill.style.width = `${gauge.percent}%`;
  fill.style.backgroundColor = gauge.color;
  track.appendChild(fill);

  const numberRow = document.createElement("div");
  numberRow.className = "uv-gauge-number";
  numberRow.textContent = uv.uvIndex;

  const categoryLabel = document.createElement("p");
  categoryLabel.className = "uv-gauge-category mb-2";
  categoryLabel.style.color = gauge.color;
  categoryLabel.textContent = t(`uvCategory.${uv.severity}`);

  const sentence = document.createElement("p");
  sentence.className = "form-text mb-0";
  sentence.textContent = t(`recommendation.uv.${uv.severity}`, { uvIndex: uv.uvIndex });

  container.append(numberRow, categoryLabel, track, sentence);
}

function renderBestWindow(beforeYouGoItems) {
  const bestWindow = beforeYouGoItems.find((item) => item.type === "best_window");
  if (!bestWindow) {
    toggleHidden("best-window-callout", true);
    return;
  }

  el("best-window-text").textContent = t("recommendation.bestWindow", {
    time: formatHour(bestWindow.startTime),
  });
  toggleHidden("best-window-callout", false);
}

// ---------- 7-day forecast, each day expandable into its own hourly chart ----------
//
// This replaces the old always-visible, always-scrolling hourly strip: only
// today's row starts expanded, and tapping any other row reveals a compact
// temperature chart for that day in place. Re-rendering on every toggle is
// cheap at this scale (7 rows) and keeps this module's state minimal — the
// full daily/hourly data is cached here purely so a toggle can redraw
// without asking app.js to fetch anything again.
let dailyRenderCache = null;
let expandedDayIndex = 0;

function renderDailyList(daily, hourly, units) {
  dailyRenderCache = { daily, hourly, units };
  expandedDayIndex = 0;
  drawDailyList();
}

function drawDailyList() {
  const { daily, hourly, units } = dailyRenderCache;
  const container = el("daily-list");
  container.innerHTML = "";

  const hoursByDate = groupHourlyByDate(hourly);
  const todayDateString = daily[0].date;

  const allTemps = daily.flatMap((day) => [day.tempMin, day.tempMax]);
  const minTemp = Math.min(...allTemps);
  const maxTemp = Math.max(...allTemps);
  const range = Math.max(maxTemp - minTemp, 1);

  const card = document.createElement("div");
  card.className = "daily-card";

  daily.forEach((day, index) => {
    const isExpanded = index === expandedDayIndex;
    card.appendChild(buildDailyRow(day, index, isExpanded, minTemp, range, todayDateString, units));

    if (isExpanded) {
      const dayHours = hoursByDate.get(day.date);
      if (dayHours && dayHours.length > 0) {
        card.appendChild(buildDailyDetail(dayHours, units));
      }
    }
  });

  container.appendChild(card);
}

function groupHourlyByDate(hourly) {
  const map = new Map();
  hourly.forEach((hour) => {
    const date = hour.time.slice(0, 10); // "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DD"
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(hour);
  });
  return map;
}

function buildDailyRow(day, index, isExpanded, minTemp, range, todayDateString, units) {
  const row = document.createElement("button");
  row.type = "button";
  row.className = `daily-row${isExpanded ? " daily-row-expanded" : ""}`;
  row.setAttribute("aria-expanded", String(isExpanded));
  const dayLabel = formatRelativeDay(day.date, todayDateString);
  row.setAttribute(
    "aria-label",
    t(isExpanded ? "daily.hideHourly" : "daily.showHourly", { day: dayLabel })
  );
  row.addEventListener("click", () => {
    expandedDayIndex = isExpanded ? -1 : index;
    drawDailyList();
  });

  const labelCol = document.createElement("div");
  labelCol.className = "daily-row-label";
  const weekday = document.createElement("div");
  weekday.className = "daily-row-weekday";
  weekday.textContent = dayLabel;
  const date = document.createElement("div");
  date.className = "daily-row-date";
  date.textContent = formatShortDate(day.date);
  labelCol.append(weekday, date);

  const icon = document.createElement("i");
  icon.className = `bi ${conditionIconClass(day.conditionCodeMax, true)} daily-row-icon`;
  icon.setAttribute("aria-hidden", "true");

  const precipChip = document.createElement("div");
  precipChip.className = "daily-precip-chip";
  if (day.precipitationProbabilityMax >= 30) {
    precipChip.innerHTML = `<i class="bi bi-droplet-fill" aria-hidden="true"></i> ${formatPercent(day.precipitationProbabilityMax)}`;
  }

  const rangeCol = document.createElement("div");
  rangeCol.className = "daily-row-range";

  const lowLabel = document.createElement("span");
  lowLabel.className = "daily-row-low";
  lowLabel.textContent = formatTemperature(day.tempMin, units);

  const track = document.createElement("div");
  track.className = "daily-temp-track";
  const start = ((day.tempMin - minTemp) / range) * 100;
  const width = Math.max(((day.tempMax - day.tempMin) / range) * 100, 6);
  const maskStart = document.createElement("div");
  maskStart.className = "daily-temp-track-mask";
  maskStart.style.width = `${start}%`;
  const maskEnd = document.createElement("div");
  maskEnd.className = "daily-temp-track-mask";
  maskEnd.style.width = `${Math.max(100 - start - width, 0)}%`;
  track.append(maskStart, maskEnd);

  const highLabel = document.createElement("span");
  highLabel.className = "daily-row-high";
  highLabel.textContent = formatTemperature(day.tempMax, units);

  rangeCol.append(lowLabel, track, highLabel);

  const chevron = document.createElement("i");
  chevron.className = `bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"} daily-row-chevron`;
  chevron.setAttribute("aria-hidden", "true");

  row.append(labelCol, icon, precipChip, rangeCol, chevron);
  return row;
}

function buildDailyDetail(dayHours, units) {
  const detail = document.createElement("div");
  detail.className = "daily-detail";

  const chart = document.createElement("div");
  chart.className = "hourly-chart";
  chart.innerHTML = buildHourlyChartSvg(dayHours);

  const ticks = document.createElement("div");
  ticks.className = "hourly-chart-ticks";
  dayHours
    .filter((_hour, index) => index % 3 === 0)
    .forEach((hour) => {
      const tick = document.createElement("div");
      tick.className = "hourly-chart-tick";

      const time = document.createElement("div");
      time.className = "hourly-chart-tick-time";
      time.textContent = formatHour(hour.time);

      const icon = document.createElement("i");
      icon.className = `bi ${conditionIconClass(hour.conditionCode, hour.isDay)}`;
      icon.setAttribute("aria-hidden", "true");

      const temp = document.createElement("div");
      temp.className = "hourly-chart-tick-temp";
      temp.textContent = formatTemperature(hour.temperature, units);

      tick.append(time, icon, temp);
      ticks.appendChild(tick);
    });

  detail.append(chart, ticks);
  return detail;
}

/** A minimal, dependency-free line+area chart — no chart library needed for one small curve. */
function buildHourlyChartSvg(hours) {
  const temps = hours.map((hour) => hour.temperature);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = Math.max(max - min, 1);

  const points = hours.map((hour, index) => {
    const x = (index / (hours.length - 1)) * 100;
    const y = 34 - ((hour.temperature - min) / range) * 28; // padded 6..34 in a 0..40 viewBox
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePoints = points.join(" ");
  const areaPoints = `0,40 ${linePoints} 100,40`;

  return `
    <svg class="hourly-chart-svg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <polygon points="${areaPoints}" class="hourly-chart-area"></polygon>
      <polyline points="${linePoints}" class="hourly-chart-line"></polyline>
    </svg>`;
}

// ---------- Settings panel reflection ----------

export function updateSettingsControls({ units, theme, reducedMotion }) {
  el(`units-${units}`).checked = true;
  el(`theme-${theme}`).checked = true;
  el("reduced-motion-toggle").checked = reducedMotion;
  updateSettingsLanguageRadios();
}

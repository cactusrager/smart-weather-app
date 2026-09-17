// English (en). This file is the canonical key set — every other language
// file must define exactly the same keys. i18n.js falls back to this file
// if a key is ever missing elsewhere.
export default {
  app: {
    name: "Smart Weather",
    tagline: "Privacy-first weather, wherever you are.",
  },

  nav: {
    skipToContent: "Skip to main content",
    settingsButton: "Settings",
    languageSelectorLabel: "Language",
  },

  language: {
    followBrowser: "Follow browser",
    en: "English (EN)",
    de: "Deutsch (DE)",
    fr: "Français (FR)",
    it: "Italiano (IT)",
  },

  location: {
    consentTitle: "Use your location?",
    consentBody:
      "Smart Weather uses your location only to fetch the local forecast. It is never stored or sent anywhere else.",
    useMyLocation: "Use my location",
    searchInstead: "Search for a place instead",
    searchPlaceholder: "Search for a city…",
    searchButtonLabel: "Search",
    changeLocation: "Change location",
    noResults: "No places found. Try a different search.",
    searching: "Searching…",
    resolving: "Finding your location…",
    currentLabel: "Current location",
  },

  locationErrors: {
    denied: "Location access was denied. You can search for a place instead.",
    unavailable: "Your location could not be determined. Try searching for a place instead.",
    timeout: "Finding your location took too long. Try searching for a place instead.",
    unsupported: "Your browser doesn't support location detection. Search for a place instead.",
    reverseGeocodeFailed:
      "We found your coordinates but couldn't look up a place name. Try searching instead.",
    searchFailed: "The place search failed. Check your connection and try again.",
  },

  current: {
    feelsLike: "Feels like {value}",
    humidity: "Humidity",
    wind: "Wind",
    cloudCover: "Cloud cover",
    updated: "Updated {time}",
  },

  condition: {
    clear: "Clear sky",
    cloudy: "Partly cloudy",
    overcast: "Overcast",
    fog: "Fog",
    drizzle: "Drizzle",
    rain: "Rain",
    snow: "Snow",
    thunderstorm: "Thunderstorm",
  },

  sections: {
    howItFeels: "How It Feels",
    whatToWear: "What to Wear",
    beforeYouGo: "Before You Go",
    hourlyForecast: "Hourly forecast",
    dailyForecast: "7-day forecast",
    bestWindow: "Best time to go outside today",
  },

  recommendation: {
    rain: {
      low: "Light chance of rain around {time}, about {probability}% likely. An umbrella isn't essential, but it won't hurt.",
      moderate: "Rain looks likely around {time} ({probability}% chance). Bring an umbrella or a waterproof layer.",
      high: "Heavy rain expected around {time} ({probability}% chance). Plan for wet conditions and delays if possible.",
    },
    uv: {
      moderate: "Moderate UV today (index {uvIndex}). Sunscreen is a good idea for extended time outside.",
      high: "High UV today (index {uvIndex}). Wear sunscreen, sunglasses, and a hat if you'll be outside.",
      very_high: "Very high UV today (index {uvIndex}). Seek shade during midday hours and use strong sun protection.",
      extreme: "Extreme UV today (index {uvIndex}). Avoid direct sun during peak hours; sun protection is essential.",
    },
    wind_chill: {
      low: "It feels cooler than the air temperature due to wind. A light jacket should help.",
      moderate: "Wind is making {temperature} feel noticeably colder. Layer up before heading out.",
      high: "Strong wind chill in effect. Cover exposed skin and dress in warm, windproof layers.",
    },
    heat_hydration: {
      low: "It's warm out. Keep some water with you if you'll be outside for a while.",
      moderate: "It's quite hot today. Stay hydrated and take breaks in the shade if possible.",
      high: "Very high temperatures today. Drink water regularly, avoid strenuous activity outdoors, and stay in the shade.",
    },
    bestWindow: "Around {time} looks like the most comfortable stretch to be outside today.",
    empty: {
      feelsLike: "Nothing notable — conditions feel fairly typical right now.",
      wear: "No special sun protection needed right now.",
      beforeYouGo: "No rain expected and no strong outdoor guidance for today.",
    },
  },

  units: {
    celsius: "°C",
    fahrenheit: "°F",
    kmh: "km/h",
    mph: "mph",
    percent: "%",
  },

  settings: {
    title: "Settings",
    close: "Close settings",
    unitsLabel: "Units",
    unitsMetric: "Metric (°C, km/h)",
    unitsImperial: "Imperial (°F, mph)",
    themeLabel: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "Follow system",
    languageLabel: "Language",
    reducedMotionLabel: "Reduce motion",
    reducedMotionHint: "Turns off subtle animations, in addition to your system's own setting.",
    resetButton: "Reset all settings",
    resetConfirm: "This clears your saved location, language, theme, units, and cached forecasts. Continue?",
    resetDone: "Settings have been reset.",
  },

  errors: {
    networkTitle: "Couldn't load the forecast",
    networkBody: "Check your internet connection and try again.",
    rateLimited: "The weather service is temporarily busy. Please try again shortly.",
    retry: "Retry",
    genericTitle: "Something went wrong",
  },

  loading: {
    weather: "Loading the forecast…",
  },

  footer: {
    dataSources: "Weather and geocoding data by Open-Meteo and BigDataCloud.",
    privacy: "Privacy",
    terms: "Terms",
    methodology: "Methodology",
  },

  a11y: {
    weatherRegionLabel: "Current weather and forecast",
    weatherUpdatedAnnouncement: "Weather updated for {place}",
    themeToggleLabel: "Toggle light and dark theme",
    windFromDirection: "wind from {direction}°",
  },
};

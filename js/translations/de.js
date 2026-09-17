// German (de). Must define exactly the same keys as en.js.
export default {
  app: {
    name: "Smart Weather",
    tagline: "Wetter mit Fokus auf Privatsphäre, wo immer du bist.",
  },

  nav: {
    skipToContent: "Zum Hauptinhalt springen",
    settingsButton: "Einstellungen",
    languageSelectorLabel: "Sprache",
  },

  language: {
    followBrowser: "Browsersprache verwenden",
    en: "English (EN)",
    de: "Deutsch (DE)",
    fr: "Français (FR)",
    it: "Italiano (IT)",
  },

  location: {
    consentTitle: "Standort verwenden?",
    consentBody:
      "Smart Weather nutzt deinen Standort ausschließlich, um die lokale Vorhersage abzurufen. Er wird nie gespeichert oder weitergegeben.",
    useMyLocation: "Meinen Standort verwenden",
    searchInstead: "Stattdessen einen Ort suchen",
    searchPlaceholder: "Stadt suchen…",
    searchButtonLabel: "Suchen",
    changeLocation: "Standort ändern",
    noResults: "Keine Orte gefunden. Versuche eine andere Suche.",
    searching: "Suche läuft…",
    resolving: "Standort wird ermittelt…",
    currentLabel: "Aktueller Standort",
  },

  locationErrors: {
    denied: "Der Zugriff auf den Standort wurde verweigert. Du kannst stattdessen einen Ort suchen.",
    unavailable: "Dein Standort konnte nicht ermittelt werden. Suche stattdessen nach einem Ort.",
    timeout: "Die Standortermittlung hat zu lange gedauert. Suche stattdessen nach einem Ort.",
    unsupported: "Dein Browser unterstützt keine Standorterkennung. Suche nach einem Ort.",
    reverseGeocodeFailed:
      "Wir haben deine Koordinaten gefunden, konnten aber keinen Ortsnamen ermitteln. Versuche eine Suche.",
    searchFailed: "Die Ortssuche ist fehlgeschlagen. Prüfe deine Verbindung und versuche es erneut.",
  },

  current: {
    feelsLike: "Gefühlt {value}",
    humidity: "Luftfeuchtigkeit",
    wind: "Wind",
    cloudCover: "Bewölkung",
    updated: "Aktualisiert {time}",
  },

  condition: {
    clear: "Klarer Himmel",
    cloudy: "Teilweise bewölkt",
    overcast: "Bedeckt",
    fog: "Nebel",
    drizzle: "Nieselregen",
    rain: "Regen",
    snow: "Schnee",
    thunderstorm: "Gewitter",
  },

  sections: {
    howItFeels: "Wie es sich anfühlt",
    whatToWear: "Was du anziehen solltest",
    beforeYouGo: "Bevor du losgehst",
    hourlyForecast: "Stündliche Vorhersage",
    dailyForecast: "7-Tage-Vorhersage",
    bestWindow: "Beste Zeit heute für draußen",
  },

  recommendation: {
    rain: {
      low: "Leichte Regenwahrscheinlichkeit gegen {time}, etwa {probability}%. Ein Schirm ist nicht nötig, schadet aber nicht.",
      moderate: "Gegen {time} ist Regen wahrscheinlich ({probability}% Wahrscheinlichkeit). Nimm einen Schirm oder eine wasserdichte Jacke mit.",
      high: "Gegen {time} wird starker Regen erwartet ({probability}% Wahrscheinlichkeit). Plane nasse Bedingungen und mögliche Verzögerungen ein.",
    },
    uv: {
      moderate: "Heute moderate UV-Strahlung (Index {uvIndex}). Sonnencreme ist bei längerem Aufenthalt im Freien sinnvoll.",
      high: "Heute hohe UV-Strahlung (Index {uvIndex}). Trage Sonnencreme, Sonnenbrille und einen Hut im Freien.",
      very_high: "Heute sehr hohe UV-Strahlung (Index {uvIndex}). Meide die Mittagssonne und schütze dich stark.",
      extreme: "Heute extreme UV-Strahlung (Index {uvIndex}). Meide direkte Sonne während der Spitzenzeiten; Sonnenschutz ist unverzichtbar.",
    },
    wind_chill: {
      low: "Durch den Wind fühlt es sich kühler an als die Lufttemperatur. Eine leichte Jacke hilft.",
      moderate: "Der Wind lässt {temperature} deutlich kälter wirken. Zieh dich in Schichten warm an.",
      high: "Starker Windchill-Effekt. Bedecke exponierte Haut und trage warme, winddichte Kleidung in Schichten.",
    },
    heat_hydration: {
      low: "Es ist warm draußen. Nimm etwas Wasser mit, wenn du länger unterwegs bist.",
      moderate: "Es ist heute ziemlich heiß. Trinke ausreichend und mache Pausen im Schatten, wenn möglich.",
      high: "Heute sehr hohe Temperaturen. Trinke regelmäßig Wasser, vermeide anstrengende Aktivitäten im Freien und bleibe im Schatten.",
    },
    bestWindow: "Gegen {time} scheint der angenehmste Zeitraum für draußen zu sein.",
    empty: {
      feelsLike: "Nichts Besonderes – die Bedingungen fühlen sich gerade recht typisch an.",
      wear: "Momentan ist kein besonderer Sonnenschutz nötig.",
      beforeYouGo: "Heute wird kein Regen erwartet und es gibt keine besonderen Hinweise für draußen.",
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
    title: "Einstellungen",
    close: "Einstellungen schließen",
    unitsLabel: "Einheiten",
    unitsMetric: "Metrisch (°C, km/h)",
    unitsImperial: "Imperial (°F, mph)",
    themeLabel: "Design",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeSystem: "Systemeinstellung",
    languageLabel: "Sprache",
    reducedMotionLabel: "Bewegung reduzieren",
    reducedMotionHint: "Deaktiviert dezente Animationen, zusätzlich zur Systemeinstellung.",
    resetButton: "Alle Einstellungen zurücksetzen",
    resetConfirm: "Dies löscht deinen gespeicherten Standort, Sprache, Design, Einheiten und zwischengespeicherte Vorhersagen. Fortfahren?",
    resetDone: "Die Einstellungen wurden zurückgesetzt.",
  },

  errors: {
    networkTitle: "Die Vorhersage konnte nicht geladen werden",
    networkBody: "Prüfe deine Internetverbindung und versuche es erneut.",
    rateLimited: "Der Wetterdienst ist derzeit ausgelastet. Bitte versuche es in Kürze erneut.",
    retry: "Erneut versuchen",
    genericTitle: "Etwas ist schiefgelaufen",
  },

  loading: {
    weather: "Vorhersage wird geladen…",
  },

  footer: {
    dataSources: "Wetter- und Geokodierungsdaten von Open-Meteo und BigDataCloud.",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    methodology: "Methodik",
  },

  a11y: {
    weatherRegionLabel: "Aktuelles Wetter und Vorhersage",
    weatherUpdatedAnnouncement: "Wetter aktualisiert für {place}",
    themeToggleLabel: "Zwischen hellem und dunklem Design wechseln",
    windFromDirection: "Wind aus {direction}°",
  },
};

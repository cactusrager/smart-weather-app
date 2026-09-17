// French (fr). Must define exactly the same keys as en.js.
export default {
  app: {
    name: "Smart Weather",
    tagline: "La météo qui respecte votre vie privée, où que vous soyez.",
  },

  nav: {
    skipToContent: "Aller au contenu principal",
    settingsButton: "Paramètres",
    languageSelectorLabel: "Langue",
  },

  language: {
    followBrowser: "Suivre le navigateur",
    en: "English (EN)",
    de: "Deutsch (DE)",
    fr: "Français (FR)",
    it: "Italiano (IT)",
  },

  location: {
    consentTitle: "Utiliser votre position ?",
    consentBody:
      "Smart Weather utilise votre position uniquement pour récupérer les prévisions locales. Elle n'est jamais stockée ni transmise ailleurs.",
    useMyLocation: "Utiliser ma position",
    searchInstead: "Rechercher un lieu à la place",
    searchPlaceholder: "Rechercher une ville…",
    searchButtonLabel: "Rechercher",
    changeLocation: "Changer de lieu",
    noResults: "Aucun lieu trouvé. Essayez une autre recherche.",
    searching: "Recherche en cours…",
    resolving: "Recherche de votre position…",
    currentLabel: "Position actuelle",
  },

  locationErrors: {
    denied: "L'accès à la position a été refusé. Vous pouvez rechercher un lieu à la place.",
    unavailable: "Votre position n'a pas pu être déterminée. Essayez de rechercher un lieu.",
    timeout: "La localisation a pris trop de temps. Essayez de rechercher un lieu.",
    unsupported: "Votre navigateur ne prend pas en charge la géolocalisation. Recherchez un lieu.",
    reverseGeocodeFailed:
      "Nous avons trouvé vos coordonnées mais n'avons pas pu déterminer un nom de lieu. Essayez une recherche.",
    searchFailed: "La recherche de lieu a échoué. Vérifiez votre connexion et réessayez.",
  },

  current: {
    feelsLike: "Ressenti {value}",
    humidity: "Humidité",
    wind: "Vent",
    cloudCover: "Couverture nuageuse",
    updated: "Mis à jour {time}",
  },

  condition: {
    clear: "Ciel dégagé",
    cloudy: "Partiellement nuageux",
    overcast: "Couvert",
    fog: "Brouillard",
    drizzle: "Bruine",
    rain: "Pluie",
    snow: "Neige",
    thunderstorm: "Orage",
  },

  sections: {
    howItFeels: "Ce que l'on ressent",
    whatToWear: "Comment s'habiller",
    uvIndex: "Indice UV",
    beforeYouGo: "Avant de sortir",
    hourlyForecast: "Prévisions horaires",
    dailyForecast: "Prévisions sur 7 jours",
    dailyForecastHint: "Touchez un jour pour voir ses prévisions horaires.",
    bestWindow: "Meilleur moment pour sortir aujourd'hui",
  },

  uvCategory: {
    low: "Faible",
    moderate: "Modéré",
    high: "Élevé",
    very_high: "Très élevé",
    extreme: "Extrême",
  },

  clothing: {
    extreme_cold: "Couvrez-vous bien : manteau chaud, bonnet, gants et écharpe.",
    cold: "Temps à manteau chaud.",
    cool: "Une veste est une bonne idée.",
    mild_cool: "Un pull ou une veste légère convient bien.",
    mild: "Les manches longues sont agréables.",
    warm: "Temps à t-shirt.",
    hot: "Temps à t-shirt et short.",
    extras: {
      umbrella: "De la pluie est probable plus tard — prenez un parapluie.",
      sunglasses: "L'indice UV est élevé — lunettes de soleil recommandées.",
    },
  },

  recommendation: {
    rain: {
      low: "Faible risque de pluie vers {time}, environ {probability} % de probabilité. Un parapluie n'est pas indispensable, mais peut être utile.",
      moderate: "De la pluie est probable vers {time} ({probability} % de probabilité). Prenez un parapluie ou une veste imperméable.",
      high: "De fortes pluies sont attendues vers {time} ({probability} % de probabilité). Prévoyez des conditions humides et d'éventuels retards.",
    },
    uv: {
      low: "Indice UV faible aujourd'hui ({uvIndex}). Aucune protection solaire particulière n'est nécessaire.",
      moderate: "Indice UV modéré aujourd'hui ({uvIndex}). De la crème solaire est conseillée en cas d'exposition prolongée.",
      high: "Indice UV élevé aujourd'hui ({uvIndex}). Portez crème solaire, lunettes de soleil et un chapeau si vous sortez.",
      very_high: "Indice UV très élevé aujourd'hui ({uvIndex}). Évitez le soleil de midi et protégez-vous fortement.",
      extreme: "Indice UV extrême aujourd'hui ({uvIndex}). Évitez le soleil direct aux heures de pointe ; la protection solaire est indispensable.",
    },
    cold: {
      moderate: "Il fait {temperature} et ça semble froid. Une veste chaude est une bonne idée.",
      high: "Il fait {temperature} — vraiment froid dehors. Habillez-vous chaudement en plusieurs couches avant de sortir.",
      extreme: "Il fait {temperature} — dangereusement froid. Couvrez la peau exposée et limitez le temps passé dehors si possible.",
      windNote: " Le vent accentue encore la sensation de froid.",
    },
    heat: {
      low: "Il fait {temperature}. Gardez de l'eau sur vous si vous sortez un moment.",
      moderate: "Il fait {temperature} — assez chaud. Hydratez-vous bien et faites des pauses à l'ombre si possible.",
      high: "Il fait {temperature} — très chaud. Buvez de l'eau régulièrement, évitez les efforts intenses en extérieur et restez à l'ombre.",
      extreme: "Il fait {temperature} — dangereusement chaud. Évitez toute activité extérieure aux heures de pointe et hydratez-vous bien.",
    },
    bestWindow: "Vers {time} semble être le moment le plus agréable pour sortir aujourd'hui.",
    empty: {
      feelsLike: "Une température agréable de {temperature} en ce moment — rien de particulier à prévoir.",
      beforeYouGo: "Aucune pluie n'est attendue et aucune consigne particulière pour sortir aujourd'hui.",
    },
  },

  daily: {
    showHourly: "Afficher les prévisions horaires pour {day}",
    hideHourly: "Masquer les prévisions horaires pour {day}",
  },

  units: {
    celsius: "°C",
    fahrenheit: "°F",
    kmh: "km/h",
    mph: "mph",
    percent: "%",
  },

  settings: {
    title: "Paramètres",
    close: "Fermer les paramètres",
    unitsLabel: "Unités",
    unitsMetric: "Métrique (°C, km/h)",
    unitsImperial: "Impérial (°F, mph)",
    themeLabel: "Thème",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeSystem: "Suivre le système",
    languageLabel: "Langue",
    reducedMotionLabel: "Réduire les animations",
    reducedMotionHint: "Désactive les animations discrètes, en plus du réglage de votre système.",
    resetButton: "Réinitialiser tous les paramètres",
    resetConfirm: "Cela efface votre position enregistrée, la langue, le thème, les unités et les prévisions en cache. Continuer ?",
    resetDone: "Les paramètres ont été réinitialisés.",
  },

  errors: {
    networkTitle: "Impossible de charger les prévisions",
    networkBody: "Vérifiez votre connexion internet et réessayez.",
    rateLimited: "Le service météo est temporairement surchargé. Merci de réessayer sous peu.",
    retry: "Réessayer",
    genericTitle: "Une erreur s'est produite",
  },

  loading: {
    weather: "Chargement des prévisions…",
  },

  footer: {
    dataSources: "Données météo et géocodage fournies par Open-Meteo et BigDataCloud.",
    privacy: "Confidentialité",
    terms: "Conditions d'utilisation",
    methodology: "Méthodologie",
  },

  a11y: {
    weatherRegionLabel: "Météo actuelle et prévisions",
    weatherUpdatedAnnouncement: "Météo mise à jour pour {place}",
    themeToggleLabel: "Basculer entre le thème clair et sombre",
    windFromDirection: "vent venant de {direction}°",
  },
};

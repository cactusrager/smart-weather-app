// Italian (it). Must define exactly the same keys as en.js.
export default {
  app: {
    name: "Smart Weather",
    tagline: "Meteo attento alla privacy, ovunque tu sia.",
  },

  nav: {
    skipToContent: "Vai al contenuto principale",
    settingsButton: "Impostazioni",
    languageSelectorLabel: "Lingua",
  },

  language: {
    followBrowser: "Segui il browser",
    en: "English (EN)",
    de: "Deutsch (DE)",
    fr: "Français (FR)",
    it: "Italiano (IT)",
  },

  location: {
    consentTitle: "Usare la tua posizione?",
    consentBody:
      "Smart Weather usa la tua posizione solo per recuperare le previsioni locali. Non viene mai salvata né inviata altrove.",
    useMyLocation: "Usa la mia posizione",
    searchInstead: "Cerca invece un luogo",
    searchPlaceholder: "Cerca una città…",
    searchButtonLabel: "Cerca",
    changeLocation: "Cambia luogo",
    noResults: "Nessun luogo trovato. Prova un'altra ricerca.",
    searching: "Ricerca in corso…",
    resolving: "Ricerca della tua posizione…",
    currentLabel: "Posizione attuale",
  },

  locationErrors: {
    denied: "L'accesso alla posizione è stato negato. Puoi cercare un luogo invece.",
    unavailable: "Non è stato possibile determinare la tua posizione. Prova a cercare un luogo.",
    timeout: "La localizzazione ha impiegato troppo tempo. Prova a cercare un luogo.",
    unsupported: "Il tuo browser non supporta il rilevamento della posizione. Cerca un luogo.",
    reverseGeocodeFailed:
      "Abbiamo trovato le tue coordinate ma non siamo riusciti a determinare un nome di luogo. Prova una ricerca.",
    searchFailed: "La ricerca del luogo non è riuscita. Controlla la connessione e riprova.",
  },

  current: {
    feelsLike: "Percepita {value}",
    humidity: "Umidità",
    wind: "Vento",
    cloudCover: "Copertura nuvolosa",
    updated: "Aggiornato {time}",
  },

  condition: {
    clear: "Cielo sereno",
    cloudy: "Parzialmente nuvoloso",
    overcast: "Coperto",
    fog: "Nebbia",
    drizzle: "Pioviggine",
    rain: "Pioggia",
    snow: "Neve",
    thunderstorm: "Temporale",
  },

  sections: {
    howItFeels: "Come ci si sente",
    whatToWear: "Cosa indossare",
    uvIndex: "Indice UV",
    beforeYouGo: "Prima di uscire",
    hourlyForecast: "Previsioni orarie",
    dailyForecast: "Previsioni a 7 giorni",
    dailyForecastHint: "Tocca un giorno per vedere le previsioni orarie.",
    bestWindow: "Momento migliore per uscire oggi",
  },

  uvCategory: {
    low: "Basso",
    moderate: "Moderato",
    high: "Alto",
    very_high: "Molto alto",
    extreme: "Estremo",
  },

  clothing: {
    extreme_cold: "Copriti bene: cappotto pesante, cappello, guanti e sciarpa.",
    cold: "Tempo da cappotto pesante.",
    cool: "Una giacca è una buona idea.",
    mild_cool: "Un maglione o una giacca leggera vanno bene.",
    mild: "Le maniche lunghe sono comode.",
    warm: "Tempo da maglietta.",
    hot: "Tempo da maglietta e pantaloncini.",
    extras: {
      umbrella: "Più tardi è probabile la pioggia: porta un ombrello.",
      sunglasses: "L'indice UV è alto: occhiali da sole consigliati.",
    },
  },

  recommendation: {
    rain: {
      low: "Lieve probabilità di pioggia verso le {time}, circa il {probability}%. Non è indispensabile un ombrello, ma può tornare utile.",
      moderate: "È probabile che piova verso le {time} ({probability}% di probabilità). Porta un ombrello o una giacca impermeabile.",
      high: "Sono previste piogge intense verso le {time} ({probability}% di probabilità). Prevedi condizioni di bagnato e possibili ritardi.",
    },
    uv: {
      low: "Indice UV basso oggi ({uvIndex}). Non serve una protezione solare particolare.",
      moderate: "Indice UV moderato oggi ({uvIndex}). La crema solare è consigliata se resti a lungo all'aperto.",
      high: "Indice UV alto oggi ({uvIndex}). Usa crema solare, occhiali da sole e un cappello se esci.",
      very_high: "Indice UV molto alto oggi ({uvIndex}). Evita il sole di mezzogiorno e proteggiti bene.",
      extreme: "Indice UV estremo oggi ({uvIndex}). Evita il sole diretto nelle ore di punta; la protezione solare è essenziale.",
    },
    cold: {
      moderate: "Ci sono {temperature} e sembra freddo. Una giacca calda è una buona idea.",
      high: "Ci sono {temperature} — fa davvero freddo. Vestiti a strati caldi prima di uscire.",
      extreme: "Ci sono {temperature} — freddo pericoloso. Copri la pelle esposta e limita il tempo all'aperto, se possibile.",
      windNote: " Il vento fa sembrare la temperatura ancora più fredda.",
    },
    heat: {
      low: "Ci sono {temperature}. Porta con te dell'acqua se stai fuori per un po'.",
      moderate: "Ci sono {temperature} — piuttosto caldo. Bevi a sufficienza e fai pause all'ombra, se possibile.",
      high: "Ci sono {temperature} — molto caldo. Bevi acqua regolarmente, evita sforzi intensi all'aperto e resta all'ombra.",
      extreme: "Ci sono {temperature} — caldo pericoloso. Evita attività all'aperto nelle ore di punta e mantieniti idratato.",
    },
    bestWindow: "Verso le {time} sembra il momento più piacevole per uscire oggi.",
    empty: {
      feelsLike: "Una piacevole {temperature} in questo momento: niente di particolare da preparare.",
      beforeYouGo: "Non è prevista pioggia e non ci sono indicazioni particolari per uscire oggi.",
    },
  },

  daily: {
    showHourly: "Mostra le previsioni orarie per {day}",
    hideHourly: "Nascondi le previsioni orarie per {day}",
  },

  units: {
    celsius: "°C",
    fahrenheit: "°F",
    kmh: "km/h",
    mph: "mph",
    percent: "%",
  },

  settings: {
    title: "Impostazioni",
    close: "Chiudi le impostazioni",
    unitsLabel: "Unità",
    unitsMetric: "Metrico (°C, km/h)",
    unitsImperial: "Imperiale (°F, mph)",
    themeLabel: "Tema",
    themeLight: "Chiaro",
    themeDark: "Scuro",
    themeSystem: "Segui il sistema",
    languageLabel: "Lingua",
    reducedMotionLabel: "Riduci le animazioni",
    reducedMotionHint: "Disattiva le animazioni leggere, in aggiunta all'impostazione del sistema.",
    resetButton: "Ripristina tutte le impostazioni",
    resetConfirm: "Questo cancella la posizione salvata, la lingua, il tema, le unità e le previsioni in cache. Continuare?",
    resetDone: "Le impostazioni sono state ripristinate.",
  },

  errors: {
    networkTitle: "Impossibile caricare le previsioni",
    networkBody: "Controlla la tua connessione internet e riprova.",
    rateLimited: "Il servizio meteo è momentaneamente occupato. Riprova tra poco.",
    retry: "Riprova",
    genericTitle: "Qualcosa è andato storto",
  },

  loading: {
    weather: "Caricamento delle previsioni…",
  },

  footer: {
    dataSources: "Dati meteo e di geocodifica forniti da Open-Meteo e BigDataCloud.",
    privacy: "Privacy",
    terms: "Termini",
    methodology: "Metodologia",
  },

  a11y: {
    weatherRegionLabel: "Meteo attuale e previsioni",
    weatherUpdatedAnnouncement: "Meteo aggiornato per {place}",
    themeToggleLabel: "Passa dal tema chiaro a quello scuro",
    windFromDirection: "vento da {direction}°",
  },
};

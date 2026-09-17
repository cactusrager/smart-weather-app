// Icon + color lookup for the What to Wear card's temperature indicator.
//
// Bootstrap Icons already ships a small thermometer set with distinct fill
// levels (snow -> low -> half -> high -> sun), so instead of hand-drawn
// clothing pictograms, the card shows one of those — paired with a color
// that shifts from cold blue to hot red — for an at-a-glance read of "how
// hot is it" tied to the same seven tiers recommendations.js buckets
// "feels like" temperature into (see CLOTHING_TIERS there).

export const TEMPERATURE_ICON_CLASS = {
  extreme_cold: "bi-thermometer-snow",
  cold: "bi-thermometer-low",
  cool: "bi-thermometer-low",
  mild_cool: "bi-thermometer-half",
  mild: "bi-thermometer-half",
  warm: "bi-thermometer-high",
  hot: "bi-thermometer-sun",
};

export const TEMPERATURE_TIER_COLOR = {
  extreme_cold: "#3b82c4",
  cold: "#4dabf7",
  cool: "#38bdf8",
  mild_cool: "#34c38f",
  mild: "#ffd43b",
  warm: "#ff922b",
  hot: "#ff6b35",
};

// Small accessory icons layered below the temperature indicator (umbrella /
// sun protection), driven by today's rain and UV outlook.
export const EXTRA_ICON_CLASS = {
  umbrella: "bi-umbrella",
  sunglasses: "bi-sunglasses",
};

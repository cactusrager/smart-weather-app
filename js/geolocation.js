// Thin wrapper around the browser Geolocation API.
//
// Privacy note: the coordinates returned here are only ever kept in memory
// for the current session (passed straight into a function call). They are
// never written to localStorage — only the *resolved place* from reverse
// geocoding gets persisted (see geocoding.js + storage.js).

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 0,
};

/**
 * Resolves with { latitude, longitude } or rejects with an Error whose
 * `code` is one of: "unsupported", "denied", "unavailable", "timeout".
 */
export function requestCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(Object.assign(new Error("Geolocation is not supported"), { code: "unsupported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        const codeMap = {
          1: "denied", // PERMISSION_DENIED
          2: "unavailable", // POSITION_UNAVAILABLE
          3: "timeout", // TIMEOUT
        };
        reject(Object.assign(new Error(error.message || "Geolocation failed"), {
          code: codeMap[error.code] || "unavailable",
        }));
      },
      GEOLOCATION_OPTIONS
    );
  });
}

export function getCurrentPosition({ timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      const err = new Error("Geolocation is not supported on this device.");
      err.code = "UNSUPPORTED";
      return reject(err);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (geoErr) => {
        const err = new Error(geoErr.message || "Could not determine your location.");
        err.code =
          geoErr.code === geoErr.PERMISSION_DENIED ? "DENIED" :
          geoErr.code === geoErr.TIMEOUT ? "TIMEOUT" : "UNAVAILABLE";
        reject(err);
      },
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );
  });
}

export function isMobileDevice() {
  const ua = navigator.userAgent || "";
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);
  const touchPrimary = window.matchMedia?.("(pointer: coarse)")?.matches;
  return uaMobile || !!touchPrimary;
}

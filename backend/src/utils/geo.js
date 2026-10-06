export function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; 
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const CAFE_LAT = process.env.CAFE_LAT ? parseFloat(process.env.CAFE_LAT) : null;
export const CAFE_LNG = process.env.CAFE_LNG ? parseFloat(process.env.CAFE_LNG) : null;
export const MAX_ORDER_DISTANCE_M = process.env.MAX_ORDER_DISTANCE_M
  ? parseFloat(process.env.MAX_ORDER_DISTANCE_M)
  : 150; 

export const locationCheckEnabled = CAFE_LAT !== null && CAFE_LNG !== null;

export function verifyGuestLocation(latitude, longitude) {
  if (!locationCheckEnabled) return { ok: true }; 

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return {
      ok: false,
      status: 400,
      message: "Location is required to place an order. Please enable location access and try again.",
    };
  }

  const distance = distanceInMeters(lat, lng, CAFE_LAT, CAFE_LNG);
  if (distance > MAX_ORDER_DISTANCE_M) {
    return {
      ok: false,
      status: 403,
      message: "You must be at the café to place an order.",
    };
  }

  return { ok: true };
}

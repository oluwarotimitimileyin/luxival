/**
 * Luxival pricing utilities — pure functions shared by the browser UI and automated tests.
 *
 * The module is dual-mode:
 *  - Node.js / Jest: exports via module.exports for testing.
 *  - Browser:        exposes window.LuxivalPricing for use by main.js and forms.js.
 */

const PRICING = {
  BASE: 10,
  PER_KM: 1,
  SERVICE: {
    'city-to-city': 10,
    tourism: 12,
    airport: 8,
    standard: 6,
  },
  AIRPORT_SURCHARGE: 15,
  BUSY_HOUR_RATE: 0.15,
};

/**
 * Returns true when the route involves an airport.
 * Matches common Finnish airport keywords and the IATA code "HEL" as a whole word
 * so that ordinary words like "shell" or "hotel" are not false-positives.
 *
 * @param {string} pickup
 * @param {string} destination
 * @returns {boolean}
 */
function isAirportRoute(pickup, destination) {
  const routeText = `${pickup} ${destination}`.toLowerCase();
  return /airport|vantaa|helsinki-vantaa|hvp|\bhel\b/.test(routeText);
}

/**
 * Returns true when a time string (HH:MM) falls within a busy-hour window.
 * Morning rush: 07:00–09:30 (420–570 min)
 * Evening rush: 15:30–18:30 (930–1110 min)
 *
 * @param {string} rideTime  e.g. "07:30"
 * @returns {boolean}
 */
function isBusyHour(rideTime) {
  if (!rideTime) return false;
  const [hour, minute] = rideTime.split(':').map(Number);
  const totalMinutes = hour * 60 + minute;
  return isBusyMinutes(totalMinutes);
}

/**
 * Returns true when the given number of minutes since midnight falls in a busy window.
 * Extracted to allow testing without constructing time strings.
 *
 * @param {number} totalMinutes
 * @returns {boolean}
 */
function isBusyMinutes(totalMinutes) {
  const morningRush = totalMinutes >= 420 && totalMinutes <= 570; // 07:00–09:30
  const eveningRush = totalMinutes >= 930 && totalMinutes <= 1110; // 15:30–18:30
  return morningRush || eveningRush;
}

/**
 * Formats a numeric price as a string with two decimal places.
 *
 * @param {number} value
 * @returns {string}
 */
function formatPrice(value) {
  return Number(value).toFixed(2);
}

/**
 * Calculates the total ride price.
 *
 * @param {number}  distanceKm   Distance in kilometres (clamped to >= 0).
 * @param {string}  serviceType  One of: 'city-to-city' | 'tourism' | 'airport' | 'standard'.
 * @param {boolean} isAirport    Whether an airport surcharge applies.
 * @param {boolean} isBusy       Whether busy-hour demand pricing applies.
 * @returns {number}
 */
function calculateRidePrice(distanceKm, serviceType, isAirport, isBusy) {
  const distance = Math.max(0, Number(distanceKm) || 0);
  const servicePrice = PRICING.SERVICE[serviceType] ?? PRICING.SERVICE.standard;
  const airportPrice = isAirport ? PRICING.AIRPORT_SURCHARGE : 0;
  const subtotal = PRICING.BASE + distance * PRICING.PER_KM + servicePrice + airportPrice;
  const demandPrice = isBusy ? Math.round(subtotal * PRICING.BUSY_HOUR_RATE * 100) / 100 : 0;
  return subtotal + demandPrice;
}

if (typeof module !== 'undefined' && module.exports) {
  // Node.js / Jest
  module.exports = { PRICING, isAirportRoute, isBusyHour, isBusyMinutes, formatPrice, calculateRidePrice };
} else {
  // Browser
  window.LuxivalPricing = { PRICING, isAirportRoute, isBusyHour, isBusyMinutes, formatPrice, calculateRidePrice };
}

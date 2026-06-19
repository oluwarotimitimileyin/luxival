/**
 * Vercel Serverless Function: /api/get-fare
 * Calculates fare using Google Maps Distance Matrix API (server-side, key hidden).
 *
 * GET /api/get-fare?origin=ADDR&destination=ADDR&surcharges=airport,night
 *
 * Requires Vercel env var: GOOGLE_MAPS_API_KEY
 */

const RATE_PER_KM = 3.50;
const BASE_FARE = 100;

const SURCHARGES = {
  airport: 10,
  effort: 10,
  city: 10,
  private_cruise: 30,
  night: 10,
};

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseCoord(str) {
  const parts = str.split(',').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts;
  return null;
}

module.exports = async (req, res) => {
  // CORS headers
  const allowedOrigins = ["https://www.luxival.com", "https://www.luxival.com"];
  const requestOrigin = req.headers.origin || "";
  if (allowedOrigins.includes(requestOrigin) || requestOrigin.startsWith("http://localhost")) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.luxival.com");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { origin, destination, surcharges: surchargesParam } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: "origin and destination are required" });
  }

  let distanceKm;
  let distanceSource = "estimate";

  // Try Google Distance Matrix first
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
      url.searchParams.set("origins", origin);
      url.searchParams.set("destinations", destination);
      url.searchParams.set("units", "metric");
      url.searchParams.set("key", apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();
      const element = data.rows?.[0]?.elements?.[0];

      if (data.status === "OK" && element && element.status === "OK") {
        distanceKm = element.distance.value / 1000;
        distanceSource = "google";
      }
    } catch (err) {
      console.error("Distance Matrix error:", err);
    }
  }

  // Fallback: calculate from coordinates using Haversine (road distance ~ 1.3x straight line)
  if (!distanceKm) {
    const originCoord = parseCoord(origin);
    const destCoord = parseCoord(destination);
    if (originCoord && destCoord) {
      const straightLine = haversineKm(originCoord[0], originCoord[1], destCoord[0], destCoord[1]);
      distanceKm = straightLine * 1.3;
      distanceSource = "estimated";
    } else {
      return res.status(400).json({ error: "Could not calculate route. Please select addresses from the suggestions." });
    }
  }

  // Calculate fare
  const selectedSurcharges = surchargesParam
    ? surchargesParam.split(",").map((s) => s.trim()).filter((s) => SURCHARGES[s] !== undefined)
    : [];

  const distanceCost = Math.ceil(distanceKm * RATE_PER_KM * 100) / 100; // round up to nearest cent
  const surchargeTotal = selectedSurcharges.reduce((sum, s) => sum + SURCHARGES[s], 0);
  const total = Math.round((BASE_FARE + distanceCost + surchargeTotal) * 100) / 100;

  const breakdown = {
    base: BASE_FARE,
    distance: `${distanceKm.toFixed(1)} km × €${RATE_PER_KM}/km = €${distanceCost.toFixed(2)}`,
  };
  selectedSurcharges.forEach((s) => {
    breakdown[s] = SURCHARGES[s];
  });

  return res.status(200).json({
    origin,
    destination,
    distance_km: parseFloat(distanceKm.toFixed(1)),
    distance_source: distanceSource,
    rate_per_km: RATE_PER_KM,
    base: BASE_FARE,
    distance_cost: parseFloat(distanceCost.toFixed(2)),
    surcharges: selectedSurcharges,
    surcharge_total: surchargeTotal,
    total,
    breakdown,
  });
};

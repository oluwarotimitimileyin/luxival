/**
 * Vercel Serverless Function: /api/get-fare
 * Calculates fare using Google Maps Distance Matrix API (server-side, key hidden).
 *
 * GET /api/get-fare?origin=ADDR&destination=ADDR&surcharges=airport,night
 *
 * Requires Vercel env var: GOOGLE_MAPS_API_KEY
 */

const RATE_PER_KM = 3.50;
const BASE_FARE = 15;

const SURCHARGES = {
  airport: 10,
  effort: 10,
  city: 10,
  private_cruise: 30,
  night: 10,
};

module.exports = async (req, res) => {
  // CORS headers — allow the Luxival frontend only
  res.setHeader("Access-Control-Allow-Origin", "https://luxival.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { origin, destination, surcharges: surchargesParam } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: "origin and destination are required" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Fare service not configured. Please contact us for a quote." });
  }

  // Call Google Distance Matrix API
  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", apiKey);

  let distanceKm;
  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(400).json({ error: "Could not calculate route. Please check addresses." });
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return res.status(400).json({ error: "No route found between these locations." });
    }

    distanceKm = element.distance.value / 1000; // metres → km
  } catch (err) {
    console.error("Distance Matrix error:", err);
    return res.status(500).json({ error: "Route calculation failed. Please try again." });
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
    rate_per_km: RATE_PER_KM,
    base: BASE_FARE,
    distance_cost: parseFloat(distanceCost.toFixed(2)),
    surcharges: selectedSurcharges,
    surcharge_total: surchargeTotal,
    total,
    breakdown,
  });
};

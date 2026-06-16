/**
 * Vercel Serverless Function: /api/location-suggest
 * Returns Finland-focused location suggestions for transfer and fare forms.
 *
 * GET /api/location-suggest?q=Helsinki%20Airport
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_USER_AGENT = "Luxival/1.0 (support@luxival.com)";

function setCors(req, res) {
  const allowedOrigins = ["https://www.luxival.com", "https://luxival.com"];
  const requestOrigin = req.headers.origin || "";

  if (allowedOrigins.includes(requestOrigin) || requestOrigin.startsWith("http://localhost")) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://www.luxival.com");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function normalisePlace(place) {
  const address = place.address || {};
  const city = address.city || address.town || address.municipality || address.village || "";

  return {
    label: place.display_name || "",
    lat: String(place.lat || ""),
    lon: String(place.lon || ""),
    city,
    country: address.country || "Finland",
    source: "openstreetmap",
  };
}

async function fetchSuggestions(query, limit) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("countrycodes", "fi");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": process.env.NOMINATIM_USER_AGENT || DEFAULT_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim returned ${response.status}`);
  }

  const places = await response.json();
  return places.filter((place) => place.display_name).map(normalisePlace);
}

module.exports = async (req, res) => {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = String(req.query.q || "").trim();
  const limit = Math.max(1, Math.min(parseInt(req.query.limit || "6", 10) || 6, 10));

  if (query.length < 2) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const suggestions = await fetchSuggestions(query, limit);
    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Location suggestion error:", error);
    return res.status(502).json({ error: "Location suggestion service unavailable", suggestions: [] });
  }
};

"""
Location suggestions for Luxival transfer and fare forms.

Uses OpenStreetMap Nominatim as a Google Places fallback so customers can still
find Finnish pickup and drop-off addresses when the Google widget is unavailable.
"""
import os
import argparse
import asyncio
import json
from typing import Any

import httpx

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
DEFAULT_USER_AGENT = "Luxival/1.0 (support@luxival.com)"


def _normalise_place(place: dict[str, Any]) -> dict[str, str]:
    address = place.get("address") or {}
    city = (
        address.get("city")
        or address.get("town")
        or address.get("municipality")
        or address.get("village")
        or ""
    )

    return {
        "label": place.get("display_name", ""),
        "lat": str(place.get("lat", "")),
        "lon": str(place.get("lon", "")),
        "city": city,
        "country": address.get("country", "Finland"),
        "source": "openstreetmap",
    }


async def suggest_locations(query: str, limit: int = 6) -> list[dict[str, str]]:
    clean_query = (query or "").strip()
    safe_limit = max(1, min(limit, 10))

    if len(clean_query) < 2:
        return []

    params = {
        "format": "jsonv2",
        "q": clean_query,
        "countrycodes": "fi",
        "addressdetails": "1",
        "limit": str(safe_limit),
    }
    headers = {
        "Accept": "application/json",
        "User-Agent": os.getenv("NOMINATIM_USER_AGENT", DEFAULT_USER_AGENT),
    }

    async with httpx.AsyncClient(timeout=8, headers=headers) as client:
        response = await client.get(NOMINATIM_URL, params=params)
        response.raise_for_status()
        places = response.json()

    return [_normalise_place(place) for place in places if place.get("display_name")]


async def _main() -> None:
    parser = argparse.ArgumentParser(description="Suggest Finnish locations for Luxival forms.")
    parser.add_argument("query", help="Address or place name to search for")
    parser.add_argument("--limit", type=int, default=6, help="Maximum suggestions to return")
    args = parser.parse_args()

    suggestions = await suggest_locations(args.query, args.limit)
    print(json.dumps({"suggestions": suggestions}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(_main())

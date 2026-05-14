"""
Luxival Fare Calculator
Generates all 32 surcharge combinations and writes assets/data/fares.json.
Run: python api/fare_calculator.py
"""

import json
import os
from itertools import product

BASE_FARE = 15

SURCHARGES = {
    "airport": 10,
    "effort": 10,
    "city": 10,
    "private_cruise": 30,
    "night": 10,
}

def calculate_fare(selected: list[str]) -> int:
    total = BASE_FARE
    for key in selected:
        total += SURCHARGES[key]
    return total

def generate_all_combinations() -> dict:
    keys = list(SURCHARGES.keys())
    fares = {}

    for bits in product([0, 1], repeat=len(keys)):
        selected = [keys[i] for i, bit in enumerate(bits) if bit]
        combo_key = ",".join(sorted(selected)) if selected else "base"
        fares[combo_key] = {
            "surcharges": selected,
            "total": calculate_fare(selected),
            "breakdown": {
                "base": BASE_FARE,
                **{k: SURCHARGES[k] for k in selected},
            },
        }

    return fares

def main():
    fares = generate_all_combinations()

    output_path = os.path.join(
        os.path.dirname(__file__), "..", "assets", "data", "fares.json"
    )
    output_path = os.path.normpath(output_path)

    with open(output_path, "w") as f:
        json.dump(fares, f, indent=2)

    print(f"Generated {len(fares)} fare combinations → {output_path}")
    print(f"Base fare: €{BASE_FARE}")
    print(f"Max fare (all surcharges): €{calculate_fare(list(SURCHARGES.keys()))}")

if __name__ == "__main__":
    main()

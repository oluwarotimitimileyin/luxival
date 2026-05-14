/**
 * Luxival Fare Calculator Widget — Distance-based
 * Calls /api/get-fare (Vercel serverless) which uses Google Distance Matrix API.
 * Supports Google Places Autocomplete on address inputs.
 * Usage: initFareCalculator({ containerId, preselect: ['airport'] })
 *
 * Requires Google Maps JS API loaded with ?libraries=places
 * Formula: €15 base + (km × €3.50) + surcharges
 */

(function () {
  const SURCHARGE_LABELS = {
    airport: { label: "Airport Transfer", price: 10 },
    effort: { label: "Extra Effort / Luggage", price: 10 },
    city: { label: "City Service", price: 10 },
    private_cruise: { label: "Private Cruise", price: 30 },
    night: { label: "Night Service (22:00–06:00)", price: 10 },
  };

  let debounceTimer = null;

  function getSelectedSurcharges(container) {
    return Array.from(container.querySelectorAll('input[name="surcharge"]:checked')).map(
      (cb) => cb.value
    );
  }

  function setStatus(container, msg, isError) {
    const el = container.querySelector(".fare-status");
    if (el) {
      el.textContent = msg;
      el.className = "fare-status" + (isError ? " fare-status-error" : " fare-status-info");
    }
  }

  function renderBreakdown(container, data) {
    const totalEl = container.querySelector(".fare-total-amount");
    const breakdownEl = container.querySelector(".fare-breakdown");

    const lines = [
      `<div class="fare-line"><span>Base fare</span><span>€${data.base.toFixed(2)}</span></div>`,
      `<div class="fare-line"><span>Distance (${data.distance_km} km × €3.50/km)</span><span>€${data.distance_cost.toFixed(2)}</span></div>`,
    ];

    data.surcharges.forEach((s) => {
      if (SURCHARGE_LABELS[s]) {
        lines.push(
          `<div class="fare-line"><span>${SURCHARGE_LABELS[s].label}</span><span>+€${SURCHARGE_LABELS[s].price}</span></div>`
        );
      }
    });

    breakdownEl.innerHTML = lines.join("");
    totalEl.textContent = `€${data.total.toFixed(2)}`;
    setStatus(container, `Route: ${data.distance_km} km`, false);
  }

  async function fetchFare(container, origin, destination) {
    const surcharges = getSelectedSurcharges(container);
    setStatus(container, "Calculating route…", false);

    const params = new URLSearchParams({
      origin,
      destination,
      surcharges: surcharges.join(","),
    });

    try {
      const res = await fetch(`/api/get-fare?${params}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setStatus(container, data.error || "Could not calculate fare.", true);
        return;
      }

      renderBreakdown(container, data);
    } catch {
      setStatus(container, "Route calculation failed. Please try again.", true);
    }
  }

  function scheduleFetch(container) {
    clearTimeout(debounceTimer);
    const originInput = container.querySelector(".fare-origin");
    const destInput = container.querySelector(".fare-destination");
    const origin = originInput ? originInput.value.trim() : "";
    const destination = destInput ? destInput.value.trim() : "";

    if (origin.length > 5 && destination.length > 5) {
      debounceTimer = setTimeout(() => fetchFare(container, origin, destination), 600);
    }
  }

  function initAutocomplete(input) {
    if (window.google && window.google.maps && window.google.maps.places) {
      const ac = new window.google.maps.places.Autocomplete(input, {
        types: ["geocode"],
        componentRestrictions: { country: "fi" }, // restrict to Finland
      });
      // Trigger fare recalculation when a place is selected from the dropdown
      ac.addListener("place_changed", () => {
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }
  }

  function renderWidget(container, preselect) {
    const id = container.id;
    container.innerHTML = `
      <div class="fare-calculator">
        <h3 class="fare-title">Estimate Your Fare</h3>
        <p class="fare-subtitle">Enter pickup and drop-off, then select any applicable services:</p>

        <div class="fare-address-row">
          <div class="fare-address-field">
            <label class="fare-address-label">Pickup Address</label>
            <input type="text" class="fare-address-input fare-origin" id="fare-origin-${id}"
              placeholder="e.g. Helsinki Airport (HEL)" autocomplete="off" />
          </div>
          <div class="fare-address-field">
            <label class="fare-address-label">Drop-off Address</label>
            <input type="text" class="fare-address-input fare-destination" id="fare-dest-${id}"
              placeholder="e.g. Hotel Kämp, Helsinki" autocomplete="off" />
          </div>
        </div>

        <div class="fare-options">
          ${Object.entries(SURCHARGE_LABELS)
            .map(
              ([key, info]) => `
            <label class="fare-option">
              <input type="checkbox" name="surcharge" value="${key}"
                ${preselect.includes(key) ? "checked" : ""}>
              <span class="fare-option-label">${info.label}</span>
              <span class="fare-option-price">+€${info.price}</span>
            </label>`
            )
            .join("")}
        </div>

        <div class="fare-status fare-status-info">Enter addresses above to calculate your route fare.</div>

        <div class="fare-result">
          <div class="fare-breakdown"></div>
          <div class="fare-total">
            <span class="fare-total-label">Estimated Total</span>
            <span class="fare-total-amount">—</span>
          </div>
        </div>
        <p class="fare-note">* €15 base + €3.50/km + selected services. Final fare confirmed at booking. Night service applies 22:00–06:00.</p>
      </div>`;

    // Wire up address inputs
    const originInput = container.querySelector(".fare-origin");
    const destInput = container.querySelector(".fare-destination");

    [originInput, destInput].forEach((input) => {
      input.addEventListener("input", () => scheduleFetch(container));
      input.addEventListener("change", () => scheduleFetch(container));
      initAutocomplete(input);
    });

    // Surcharge checkboxes retrigger fare fetch
    container.querySelectorAll('input[name="surcharge"]').forEach((cb) => {
      cb.addEventListener("change", () => scheduleFetch(container));
    });
  }

  window.initFareCalculator = function (options) {
    const opts = options || {};
    const preselect = opts.preselect || [];
    const containerId = opts.containerId || "fare-calculator";

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn("Fare calculator container not found:", containerId);
      return;
    }

    renderWidget(container, preselect);
  };
})();

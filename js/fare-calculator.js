/**
 * Luxival Fare Calculator Widget — Distance-based
 * Calls /api/get-fare (Vercel serverless) which uses Google Distance Matrix API.
 * Uses Luxival/OpenStreetMap location suggestions on address inputs.
 * Usage: initFareCalculator({ containerId, preselect: ['airport'] })
 *
 * Formula: €100 base + (km × €3.50) + surcharges
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
  const suggestionState = new WeakMap();

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

  function ensureSuggestionStyles() {
    if (document.getElementById("fare-location-suggestion-styles")) return;

    const style = document.createElement("style");
    style.id = "fare-location-suggestion-styles";
    style.textContent = `
      .fare-address-field{position:relative}
      .fare-suggestions{display:none;position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:50;background:#10141c;border:1px solid rgba(201,169,106,.45);box-shadow:0 14px 30px rgba(0,0,0,.35);max-height:260px;overflow:auto}
      .fare-suggestions.is-open{display:block}
      .fare-suggestion-btn{display:block;width:100%;padding:.75rem .85rem;border:0;border-bottom:1px solid rgba(255,255,255,.08);background:transparent;color:#fff;text-align:left;font:inherit;cursor:pointer}
      .fare-suggestion-btn:hover,.fare-suggestion-btn:focus{background:rgba(201,169,106,.16);outline:none}
      .fare-suggestion-label{display:block;font-size:.88rem;line-height:1.35}
      .fare-suggestion-meta{display:block;margin-top:.2rem;color:rgba(255,255,255,.62);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em}
      .fare-suggestion-empty{padding:.75rem .85rem;color:rgba(255,255,255,.68);font-size:.84rem}
    `;
    document.head.appendChild(style);
  }

  function keepInputUsable(input) {
    if (!input) return;

    if (input.disabled) input.disabled = false;
    if (input.hasAttribute("disabled")) input.removeAttribute("disabled");
    if (input.classList.contains("gm-err-autocomplete")) {
      input.classList.remove("gm-err-autocomplete");
    }
    if (input.style.backgroundImage && input.style.backgroundImage !== "none") {
      input.style.backgroundImage = "none";
    }

    if (input.placeholder === "Sorry! Something went wrong.") {
      input.placeholder = input.classList.contains("fare-origin")
        ? "e.g. Helsinki Airport (HEL)"
        : "e.g. Hotel Kamp, Helsinki";
    }
  }

  function watchGoogleInputState(input) {
    keepInputUsable(input);

    const observer = new MutationObserver(() => keepInputUsable(input));
    observer.observe(input, {
      attributes: true,
      attributeFilter: ["disabled", "class", "placeholder", "style"],
    });

    ["focus", "input", "click"].forEach((eventName) => {
      input.addEventListener(eventName, () => keepInputUsable(input));
    });
  }

  function closeSuggestions(input) {
    const list = input.parentElement ? input.parentElement.querySelector(".fare-suggestions") : null;
    if (list) {
      list.classList.remove("is-open");
      list.innerHTML = "";
    }
  }

  function renderSuggestions(input, suggestions) {
    const list = input.parentElement ? input.parentElement.querySelector(".fare-suggestions") : null;
    if (!list) return;

    if (!suggestions.length) {
      list.innerHTML = '<div class="fare-suggestion-empty">Keep typing the full address.</div>';
      list.classList.add("is-open");
      return;
    }

    list.innerHTML = suggestions
      .map((suggestion) => {
        const label = String(suggestion.label || "").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[char]));
        const meta = [suggestion.city, suggestion.country].filter(Boolean).join(", ");
        const safeMeta = String(meta || "Finland").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[char]));
        return `<button class="fare-suggestion-btn" type="button" data-label="${label}">
          <span class="fare-suggestion-label">${label}</span>
          <span class="fare-suggestion-meta">${safeMeta}</span>
        </button>`;
      })
      .join("");

    list.classList.add("is-open");
    list.querySelectorAll(".fare-suggestion-btn").forEach((button) => {
      button.addEventListener("mousedown", (event) => event.preventDefault());
      button.addEventListener("click", () => {
        input.value = button.dataset.label || "";
        closeSuggestions(input);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  function initFallbackSuggestions(input) {
    let inputTimer = null;

    input.addEventListener("input", () => {
      keepInputUsable(input);
      clearTimeout(inputTimer);

      const query = input.value.trim();
      if (query.length < 3) {
        closeSuggestions(input);
        return;
      }

      inputTimer = setTimeout(async () => {
        const previous = suggestionState.get(input);
        if (previous && previous.abort) previous.abort.abort();

        const abort = new AbortController();
        suggestionState.set(input, { abort });

        try {
          const response = await fetch(`/api/location-suggest?q=${encodeURIComponent(query)}`, {
            signal: abort.signal,
          });
          const data = await response.json();
          renderSuggestions(input, Array.isArray(data.suggestions) ? data.suggestions : []);
        } catch (error) {
          if (error.name !== "AbortError") closeSuggestions(input);
        }
      }, 350);
    });

    input.addEventListener("blur", () => {
      setTimeout(() => closeSuggestions(input), 180);
    });
  }

  function repairFareInputs() {
    document.querySelectorAll(".fare-address-input").forEach((input) => keepInputUsable(input));
  }

  function renderWidget(container, preselect) {
    ensureSuggestionStyles();

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
            <div class="fare-suggestions" role="listbox" aria-label="Pickup address suggestions"></div>
          </div>
          <div class="fare-address-field">
            <label class="fare-address-label">Drop-off Address</label>
            <input type="text" class="fare-address-input fare-destination" id="fare-dest-${id}"
              placeholder="e.g. Hotel Kamp, Helsinki" autocomplete="off" />
            <div class="fare-suggestions" role="listbox" aria-label="Drop-off address suggestions"></div>
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

        <div style="margin-bottom:1rem">
          <button class="fare-calc-btn" type="button" style="background:#C9A96A;color:#0A0B0F;border:none;padding:.7rem 2rem;font-size:.85rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;border-radius:2px;cursor:pointer;width:100%">Calculate Fare</button>
        </div>
        <div class="fare-status fare-status-info">Enter addresses above to calculate your route fare.</div>

        <div class="fare-result">
          <div class="fare-breakdown"></div>
          <div class="fare-total">
            <span class="fare-total-label">Estimated Total</span>
            <span class="fare-total-amount">—</span>
          </div>
        </div>
        <p class="fare-note">* €100 base + €3.50/km + selected services. Final fare confirmed at booking. Night service applies 22:00–06:00.</p>
      </div>`;

    // Wire up address inputs
    const originInput = container.querySelector(".fare-origin");
    const destInput = container.querySelector(".fare-destination");

    [originInput, destInput].forEach((input) => {
      watchGoogleInputState(input);
      initFallbackSuggestions(input);
      input.addEventListener("input", () => scheduleFetch(container));
      input.addEventListener("change", () => scheduleFetch(container));
    });

    repairFareInputs();
    window.setTimeout(repairFareInputs, 250);
    window.setTimeout(repairFareInputs, 1000);

    // Surcharge checkboxes retrigger fare fetch
    container.querySelectorAll('input[name="surcharge"]').forEach((cb) => {
      cb.addEventListener("change", () => scheduleFetch(container));
    });

    // Manual calculate button
    const calcBtn = container.querySelector('.fare-calc-btn');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        const origin = originInput ? originInput.value.trim() : '';
        const destination = destInput ? destInput.value.trim() : '';
        if (origin.length > 3 && destination.length > 3) {
          fetchFare(container, origin, destination);
        } else {
          setStatus(container, 'Please enter both pickup and drop-off addresses.', true);
        }
      });
    }
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

  window.LuxivalRepairFareInputs = repairFareInputs;
  window.addEventListener("DOMContentLoaded", repairFareInputs);
  window.addEventListener("load", () => {
    repairFareInputs();
    window.setTimeout(repairFareInputs, 500);
    window.setTimeout(repairFareInputs, 2000);
  });
})();

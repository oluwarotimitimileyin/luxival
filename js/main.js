document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const calculateButton = document.getElementById('calculateFare');
  if (calculateButton) {
    calculateButton.addEventListener('click', () => {
      const distanceInput = document.getElementById('distance');
      const pickupInput = document.getElementById('pickup');
      const destinationInput = document.getElementById('destination');
      const distanceValue = Math.max(0, Number(distanceInput.value) || 0);
      const serviceType = document.getElementById('serviceType').value;
      const pickupValue = pickupInput ? pickupInput.value.trim() : '';
      const destinationValue = destinationInput ? destinationInput.value.trim() : '';

      const routeText = `${pickupValue} ${destinationValue}`.toLowerCase();
      const airportSurcharge = window.LuxivalPricing
        ? window.LuxivalPricing.isAirportRoute(pickupValue, destinationValue)
        : /airport|vantaa|helsinki-vantaa|hvp|\bhel\b/.test(routeText);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const busyHour = window.LuxivalPricing
        ? window.LuxivalPricing.isBusyMinutes(currentMinutes)
        : (currentMinutes >= 420 && currentMinutes <= 570) || (currentMinutes >= 930 && currentMinutes <= 1110);

      const basePrice = 10;
      const perKm = 1;
      const distancePrice = distanceValue * perKm;
      const servicePrice = window.LuxivalPricing
        ? (window.LuxivalPricing.PRICING.SERVICE[serviceType] ?? window.LuxivalPricing.PRICING.SERVICE.standard)
        : (serviceType === 'city-to-city' ? 10 : serviceType === 'tourism' ? 12 : serviceType === 'airport' ? 8 : 6);
      const airportPrice = airportSurcharge ? 15 : 0;
      const demandPrice = busyHour ? Math.round((basePrice + distancePrice + servicePrice + airportPrice) * 0.15 * 100) / 100 : 0;
      const totalPrice = basePrice + distancePrice + servicePrice + airportPrice + demandPrice;

      document.getElementById('distancePrice').textContent = distancePrice.toFixed(2);
      document.getElementById('servicePrice').textContent = servicePrice.toFixed(2);
      document.getElementById('airportPrice').textContent = airportPrice.toFixed(2);
      document.getElementById('demandPrice').textContent = demandPrice.toFixed(2);
      document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
    });
  }

  const interactiveCard = document.querySelector('.rotate-card');
  if (interactiveCard) {
    interactiveCard.addEventListener('pointermove', (event) => {
      const rect = interactiveCard.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -20;
      interactiveCard.style.transform = `rotateX(${y}deg) rotateY(${x}deg) scale(1.03)`;
    });
    interactiveCard.addEventListener('pointerleave', () => {
      interactiveCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  const showcaseText = document.getElementById('showcaseText');
  const showcaseTabs = document.querySelectorAll('.showcase-tab');
  if (showcaseTabs.length && showcaseText) {
    showcaseTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        showcaseTabs.forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.target;
        if (target === 'digital') {
          showcaseText.textContent = 'Luxival delivers interactive digital experiences with depth, motion, and motion-driven storytelling that feels engineered and crafted.';
        } else {
          showcaseText.textContent = 'Our tourism section blends Finnish destination narratives, boutique hospitality cues and a premium travel feel for Helsinki and beyond.';
        }
      });
    });
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  const travelCards = document.querySelectorAll('.destination-card');
  if (filterButtons.length && travelCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        const filter = button.dataset.filter;
        travelCards.forEach((card) => {
          const category = card.dataset.category;
          card.style.display = filter === 'all' || category === filter ? 'block' : 'none';
        });
      });
    });
  }
});

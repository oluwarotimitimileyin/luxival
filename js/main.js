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

      const { isAirportRoute, isBusyMinutes, PRICING } = window.LuxivalPricing;
      const airportSurcharge = isAirportRoute(pickupValue, destinationValue);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const busyHour = isBusyMinutes(currentMinutes);

      const distancePrice = distanceValue * PRICING.PER_KM;
      const servicePrice = PRICING.SERVICE[serviceType] ?? PRICING.SERVICE.standard;
      const airportPrice = airportSurcharge ? PRICING.AIRPORT_SURCHARGE : 0;
      const demandPrice = busyHour ? Math.round((PRICING.BASE + distancePrice + servicePrice + airportPrice) * PRICING.BUSY_HOUR_RATE * 100) / 100 : 0;
      const totalPrice = PRICING.BASE + distancePrice + servicePrice + airportPrice + demandPrice;

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

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
      const distanceValue = Math.max(0, Number(distanceInput.value) || 0);
      const serviceType = document.getElementById('serviceType').value;
      const airportSurcharge = document.getElementById('airportSurcharge').checked;
      const busyHour = document.getElementById('busyHour').checked;

      const basePrice = 10;
      const perKm = 1;
      const distancePrice = distanceValue * perKm;
      const servicePrice = serviceType === 'city-to-city' ? 10 : serviceType === 'tourism' ? 12 : 0;
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
});

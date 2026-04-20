document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const rideRequestForm = document.getElementById('rideRequestForm');
  const newsletterForm = document.getElementById('newsletterForm');

  const showStatus = (element, message, isError = false) => {
    if (!element) return;
    element.textContent = message;
    element.style.color = isError ? '#f77' : '#9d7dff';
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = document.getElementById('contactStatus');
      showStatus(status, 'Sending inquiry…');

      const payload = {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        company: document.getElementById('contactCompany').value.trim(),
        service_interest: document.getElementById('contactService').value,
        message: document.getElementById('contactMessage').value.trim(),
        source: 'contact page',
        status: 'new',
      };

      const { error } = await window.LuxivalSupabase.submitContactInquiry(payload);
      if (error) {
        showStatus(status, 'Unable to send inquiry. Please try again later.', true);
        console.error('Contact inquiry error:', error);
      } else {
        contactForm.reset();
        showStatus(status, 'Inquiry sent. We will reply shortly.');
      }
    });
  }

  const rideEstimateDistance = document.getElementById('rideEstimateDistance');
  const rideEstimatePrice = document.getElementById('rideEstimatePrice');
  const rideEstimateNote = document.getElementById('rideEstimateNote');
  const rideDistanceInput = document.getElementById('rideDistance');
  const rideServiceType = document.getElementById('rideServiceType');
  const ridePickupInput = document.getElementById('ridePickup');
  const rideDestinationInput = document.getElementById('rideDestination');
  const rideTimeInput = document.getElementById('rideTime');
  const rideFlightTrackButton = document.getElementById('rideFlightTrack');
  const rideFlightNumberInput = document.getElementById('rideFlightNumber');

  const { isAirportRoute, isBusyHour, formatPrice, PRICING } = window.LuxivalPricing;

  function updateRideEstimates() {
    const distanceValue = Math.max(0, Number(rideDistanceInput.value) || 0);
    const serviceType = rideServiceType.value;
    const pickupValue = ridePickupInput.value.trim();
    const destinationValue = rideDestinationInput.value.trim();
    const rideTimeValue = rideTimeInput.value;
    const airportSurcharge = isAirportRoute(pickupValue, destinationValue);
    const busyHour = isBusyHour(rideTimeValue);

    const distancePrice = distanceValue * PRICING.PER_KM;
    const servicePrice = PRICING.SERVICE[serviceType] ?? PRICING.SERVICE.standard;
    const airportPrice = airportSurcharge ? PRICING.AIRPORT_SURCHARGE : 0;
    const demandPrice = busyHour ? Math.round((PRICING.BASE + distancePrice + servicePrice + airportPrice) * PRICING.BUSY_HOUR_RATE * 100) / 100 : 0;
    const estimatedTotal = PRICING.BASE + distancePrice + servicePrice + airportPrice + demandPrice;

    if (rideEstimateDistance) {
      rideEstimateDistance.textContent = distanceValue > 0 ? String(distanceValue) : '—';
    }
    if (rideEstimatePrice) {
      rideEstimatePrice.textContent = distanceValue > 0 ? formatPrice(estimatedTotal) : '—';
    }
    if (rideEstimateNote) {
      const airportText = airportSurcharge ? 'Airport fee applied.' : 'No airport fee detected.';
      const busyText = busyHour ? 'Busy-hour pricing applied.' : 'Off-peak pricing detected.';
      rideEstimateNote.textContent = `${airportText} ${busyText}`;
    }
  }

  if (rideDistanceInput) {
    rideDistanceInput.addEventListener('input', updateRideEstimates);
  }
  if (rideServiceType) {
    rideServiceType.addEventListener('change', updateRideEstimates);
  }
  if (ridePickupInput) {
    ridePickupInput.addEventListener('input', updateRideEstimates);
  }
  if (rideDestinationInput) {
    rideDestinationInput.addEventListener('input', updateRideEstimates);
  }
  if (rideTimeInput) {
    rideTimeInput.addEventListener('change', updateRideEstimates);
  }
  if (rideFlightTrackButton) {
    rideFlightTrackButton.addEventListener('click', () => {
      const flightNumber = rideFlightNumberInput?.value.trim();
      if (!flightNumber) {
        return;
      }
      const query = encodeURIComponent(`flight ${flightNumber}`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    });
  }

  if (rideRequestForm) {
    updateRideEstimates();
    rideRequestForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = document.getElementById('rideStatus');
      showStatus(status, 'Submitting ride request…');

      const estimatedDistance = Number(rideDistanceInput.value) || 0;
      const estimatedPriceValue = Number(rideEstimatePrice?.textContent.replace(',', '.') || 0) || 0;
      const pickupValue = document.getElementById('ridePickup').value.trim();
      const destinationValue = document.getElementById('rideDestination').value.trim();
      const rideTimeValue = document.getElementById('rideTime').value;
      const airportSurcharge = isAirportRoute(pickupValue, destinationValue);
      const busyHour = isBusyHour(rideTimeValue);

      const payload = {
        customer_name: document.getElementById('rideName').value.trim(),
        email: document.getElementById('rideEmail').value.trim(),
        phone: document.getElementById('ridePhone').value.trim(),
        pickup_location: pickupValue,
        destination: destinationValue,
        preferred_date: document.getElementById('rideDate').value || null,
        ride_time: rideTimeValue || null,
        service_type: document.getElementById('rideServiceType').value,
        estimated_distance_km: estimatedDistance,
        estimated_price: estimatedPriceValue,
        airline: document.getElementById('rideAirline').value.trim() || null,
        flight_number: document.getElementById('rideFlightNumber').value.trim() || null,
        notes: document.getElementById('rideNotes').value.trim(),
        airport_surcharge: airportSurcharge,
        busy_hour: busyHour,
        status: 'pending',
        source: 'tourism page',
      };

      const { error } = await window.LuxivalSupabase.submitRideRequest(payload);
      if (error) {
        showStatus(status, 'Unable to submit ride request. Please try again later.', true);
        console.error('Ride request error:', error);
      } else {
        rideRequestForm.reset();
        updateRideEstimates();
        showStatus(status, 'Ride request sent successfully. We will contact you soon.');
      }
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = document.getElementById('newsletterStatus');
      showStatus(status, 'Saving subscription…');

      const payload = {
        email: document.getElementById('newsletterEmail').value.trim(),
        name: document.getElementById('newsletterName').value.trim() || null,
        source: 'website footer',
        consent: true,
        status: 'subscribed',
      };

      const { error } = await window.LuxivalSupabase.subscribeNewsletter(payload);
      if (error) {
        showStatus(status, 'Unable to subscribe. Please try again later.', true);
        console.error('Newsletter subscription error:', error);
      } else {
        newsletterForm.reset();
        showStatus(status, 'Thank you! You are subscribed.');
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const contactCount = document.getElementById('contactCount');
  const rideCount = document.getElementById('rideCount');
  const newsletterCount = document.getElementById('newsletterCount');
  const rideRequestsTable = document.getElementById('rideRequestsTable');
  const contactInquiriesTable = document.getElementById('contactInquiriesTable');
  const newsletterTable = document.getElementById('newsletterTable');

  const renderTable = (container, headings, rows) => {
    if (!container) return;
    const table = document.createElement('table');
    table.className = 'data-table';
    const headRow = document.createElement('tr');
    headings.forEach((heading) => {
      const th = document.createElement('th');
      th.textContent = heading;
      headRow.appendChild(th);
    });
    const thead = document.createElement('thead');
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
  };

  const showError = (container, message) => {
    if (!container) return;
    container.innerHTML = `<div class="form-status" style="color:#f77">${message}</div>`;
  };

  const [{ error: contactError, data: contacts = [] }, { error: rideError, data: rides = [] }, { error: newsletterError, data: newsletter = [] }] = await Promise.all([
    window.LuxivalSupabase.fetchContactInquiries(20),
    window.LuxivalSupabase.fetchRideRequests(20),
    window.LuxivalSupabase.fetchNewsletterSubscribers(20),
  ]);

  if (contactError) {
    showError(contactInquiriesTable, 'Unable to load contact inquiries.');
  }
  if (rideError) {
    showError(rideRequestsTable, 'Unable to load ride requests.');
  }
  if (newsletterError) {
    showError(newsletterTable, 'Unable to load newsletter subscribers.');
  }

  if (contactCount) contactCount.textContent = contacts.length;
  if (rideCount) rideCount.textContent = rides.length;
  if (newsletterCount) newsletterCount.textContent = newsletter.length;

  renderTable(
    rideRequestsTable,
    ['Created', 'Customer', 'Pickup', 'Destination', 'Date', 'Time', 'Service', 'Flight', 'Price', 'Status'],
    rides.map((ride) => [
      new Date(ride.created_at).toLocaleString(),
      ride.customer_name || '—',
      ride.pickup_location || '—',
      ride.destination || '—',
      ride.preferred_date || '—',
      ride.ride_time || '—',
      ride.service_type || '—',
      ride.flight_number || '—',
      ride.estimated_price != null ? `€${ride.estimated_price}` : '—',
      ride.status || '—',
    ]),
  );

  renderTable(
    contactInquiriesTable,
    ['Created', 'Name', 'Email', 'Service', 'Message', 'Status'],
    contacts.map((contact) => [
      new Date(contact.created_at).toLocaleString(),
      contact.name || '—',
      contact.email || '—',
      contact.service_interest || '—',
      contact.message ? contact.message.substring(0, 80) + (contact.message.length > 80 ? '…' : '') : '—',
      contact.status || '—',
    ]),
  );

  renderTable(
    newsletterTable,
    ['Created', 'Email', 'Name', 'Status'],
    newsletter.map((item) => [
      new Date(item.created_at).toLocaleString(),
      item.email || '—',
      item.name || '—',
      item.status || '—',
    ]),
  );
});

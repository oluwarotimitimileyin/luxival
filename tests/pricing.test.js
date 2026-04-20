'use strict';

const {
  PRICING,
  isAirportRoute,
  isBusyHour,
  isBusyMinutes,
  formatPrice,
  calculateRidePrice,
} = require('../js/pricing');

// ---------------------------------------------------------------------------
// isAirportRoute
// ---------------------------------------------------------------------------

describe('isAirportRoute', () => {
  test('detects the keyword "airport"', () => {
    expect(isAirportRoute('Helsinki Airport', 'City Centre')).toBe(true);
  });

  test('detects "vantaa" (case-insensitive)', () => {
    expect(isAirportRoute('Vantaa', 'Kamppi')).toBe(true);
  });

  test('detects "helsinki-vantaa"', () => {
    expect(isAirportRoute('Helsinki-Vantaa', 'Espoo')).toBe(true);
  });

  test('detects the IATA code "HEL" as a whole word', () => {
    expect(isAirportRoute('HEL', 'Tallinn')).toBe(true);
  });

  test('does NOT flag "shell" as an airport route', () => {
    // "shell" contains "hel" — the old regex would have returned true (bug)
    expect(isAirportRoute('Shell Beach', 'Downtown')).toBe(false);
  });

  test('does NOT flag "hotel" as an airport route', () => {
    expect(isAirportRoute('Luxury Hotel', 'City Centre')).toBe(false);
  });

  test('does NOT flag "shelter" as an airport route', () => {
    expect(isAirportRoute('Shelter', 'Market Square')).toBe(false);
  });

  test('returns false for a plain city-to-city route', () => {
    expect(isAirportRoute('Turku', 'Tampere')).toBe(false);
  });

  test('detects "hvp" abbreviation', () => {
    expect(isAirportRoute('HVP', 'Kallio')).toBe(true);
  });

  test('is case-insensitive for all keywords', () => {
    expect(isAirportRoute('AIRPORT TERMINAL', 'CITY')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isBusyHour
// ---------------------------------------------------------------------------

describe('isBusyHour', () => {
  test('returns false for an empty string', () => {
    expect(isBusyHour('')).toBe(false);
  });

  test('returns false for null / undefined', () => {
    expect(isBusyHour(null)).toBe(false);
    expect(isBusyHour(undefined)).toBe(false);
  });

  // Morning rush: 07:00–09:30
  test('returns true at the start of morning rush (07:00)', () => {
    expect(isBusyHour('07:00')).toBe(true);
  });

  test('returns true during morning rush (08:15)', () => {
    expect(isBusyHour('08:15')).toBe(true);
  });

  test('returns true at the end of morning rush (09:30)', () => {
    expect(isBusyHour('09:30')).toBe(true);
  });

  test('returns false just before morning rush (06:59)', () => {
    expect(isBusyHour('06:59')).toBe(false);
  });

  test('returns false just after morning rush (09:31)', () => {
    expect(isBusyHour('09:31')).toBe(false);
  });

  // Evening rush: 15:30–18:30
  test('returns true at the start of evening rush (15:30)', () => {
    expect(isBusyHour('15:30')).toBe(true);
  });

  test('returns true during evening rush (17:00)', () => {
    expect(isBusyHour('17:00')).toBe(true);
  });

  test('returns true at the end of evening rush (18:30)', () => {
    expect(isBusyHour('18:30')).toBe(true);
  });

  test('returns false just before evening rush (15:29)', () => {
    expect(isBusyHour('15:29')).toBe(false);
  });

  test('returns false just after evening rush (18:31)', () => {
    expect(isBusyHour('18:31')).toBe(false);
  });

  test('returns false at midday (12:00)', () => {
    expect(isBusyHour('12:00')).toBe(false);
  });

  test('returns false at midnight (00:00)', () => {
    expect(isBusyHour('00:00')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isBusyMinutes
// ---------------------------------------------------------------------------

describe('isBusyMinutes', () => {
  test('420 minutes (07:00) is busy', () => {
    expect(isBusyMinutes(420)).toBe(true);
  });

  test('419 minutes (06:59) is not busy', () => {
    expect(isBusyMinutes(419)).toBe(false);
  });

  test('930 minutes (15:30) is busy', () => {
    expect(isBusyMinutes(930)).toBe(true);
  });

  test('1111 minutes (18:31) is not busy', () => {
    expect(isBusyMinutes(1111)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// formatPrice
// ---------------------------------------------------------------------------

describe('formatPrice', () => {
  test('formats an integer as two decimal places', () => {
    expect(formatPrice(25)).toBe('25.00');
  });

  test('formats a float correctly', () => {
    expect(formatPrice(12.5)).toBe('12.50');
  });

  test('formats zero', () => {
    expect(formatPrice(0)).toBe('0.00');
  });

  test('formats a string number', () => {
    expect(formatPrice('9.9')).toBe('9.90');
  });

  test('rounds to two decimal places', () => {
    expect(formatPrice(10.556)).toBe('10.56');
  });
});

// ---------------------------------------------------------------------------
// calculateRidePrice
// ---------------------------------------------------------------------------

describe('calculateRidePrice', () => {
  // Base case: 0 km, standard service, no airport, no busy hour
  // Expected: BASE(10) + distance(0) + standard(6) + airport(0) + demand(0) = 16
  test('calculates base price for standard service, zero distance', () => {
    expect(calculateRidePrice(0, 'standard', false, false)).toBe(16);
  });

  // 10 km, standard, no airport, no busy
  // Expected: 10 + 10 + 6 = 26
  test('calculates price for 10 km standard service', () => {
    expect(calculateRidePrice(10, 'standard', false, false)).toBe(26);
  });

  // city-to-city service price is 10
  // 0 km, no airport, no busy: 10 + 0 + 10 = 20
  test('applies city-to-city service surcharge', () => {
    expect(calculateRidePrice(0, 'city-to-city', false, false)).toBe(20);
  });

  // tourism service price is 12
  // 0 km, no airport, no busy: 10 + 0 + 12 = 22
  test('applies tourism service surcharge', () => {
    expect(calculateRidePrice(0, 'tourism', false, false)).toBe(22);
  });

  // airport service price is 8
  // 0 km, no airport surcharge, no busy: 10 + 0 + 8 = 18
  test('applies airport service type price', () => {
    expect(calculateRidePrice(0, 'airport', false, false)).toBe(18);
  });

  // unknown service type falls back to standard (6)
  test('unknown service type falls back to standard pricing', () => {
    expect(calculateRidePrice(0, 'executive-class', false, false)).toBe(16);
  });

  // airport surcharge: 15 extra
  // 0 km, standard, airport, no busy: 10 + 0 + 6 + 15 = 31
  test('adds airport surcharge', () => {
    expect(calculateRidePrice(0, 'standard', true, false)).toBe(31);
  });

  // busy-hour demand: 15% of subtotal
  // 0 km, standard, no airport: subtotal = 16; demand = round(16 * 0.15 * 100)/100 = 2.40
  // total = 16 + 2.40 = 18.40
  test('adds busy-hour demand pricing', () => {
    expect(calculateRidePrice(0, 'standard', false, true)).toBeCloseTo(18.40, 2);
  });

  // Combined: 20 km, city-to-city, airport, busy
  // distance: 20, service: 10, airport: 15 → subtotal = 10+20+10+15 = 55
  // demand = round(55 * 0.15 * 100)/100 = 8.25
  // total = 55 + 8.25 = 63.25
  test('calculates combined: 20 km, city-to-city, airport surcharge, busy hour', () => {
    expect(calculateRidePrice(20, 'city-to-city', true, true)).toBeCloseTo(63.25, 2);
  });

  // Negative distance is clamped to zero
  test('clamps negative distance to zero', () => {
    expect(calculateRidePrice(-5, 'standard', false, false)).toBe(16);
  });

  // Non-numeric distance is treated as zero
  test('treats non-numeric distance as zero', () => {
    expect(calculateRidePrice('abc', 'standard', false, false)).toBe(16);
  });
});

// ---------------------------------------------------------------------------
// PRICING constants sanity checks
// ---------------------------------------------------------------------------

describe('PRICING constants', () => {
  test('base price is 10', () => {
    expect(PRICING.BASE).toBe(10);
  });

  test('per-km rate is 1', () => {
    expect(PRICING.PER_KM).toBe(1);
  });

  test('airport surcharge is 15', () => {
    expect(PRICING.AIRPORT_SURCHARGE).toBe(15);
  });

  test('busy-hour rate is 0.15', () => {
    expect(PRICING.BUSY_HOUR_RATE).toBe(0.15);
  });

  test('all four service types are defined', () => {
    expect(PRICING.SERVICE).toHaveProperty('city-to-city');
    expect(PRICING.SERVICE).toHaveProperty('tourism');
    expect(PRICING.SERVICE).toHaveProperty('airport');
    expect(PRICING.SERVICE).toHaveProperty('standard');
  });
});

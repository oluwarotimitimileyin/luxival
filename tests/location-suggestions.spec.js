// @ts-check
const { test, expect } = require('@playwright/test');

const handler = require('../api/location-suggest');

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

test.describe('location suggestion endpoint', () => {
  test('returns normalised Finnish location suggestions', async () => {
    const originalFetch = global.fetch;

    global.fetch = async (url, options) => {
      expect(String(url)).toContain('countrycodes=fi');
      expect(options.headers['User-Agent']).toContain('Luxival');
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            display_name: 'Helsinki Airport, Lentoasemantie, Vantaa, Finland',
            lat: '60.3172',
            lon: '24.9633',
            address: {
              city: 'Vantaa',
              country: 'Finland',
            },
          },
        ],
      };
    };

    const req = {
      method: 'GET',
      headers: { origin: 'https://www.luxival.com' },
      query: { q: 'Helsinki Airport' },
    };
    const res = createMockResponse();

    try {
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.suggestions).toEqual([
        {
          label: 'Helsinki Airport, Lentoasemantie, Vantaa, Finland',
          lat: '60.3172',
          lon: '24.9633',
          city: 'Vantaa',
          country: 'Finland',
          source: 'openstreetmap',
        },
      ]);
    } finally {
      global.fetch = originalFetch;
    }
  });
});

test.describe('fare calculator location fallback', () => {
  test('keeps address fields usable and shows fallback suggestions', async ({ page }) => {
    await page.route('https://www.luxival.com/api/location-suggest**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          suggestions: [
            {
              label: 'Helsinki Airport, Lentoasemantie, Vantaa, Finland',
              city: 'Vantaa',
              country: 'Finland',
            },
          ],
        }),
      });
    });

    await page.setContent('<base href="https://www.luxival.com/"><div id="fare-test"></div>');
    await page.addScriptTag({ path: require.resolve('../js/fare-calculator.js') });
    await page.evaluate(() => window.initFareCalculator({ containerId: 'fare-test' }));

    const origin = page.locator('.fare-origin');
    await origin.evaluate((input) => {
      input.setAttribute('disabled', '');
      input.classList.add('gm-err-autocomplete');
      input.setAttribute('placeholder', 'Sorry! Something went wrong.');
      input.style.backgroundImage = 'url("https://maps.gstatic.com/mapfiles/api-3/images/icon_error.png")';
    });

    await expect(origin).toBeEnabled();
    await expect(origin).toHaveAttribute('placeholder', 'e.g. Helsinki Airport (HEL)');

    await origin.fill('Helsinki Air');
    await expect(page.locator('.fare-suggestion-btn')).toContainText('Helsinki Airport');

    await page.locator('.fare-suggestion-btn').click();
    await expect(origin).toHaveValue('Helsinki Airport, Lentoasemantie, Vantaa, Finland');
  });
});

// @ts-check
const { test, expect } = require('@playwright/test');

const handler = require('../api/lead-notification');

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
  };
}

test.describe('lead notification endpoint', () => {
  test('sends lead notification to the original email address', async () => {
    const originalApiKey = process.env.RESEND_API_KEY;
    const originalNotifyEmail = process.env.LEAD_NOTIFY_EMAIL;
    const originalFromEmail = process.env.LEAD_FROM_EMAIL;
    const originalFetch = global.fetch;

    process.env.RESEND_API_KEY = 'test-resend-key';
    delete process.env.LEAD_NOTIFY_EMAIL;
    process.env.LEAD_FROM_EMAIL = 'Luxival Website <hello@luxival.com>';

    let resendRequest;
    global.fetch = async (url, options) => {
      resendRequest = {
        url,
        options,
        body: JSON.parse(options.body),
      };
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 'email_test_123' }),
      };
    };

    const req = {
      method: 'POST',
      body: {
        type: 'Website audit booking',
        name: 'Test Client',
        email: 'client@example.com',
        phone: '+358 50 000 0000',
        company: 'Client Company',
        preferredDate: '2026-06-20',
        preferredTime: '10:30',
        message: 'Please audit my website.',
        source: 'audit-booking-intake',
      },
    };
    const res = createMockResponse();

    try {
      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, id: 'email_test_123' });
      expect(resendRequest.url).toBe('https://api.resend.com/emails');
      expect(resendRequest.body.to).toEqual(['sarakuvam@gmail.com']);
      expect(resendRequest.body.reply_to).toBe('client@example.com');
      expect(resendRequest.body.subject).toContain('Website audit booking');
      expect(resendRequest.options.headers.Authorization).toBe('Bearer test-resend-key');
    } finally {
      global.fetch = originalFetch;
      if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
      else process.env.RESEND_API_KEY = originalApiKey;
      if (originalNotifyEmail === undefined) delete process.env.LEAD_NOTIFY_EMAIL;
      else process.env.LEAD_NOTIFY_EMAIL = originalNotifyEmail;
      if (originalFromEmail === undefined) delete process.env.LEAD_FROM_EMAIL;
      else process.env.LEAD_FROM_EMAIL = originalFromEmail;
    }
  });
});

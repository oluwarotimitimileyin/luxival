// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('chat lead form', () => {
  test('does not show Sent when email notification fails', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'I can help with that. I will collect your details now.',
          lead: {
            service: 'Airport transfer',
            intent: 'Booking',
            message: 'Airport transfer booking request',
          },
        }),
      });
    });

    await page.route('**/api/lead-notification', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Email notification is not configured',
          requiredEnv: ['RESEND_API_KEY'],
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: /open luxival chat/i }).click();
    await page.getByPlaceholder('Type your question...').fill('I need to book an airport transfer');
    await page.getByRole('button', { name: /^send$/i }).click();

    await page.locator('#chatLeadForm').waitFor();
    await page.locator('#leadName').fill('Test Client');
    await page.locator('#leadEmail').fill('client@example.com');
    await page.locator('#leadPhone').fill('+358 50 000 0000');
    await page.locator('#leadSubmit').click();

    await expect(page.locator('#leadFeedback')).toContainText('Could not send');
    await expect(page.locator('#leadSubmit')).toHaveText('Try again');
    await expect(page.locator('#leadSubmit')).toBeEnabled();
  });
});

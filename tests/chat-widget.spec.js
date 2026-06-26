// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://www.luxival.com';
const needsApi = BASE.startsWith('http://localhost') ? test.skip : test;

test.describe('Chat Widget Language Switch', () => {
  test('chat toggle and greeting update when language changes', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('networkidle');

    // Open the chat widget
    const toggle = page.locator('#chatToggle');
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click();
    await expect(page.locator('#chatPanel')).toBeVisible();

    // Verify default English text
    await expect(toggle).toContainText('Talk to Luxival');

    // Switch language to Russian (has full chat translations)
    const langSelect = page.locator('#lang-select');
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('ru');
    await page.waitForTimeout(500);

    // Toggle button should now show Russian
    await expect(toggle).toContainText('Общаться с Luxival');

    // Header title should be in Russian
    await expect(page.locator('.chat-header strong')).toContainText('Ассистент Luxival');

    // Input placeholder should be in Russian
    await expect(page.locator('#chatInput')).toHaveAttribute('placeholder', 'Введите ваш вопрос...');

    // Greeting message in chat should be in Russian
    const greeting = page.locator('.chat-messages .chat-bubble.assistant').first();
    await expect(greeting).toContainText('Здравствуйте! Я ассистент Luxival.');
  });
});

test.describe('Chat Widget Reply', () => {
  test('sends a message and receives a reply', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForLoadState('networkidle');

    // Open chat
    const toggle = page.locator('#chatToggle');
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click();
    await expect(page.locator('#chatPanel')).toBeVisible();

    // Type a message and send
    const input = page.locator('#chatInput');
    const sendBtn = page.locator('.chat-button');
    await expect(input).toBeVisible();
    await input.fill('I need a website');
    await sendBtn.click();

    // Wait for the assistant reply to appear (api/chat may use real AI or fallback)
    await page.waitForTimeout(8000);

    // Verify there are at least 2 chat bubbles (user + assistant)
    const bubbles = page.locator('.chat-messages .chat-bubble');
    const count = await bubbles.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // The last bubble should be from assistant with a non-empty reply
    const lastBubble = page.locator('.chat-messages .chat-bubble.assistant').last();
    const replyText = await lastBubble.textContent();
    expect(replyText.length).toBeGreaterThan(10);
  });

  needsApi('assistant reply is context-aware to page content', async ({ page }) => {
    await page.goto(BASE + '/qa');
    await page.waitForLoadState('networkidle');

    // Open chat
    await page.locator('#chatToggle').click();
    await expect(page.locator('#chatPanel')).toBeVisible();

    // Ask about QA services
    const input = page.locator('#chatInput');
    await input.fill('Tell me about website audits');
    await page.locator('.chat-button').click();

    // Wait for reply
    await page.waitForTimeout(10000);

    // Reply should mention audits, QA, or related terms
    // Use last non-lead-form assistant bubble (lead forms append after reply)
    const assistantBubbles = page.locator('.chat-messages .chat-bubble.assistant:not(.lead-form)');
    const lastBubble = assistantBubbles.last();
    const replyText = await lastBubble.textContent();
    expect(replyText.toLowerCase()).toMatch(/audit|qa|test|website|report/);
  });
});

test.describe('Chat Widget Portfolio Knowledge', () => {
  needsApi('assistant can describe portfolio projects when asked', async ({ page }) => {
    await page.goto(BASE + '/portfolio');
    await page.waitForLoadState('networkidle');

    // Open chat
    await page.locator('#chatToggle').click();
    await expect(page.locator('#chatPanel')).toBeVisible();

    // Ask about projects
    const input = page.locator('#chatInput');
    await input.fill('What projects have you built?');
    await page.locator('.chat-button').click();

    // Wait for reply
    await page.waitForTimeout(10000);

    // Reply should mention at least one project name
    // Use last non-lead-form assistant bubble (lead forms append after reply)
    const assistantBubbles = page.locator('.chat-messages .chat-bubble.assistant:not(.lead-form)');
    const lastBubble = assistantBubbles.last();
    const replyText = await lastBubble.textContent();
    expect(replyText.toLowerCase()).toMatch(/esg|businesslauncher|vortex|ugc|aura|qa dashboard|growth/);
  });
});

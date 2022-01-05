import { test, expect } from '@playwright/test';

test('Flex loads after login', async ({ page, context }) => {
  page.goto('http://localhost:3000/');
  await page.waitForNavigation({timeout: 180000});
  const usernameBox = page.locator('input#okta-signin-username');
  const passwordBox = page.locator('input#okta-signin-password');
  const submitButton = page.locator('input#okta-signin-submit');
  await Promise.all([
    usernameBox.waitFor(),
    passwordBox.waitFor(),
    submitButton.waitFor()
  ]);
  await usernameBox.fill(process.env.PLAYWRIGHT_USER_USERNAME);
  await passwordBox.fill(process.env.PLAYWRIGHT_USER_PASSWORD);
  await Promise.all([
    page.waitForNavigation(), // Waits for the next navigation
    submitButton.click(), // Triggers a navigation after a timeout
  ]);
  await context.storageState({ path: 'temp/state.json' })
  const logoImage = page.locator('.Twilio.Twilio-MainHeader img');
  await logoImage.waitFor();
  await expect(logoImage).toHaveAttribute('src', /.*aselo.*/);
});

test('Plugin loads', async ({ browser }) => {
  const context = await browser.newContext({storageState: 'temp/state.json'});
  const page = await context.newPage();
  page.goto('http://localhost:3000/', { waitUntil: 'networkidle'});
  const callsWaitingLabel = page.locator('div.Twilio-AgentDesktopView-default div[data-testid=\'channel-column-calls\']');
  await callsWaitingLabel.waitFor();
  await expect(callsWaitingLabel).toContainText('Calls');
});
import { chromium, expect, FullConfig, firefox } from '@playwright/test';
import config from './playwright.config';

// TODO: Replace with API call
async function globalSetup(config: FullConfig) {
  console.log('Global setup started');
  if (config.projects.length>1) {
    console.warn(`Tests have ${config.projects.length} set up, only running global configuration against the first one - consider revising the global setup code.` )
  }
  const project = config.projects[0];
  const browser = await chromium.launch();
  console.log('Global setup browser launched');
  const page = await browser.newPage();
  page.goto(project.use.baseURL, {timeout: 30000});
  await page.waitForNavigation({timeout: 30001});
  const usernameBox = page.locator('input#okta-signin-username');
  const passwordBox = page.locator('input#okta-signin-password');
  const submitButton = page.locator('input#okta-signin-submit');
  await Promise.all([
    usernameBox.waitFor(),
    passwordBox.waitFor(),
    submitButton.waitFor()
  ]);
  console.log('Global setup boxes found');
  await usernameBox.fill(process.env.PLAYWRIGHT_USER_USERNAME);
  await passwordBox.fill(process.env.PLAYWRIGHT_USER_PASSWORD);
  await Promise.all([
    page.waitForNavigation({ timeout: 30000 }), // Waits for the next navigation
    submitButton.click(), // Triggers a navigation after a timeout
  ]);
  await page.context().storageState({ path: 'temp/state.json' })
  const logoImage = page.locator('.Twilio.Twilio-MainHeader img');
  await logoImage.waitFor();
  await expect(logoImage).toHaveAttribute('src', /.*aselo.*/);
  console.log('Global setup completed');
}

export default globalSetup;
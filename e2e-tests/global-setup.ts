import { chromium, expect, FullConfig } from '@playwright/test';

// TODO: Replace with API call
async function globalSetup(config: FullConfig) {
  if (config.projects.length>1) {
    console.warn(`Tests have ${config.projects.length} set up, only running global configuration against the first one - consider revising the global setup code.` )
  }
  const project = config.projects[0];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.goto(project.use.baseURL);
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
    page.waitForNavigation({ timeout: 60000 }), // Waits for the next navigation
    submitButton.click(), // Triggers a navigation after a timeout
  ]);
  await page.context().storageState({ path: 'temp/state.json' })
  const logoImage = page.locator('.Twilio.Twilio-MainHeader img');
  await logoImage.waitFor();
  await expect(logoImage).toHaveAttribute('src', /.*aselo.*/);
}

export default globalSetup;
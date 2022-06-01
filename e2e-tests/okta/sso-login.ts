// eslint-disable-next-line import/no-extraneous-dependencies
import { chromium, expect, FullConfig, request } from '@playwright/test';

const formRegex =
  /<input\s*name="SAMLResponse"\s*type="hidden"\s*value="(?<samlResponse>[\w;#&]+)"\s*\/>\s*<input\s*name="RelayState"\s*type="hidden"\s*value="(?<relayState>[\w;#&]+)"\s*\/>/;

// NOT GENERAL PURPOSE - Only works for those encoded as hex character codes, not named symbols like &amp; or decimal character codes
// bodged from https://stackoverflow.com/a/7394814
function decodeHtmlSymbols(htmlString: string): string {
  return htmlString.replace(/&#x([0-9a-f]{1,3});/gi, (match, numStr) => {
    const num = parseInt(numStr, 16); // read num as hex number
    return String.fromCharCode(num);
  });
}

export async function oktaSsoLoginViaApi(
  homeUrl: string,
  username: string,
  password: string,
  accountSid: string,
): Promise<void> {
  const apiRequest = await request.newContext();
  // Get the saml location URL
  const authenticateRequestOptions = { data: { products: ['flex'], resource: homeUrl } };
  const authenticateResponse = await apiRequest.post(
    `https://preview.twilio.com/iam/Accounts/${accountSid}/authenticate`,
    authenticateRequestOptions,
  );
  expect(authenticateResponse.ok());
  const { location: samlLocation } = await authenticateResponse.json();

  // Login via okta API
  const authnResponse = await apiRequest.post('https://techmatters.okta.com/api/v1/authn', {
    data: {
      username,
      password,
      options: { warnBeforePasswordExpired: true, multiOptionalFactorEnroll: true },
    },
  });
  expect(authnResponse.ok()).toBe(true);
  const { status, sessionToken } = await authnResponse.json();
  expect(status).toBe('SUCCESS');

  // Cookie redirect
  const redirectResponse = await apiRequest.get(
    `https://techmatters.okta.com/login/sessionCookieRedirect?checkAccountSetupComplete=true&token=${encodeURIComponent(
      sessionToken,
    )}&redirectUrl=${encodeURIComponent(samlLocation)}`,
    {
      headers: {
        accept: 'application/json',
        authority: 'techmatters.okta.org',
      },
    },
  );
  expect(redirectResponse.ok()).toBe(true);

  // Scrape required SAML response values from the HTML response in the redirected page
  // this is kinda :vomit but I couldn't see an alternative API that provides this via JSON or another API friendly format
  const samlResponseHtml = await redirectResponse.text();
  const { samlResponse, relayState } = samlResponseHtml.match(formRegex)!.groups!;

  // Post the SAML response to twilio - if successful this redirects to the flex landing page, whose contents we drop on the floor, we just want to ensure the cookies get set
  const flexPageResponse = await apiRequest.post(
    `https://iam.twilio.com/v1/Accounts/${accountSid}/saml2`,
    {
      form: {
        SAMLResponse: decodeHtmlSymbols(samlResponse),
        RelayState: decodeHtmlSymbols(relayState),
      },
    },
  );
  expect(flexPageResponse.ok()).toBe(true);
  await flexPageResponse.dispose(); //Not sure if this is strictly necessary

  await apiRequest.storageState({ path: 'temp/state.json' });
}

export async function oktaSsoLoginViaGui(
  config: FullConfig,
  username: string,
  password: string,
): Promise<void> {
  const project = config.projects[0];
  const browser = await chromium.launch(project.use);
  console.log('Global setup browser launched');
  const page = await browser.newPage();
  page.goto(project.use.baseURL!, { timeout: 30000 });
  await page.waitForNavigation({ timeout: 30001 });
  const usernameBox = page.locator('input#okta-signin-username');
  const passwordBox = page.locator('input#okta-signin-password');
  const submitButton = page.locator('input#okta-signin-submit');
  await Promise.all([usernameBox.waitFor(), passwordBox.waitFor(), submitButton.waitFor()]);
  console.log('Global setup boxes found');
  await usernameBox.fill(username);
  await passwordBox.fill(password);
  await Promise.all([
    page.waitForNavigation({ timeout: 30000 }), // Waits for the next navigation
    submitButton.click(), // Triggers a navigation after a timeout
  ]);
  const logoImage = page.locator('.Twilio.Twilio-MainHeader img');
  await logoImage.waitFor();
  await expect(logoImage).toHaveAttribute('src', /.*aselo.*/);
  await page.context().storageState({ path: 'temp/state.json' });
  await browser.close();
}

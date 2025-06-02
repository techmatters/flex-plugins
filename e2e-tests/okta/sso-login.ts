/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, request } from '@playwright/test';
import { getConfigValue } from '../config';
import { createHash, randomUUID } from 'node:crypto';

export function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

const formRegex =
  /<form\s*id="appForm"\s*action="(?<actionUrl>[\w.;#&]+)"\s*method="POST"\s*>\s*<input\s*name="SAMLResponse"\s*type="hidden"\s*value="(?<samlResponse>[\w;#&-]+)"\s*\/>\s*<input\s*name="RelayState"\s*type="hidden"\s*value="(?<relayState>[\w;#&-]+)"\s*\/>/;

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
): Promise<string> {
  const apiRequest = await request.newContext();
  const configResp = await fetch(
    `https://services.twilio.com/v1/Flex/Authentication/Config?AccountSid=${accountSid}`,
  );
  if (!configResp.ok) {
    throw new Error(
      `Failed to fetch auth config for ${accountSid}: [${
        configResp.status
      }]: ${await configResp.text()}`,
    );
  }
  const {
    config_list: [{ connection_name: connectionName, client_id: clientId }],
  } = await configResp.json();

  // Get the saml location URL
  const codeVerifier = `${randomUUID()}${randomUUID()}`;
  const nonce = Math.random().toString(16);
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
  const authenticateResponse = await apiRequest.get(
    `https://services.twilio.com/v1/Flex/Authorize?codeChallenge=${codeChallenge}&nonce=${nonce}&redirectUrl=${homeUrl}&ssoProfileSid=${connectionName}`,
  );
  if (!authenticateResponse.ok()) {
    console.error(`Error calling initial authorize`, await authenticateResponse.text());
  }
  expect(authenticateResponse.ok());
  // const content = await authenticateResponse.text();
  const samlLocation = new URL(authenticateResponse.url()).searchParams.get('fromURI')!;

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
  const { samlResponse, relayState, actionUrl } = samlResponseHtml.match(formRegex)!.groups!;

  const flexTimeoutTime = Date.now() + 120000; // 2 minutes
  // Post the SAML response to twilio - if successful this redirects to the flex landing page, whose contents we drop on the floor, we just want to ensure the cookies get set
  let flexPageResponse = null;
  while (!flexPageResponse) {
    try {
      flexPageResponse = await apiRequest.post(decodeHtmlSymbols(actionUrl), {
        form: {
          SAMLResponse: decodeHtmlSymbols(samlResponse),
          RelayState: decodeHtmlSymbols(relayState),
        },
        timeout: 600000, // Long timeout in case a local dev server is still starting up
        maxRedirects: 0,
      });
      if (flexPageResponse.status() === 303) {
        break;
      }
    } catch (err) {
      const error = <Error>err;
      if (Date.now() > flexTimeoutTime || error.message.indexOf('ECONNREFUSED') === -1) {
        throw err;
      } else {
        console.warn(`Flex server not listening yet, retrying`);
        await delay(300);
      }
    }
  }

  expect(flexPageResponse.status()).toBe(302);
  const redirectHost = new URL(flexPageResponse.url()).host;
  const redirectHeaders = flexPageResponse.headers();
  const redirectURL = new URL(
    `https://${redirectHost}${redirectHeaders.location ?? redirectHeaders.Location!}`,
  );
  const resp = await apiRequest.get(redirectURL.toString());
  console.debug('logged in page', await resp.text());
  expect(resp.ok()).toBe(true);
  await apiRequest.storageState({ path: getConfigValue('storageStatePath') as string });
  const tokenLookupResponse = await apiRequest.post(`https://preview.twilio.com/Flex/Tokens`, {
    multipart: {
      AuthCode: new URL(resp.url()).searchParams.get('code')!,
      Nonce: nonce,
      CodeVerifier: codeVerifier,
      RedirectUrl: 'https://services.twilio.com/v1/Flex/Authentication/Callback',
      ClientId: clientId,
    },
  });
  if (!tokenLookupResponse.ok()) {
    console.error(`Looking up token failed`, await tokenLookupResponse.text());
  }
  expect(tokenLookupResponse.ok()).toBe(true);
  const { token } = await tokenLookupResponse.json();
  return token!;
}

export async function legacyOktaSsoLoginViaApi(
  homeUrl: string,
  username: string,
  password: string,
  accountSid: string,
): Promise<string> {
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

  const flexTimeoutTime = Date.now() + 120000; // 2 minutes
  // Post the SAML response to twilio - if successful this redirects to the flex landing page, whose contents we drop on the floor, we just want to ensure the cookies get set
  let flexPageResponse = null;
  while (!flexPageResponse) {
    try {
      flexPageResponse = await apiRequest.post(
        `https://iam.twilio.com/v1/Accounts/${accountSid}/saml2`,
        {
          form: {
            SAMLResponse: decodeHtmlSymbols(samlResponse),
            RelayState: decodeHtmlSymbols(relayState),
          },
          timeout: 600000, // Long timeout in case a local dev server is still starting up
          maxRedirects: 0,
        },
      );
      if (flexPageResponse.status() === 303) {
        break;
      }
    } catch (err) {
      const error = <Error>err;
      if (Date.now() > flexTimeoutTime || error.message.indexOf('ECONNREFUSED') === -1) {
        throw err;
      } else {
        console.warn(`Flex server not listening yet, retrying`);
        await delay(300);
      }
    }
  }
  expect(flexPageResponse.status()).toBe(303);
  const redirectHeaders = flexPageResponse.headers();
  const redirectURL = new URL(redirectHeaders.location ?? redirectHeaders.Location!);
  const resp = await apiRequest.get(redirectURL.toString());
  expect(resp.ok()).toBe(true);
  await apiRequest.storageState({ path: getConfigValue('storageStatePath') as string });
  return redirectURL.searchParams.get('Token')!;
}

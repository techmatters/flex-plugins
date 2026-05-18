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
import { Page } from '@playwright/test';
import context from './global-context';

/**
 * Sets up a browser session with the correct cookies and local storage to be in an authenticated state according to Flex
 * @param page
 * @param accountSid
 */
export const fakeAuthenticatedBrowser = async (page: Page, accountSid: string): Promise<Page> => {
  await page.route('https://services.twilio.com/v1/Flex/Authorize', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    });
  });
  console.debug('https://services.twilio.com/v1/Flex/Authorize mocked');
  await page.route(
    `https://flex-api.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Tokens/Info`,
    (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    },
  );
  console.debug('https://services.twilio.com/v1/Flex/Authorize mocked');

  await page.context().addCookies([
    {
      name: 'flex-agent-account',
      value: accountSid,
      domain: '.flex.twilio.com',
      expires: 2 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'None',
      httpOnly: true,
      path: '/',
    },
    {
      name: 'flex-jwe',
      value: 'stub_flex_jwe_token',
      domain: '.flex.twilio.com',
      expires: 2 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'None',
      httpOnly: true,
      path: '/',
    },
  ]);

  await page.addInitScript((ctx: typeof context) => {
    const TOKEN_LOCAL_STORAGE_KEY = 'TWILIO_FLEX_SSO';
    const DEFAULT_STORED_TOKEN = {
      roles: ['admin'],
      identity: 'steveh@techmatters.org',
      expiration: new Date(Date.now() + 3 * 60 * 60 * 1000),
      token: ctx.FLEX_SSO_TOKEN,
    };
    window.localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_STORED_TOKEN));
  }, context);
  return page;
};

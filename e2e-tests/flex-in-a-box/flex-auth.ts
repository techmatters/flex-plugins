// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

export const fakeAuthenticatedBrowser = async (page: Page, accountSid: string): Promise<Page> => {
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
  await page.addInitScript(() => {
    const TOKEN_LOCAL_STORAGE_KEY = 'TWILIO_FLEX_SSO';
    const DEFAULT_STORED_TOKEN = {
      roles: ['admin'],
      identity: 'steveh@techmatters.org',
      expiration: '2023-01-15T00:21:16Z',
      token: 'STUB_FLEX_SSO_TOKEN',
    };
    window.localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_STORED_TOKEN));
  });
  return page;
};

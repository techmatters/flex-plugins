// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from './global-context';

/**
 * Sets up a browser session with the correct cookies and local storage to be in an authenticated state according to Flex
 * @param page
 * @param accountSid
 */
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

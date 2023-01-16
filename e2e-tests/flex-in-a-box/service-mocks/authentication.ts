// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addHours } from 'date-fns';

const DEFAULT_VALIDATE_RESPONSE = {
  code: 0,
  worker_sid: 'WKxxx',
  roles: ['admin'],
  realm_user_id: 'steveh@techmatters.org',
  valid: true,
  expiration: '2023-01-15T08:49:59Z',
  message: null,
  identity: 'steveh_40techmatters_2Eorg',
};

const refreshResponse = (token: string) => ({
  token,
  roles: [],
  expiration: addHours(new Date(), 1).toISOString(),
  identity: 'steveh_40techmatters_2Eorg',
});

export const authenticationServices = (page: Page) => {
  async function mockTwilioIamValidate(accountSid: string): Promise<void> {
    await page.route(
      `https://iam.twilio.com/v1/Accounts/${accountSid}/Tokens/validate`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(DEFAULT_VALIDATE_RESPONSE),
        });
      },
    );
    console.log(`https://iam.twilio.com/v1/Accounts/${accountSid}/Tokens/validate mocked.`);
  }

  async function mockTwilioIamRefresh(accountSid: string): Promise<void> {
    await page.route(`https://iam.twilio.com/v1/Accounts/${accountSid}/Tokens/refresh`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(refreshResponse('REFRESHED_TOKEN')),
      });
    });
    console.log(`https://iam.twilio.com/v1/Accounts/${accountSid}/Tokens/refresh mocked.`);
  }

  return {
    mockTwilioIamValidate,
    mockTwilioIamRefresh,
  };
};

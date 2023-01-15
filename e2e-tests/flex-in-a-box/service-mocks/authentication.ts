// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';

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
  }

  return {
    mockTwilioIamValidate,
  };
};

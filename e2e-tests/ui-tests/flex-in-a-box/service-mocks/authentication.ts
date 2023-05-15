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
// eslint-disable-next-line import/no-extraneous-dependencies
import { addHours } from 'date-fns';

const validateResponse = () => ({
  code: 0,
  worker_sid: 'WKxxx',
  roles: ['admin'],
  realm_user_id: 'steveh@techmatters.org',
  valid: true,
  expiration: addHours(new Date(), 3).toISOString(),
  message: null,
  identity: 'steveh_40techmatters_2Eorg',
});

const refreshResponse = (token: string) => ({
  token,
  roles: [],
  expiration: addHours(new Date(), 3).toISOString(),
  identity: 'steveh_40techmatters_2Eorg',
});

/**
 * Mocks the Twilio IAM service for the given accountSid
 * Validates everything. :-)
 */
export const authenticationServices = (page: Page) => {
  async function mockTwilioIamValidate(accountSid: string): Promise<void> {
    await page.route(
      `https://iam.twilio.com/v1/Accounts/${accountSid}/Tokens/validate`,
      (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(validateResponse()),
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

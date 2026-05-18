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

import flexContext from '../../flex-in-a-box/global-context';
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from '../global-context';

let newContactId = 1234;

const hrmContacts = () => {
  const PATH_PREFIX = `/v0/accounts/${flexContext.ACCOUNT_SID}/contacts`;

  return {
    mockCaseEndpoints: async (page: Page) => {
      await page.route(new URL(PATH_PREFIX, context.HRM_BASE_URL).toString(), async (route) => {
        if (route.request().method().toUpperCase() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...route.request().postDataJSON(),
              id: newContactId,
            }),
          });
        } else {
          await route.continue();
        }
      });
      await page.route(
        new URL(`${PATH_PREFIX}/byTaskSid/*`, context.HRM_BASE_URL).toString(),
        async (route) => {
          if (route.request().method().toUpperCase() === 'GET') {
            await route.fulfill({
              status: 404,
              contentType: 'application/json',
              body: JSON.stringify({}),
            });
          } else {
            await route.continue();
          }
        },
      );
    },
  };
};

export default hrmContacts;

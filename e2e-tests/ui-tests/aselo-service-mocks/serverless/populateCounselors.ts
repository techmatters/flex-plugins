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
import context from '../global-context';
import flexContext from '../../flex-in-a-box/global-context';

export const mockPopulateCounselors = async (page: Page) => {
  await page.route(
    new URL('/populateCounselors', context.SERVERLESS_BASE_URL).toString(),
    (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          workerSummaries: [
            { fullName: 'Logged In Counsellor', sid: flexContext.LOGGED_IN_WORKER_SID },
            { fullName: 'Lorna Ballentyne', sid: 'WK_LORNA' },
          ],
        }),
      });
    },
  );
};

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
import { Page } from '@playwright/test';
import context from '../global-context';
import * as path from 'path';
import e2ePermissions from './e2e.json';

const hrmPermissions = () => {
  const PATH_PREFIX = `/v0/accounts/${flexContext.ACCOUNT_SID}/permissions`;
  const mockPermissions = e2ePermissions;

  return {
    getMockPermissions: () => mockPermissions,
    mockPermissionEndpoint: async (page: Page) => {
      await page.route(
        new URL(path.join(PATH_PREFIX), context.HRM_BASE_URL).toString(),
        async (route) => {
          await route.fulfill({ json: mockPermissions });
        },
      );
    },
  };
};

export default hrmPermissions;

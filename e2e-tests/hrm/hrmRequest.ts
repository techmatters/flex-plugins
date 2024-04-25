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

import { APIRequestContext } from '@playwright/test';
import { getConfigValue, localOverrideEnv } from '../config';

export const apiHrmRequest =
  (apiRequest: APIRequestContext, flexToken: string) =>
  async (hrmPath: string, method: 'get' | 'delete' | 'patch' = 'get', body?: any) => {
    const hrmRoot =
      (getConfigValue('hrmRoot') as string) ||
      `https://hrm-${localOverrideEnv}.tl.techmatters.org/v0/accounts/${getConfigValue(
        'twilioAccountSid',
      )}-aselo_test`;
    const resp = await apiRequest[method](new URL(`${hrmRoot}/${hrmPath}`).toString(), {
      data: body,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${flexToken}`,
      },
    });
    if (resp.ok()) {
      return resp.json();
    } else if (resp.status() === 404) {
      console.warn(`Not found at ${hrmPath}`);
      return null;
    } else {
      throw new Error(`Error occurred querying ${hrmPath} in HRM: ${resp.status()}`);
    }
  };

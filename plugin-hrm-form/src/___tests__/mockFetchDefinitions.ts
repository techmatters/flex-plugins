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

import * as fs from 'fs/promises';

import { mockFetchDefinitions } from 'hrm-form-definitions';

export const mockLocalFetchDefinitions = () =>
  mockFetchDefinitions(async (jsonPath: string) => {
    try {
      return JSON.parse(await fs.readFile(`../lambdas/packages/hrm-form-definitions/${jsonPath}`, 'utf8'));
    } catch (e) {
      const error = e as any;
      if (error.code === 'ENOENT') {
        return undefined;
      }
      throw error;
    }
  });

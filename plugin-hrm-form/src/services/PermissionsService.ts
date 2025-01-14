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

import { RulesFile } from '../permissions';
import { fetchHrmApi } from './fetchHrmApi';

// eslint-disable-next-line import/no-unused-modules
export const getPermissionRules = async (): Promise<RulesFile> => {
  try {
    const response = await fetchHrmApi('/permissions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`>>> Error fetching permission rules: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('>>> Failed to fetch permission rules:', error);
    throw error;
  }
};

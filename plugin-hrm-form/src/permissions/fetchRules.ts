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

import type { RulesFile } from '.';
import { fetchPermissionRules } from '../services/PermissionsService';
import { getAseloFeatureFlags, getHrmConfig } from '../hrmConfig';

export const fetchRules = async (): Promise<RulesFile> => {
  const { enable_permissions_from_backend: enablePermissionsFromBackend } = getAseloFeatureFlags();

  try {
    if (enablePermissionsFromBackend) {
      return await fetchPermissionRules();
    }

    const { permissionConfig } = getHrmConfig();
    // eslint-disable-next-line global-require
    return require(`./${permissionConfig}.json`);
  } catch (err) {
    const context = enablePermissionsFromBackend ? 'backend' : 'local config';
    const errorMessage = `Failed to load permissions from ${context}: ${err.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * A helpline's HRM permissions (hrm repo, hrm-domain/hrm-core/permission-rules/<name>.json): for
 * each action, the ways someone is allowed to do it. Any one way is enough; every condition in a way
 * must hold; no ways at all means nobody.
 */
// 'isSupervisor', or one with a value: { createdHoursAgo: 24 }, { field: 'rawJson.caseInformation.x' }
export type PermissionCondition = string | Record<string, unknown>;
export type PermissionRules = Record<string, PermissionCondition[][]>;

export type PermissionsInfo = {
  // The rules file the helpline uses (permission_config), e.g. 'usnm'
  name: string;
  // Each environment's, from the .hcl files, e.g. { staging: 'demo', production: 'demo' }
  environments: Record<string, string>;
  // Other helplines using the same file: a change applies to them too
  sharedWith: string[];
  // Client profiles are on (attributes.enableClientProfiles isn't false)
  clientProfiles: boolean;
  // Where the file was read from, e.g. 'techmatters/hrm (master)'
  source: string;
  // Why it couldn't be read
  error?: string;
};

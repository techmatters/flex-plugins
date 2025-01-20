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
// import defaultRules from './e2e.json';

// import defaultRules from './closed.json';

const closedRules = require('./closed.json');
const e2eRules = require('./e2e.json');


// TODO: do this once, on initialization, then consume from the global state.
export const fetchRules = async (): Promise<RulesFile> => {
  let rules: RulesFile = null;

  try {
    rules = await fetchPermissionRules();
  } catch (err) {
    console.error('Error fetching rules:', err);
    rules = e2eRules;
  }

  return rules;
};

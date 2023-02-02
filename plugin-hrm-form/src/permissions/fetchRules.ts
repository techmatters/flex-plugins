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

const zmRules = require('./zm.json');

// TODO: do this once, on initialization, then consume from the global state.
export const fetchRules = (permissionConfig: string) => {
  try {
    // eslint-disable-next-line global-require
    const rules = require(`./${permissionConfig}.json`);

    if (!rules) throw new Error(`Cannot find rules for ${permissionConfig}`);

    return rules;
  } catch (err) {
    const errorMessage = err.message ?? err;
    console.error('Error fetching rules, using fallback rules. ', errorMessage);

    return zmRules;
  }
};

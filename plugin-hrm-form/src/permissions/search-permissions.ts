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

import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';

import { fetchRules } from './fetchRules';
import { getHrmConfig } from '../hrmConfig';

type RulesFile = ReturnType<typeof fetchRules>;

type TargetRule = Partial<Record<keyof RulesFile, string[]>>;

/**
 * This function returns a function that check if a given rule exists.
 *
 * Usage:
 * const checkRule = buildCheckRule(rulesFile);
 * checkRule({ viewContact: ['isOwner'] }); // returns true or false
 * checkRule({ viewCase: ['isCreator'] });  // returns true or false
 */
const checkRule = (targetRule: TargetRule) => {
  const { permissionConfig } = getHrmConfig();
  const rulesFile = fetchRules(permissionConfig);

  const rule = Object.keys(targetRule)[0];
  const conditionSetIsEqual = conditionSet => isEqual(sortBy(conditionSet), sortBy(targetRule[rule]));
  return rulesFile[rule].some(conditionSetIsEqual);
};

export const canOnlyViewOwnCases = (): boolean => {
  const { isSupervisor } = getHrmConfig();

  const canViewAsSupervisor = isSupervisor && checkRule({ viewCase: ['isSupervisor'] });
  const canViewAsOwner = checkRule({ viewCase: ['isCreator'] });
  return !canViewAsSupervisor && canViewAsOwner;
};

export const canOnlyViewOwnContacts = (): boolean => {
  const { isSupervisor } = getHrmConfig();

  const canViewAsSupervisor = isSupervisor && checkRule({ viewContact: ['isSupervisor'] });
  const canViewAsOwner = checkRule({ viewContact: ['isOwner'] });
  return !canViewAsSupervisor && canViewAsOwner;
};

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

import each from 'jest-each';

import { getConfig } from '../../HrmFormPlugin';
import * as fetchRulesModule from '../../permissions/fetchRules';
import {
  getPermissionsForCase,
  getPermissionsForContact,
  getPermissionsForViewingIdentifiers,
  PermissionActions,
  CaseActions,
  ContactActions,
  ViewIdentifiersAction,
} from '../../permissions';

jest.mock('../../HrmFormPlugin');

const buildRules = conditionsSets =>
  Object.values(PermissionActions).reduce((accum, action) => ({ ...accum, [action]: conditionsSets }), {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Test that all actions work fine (everyone)', () => {
  const rules = buildRules([['everyone']]);
  jest.spyOn(fetchRulesModule, 'fetchRules').mockReturnValue(rules);

  getConfig.mockReturnValue({
    workerSid: 'not creator',
    isSupervisor: false,
    permissionConfig: 'wareva',
  });

  const { can } = getPermissionsForCase('notCreator', 'open');

  each(
    Object.values(PermissionActions).map(action => ({
      action,
    })),
  ).test(`Action $action should return true`, ({ action }) => {
    expect(can(action)).toBeTruthy();
  });
});

describe('Test different scenarios (all CasesActions)', () => {
  each(
    Object.values(CaseActions)
      .flatMap(action => [
        {
          action,
          conditionsSets: [['everyone']],
          workerSid: 'not creator',
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is not creator nor supervisor, case is open',
        },
        {
          action,
          conditionsSets: [['everyone']],
          workerSid: 'not creator',
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is not creator nor supervisor, case is close',
          status: 'close',
        },
        {
          action,
          conditionsSets: [],
          workerSid: 'creator',
          isSupervisor: true,
          expectedResult: false,
          expectedDescription: 'user is creator, supervisor, case is open',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: 'not creator',
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'user is supervisor but not creator, case open',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: 'not creator',
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'user is supervisor but not creator, case closed',
          status: 'closed',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: 'not creator',
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'user is not supervisor nor creator',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: 'creator',
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'user is creator and case is open',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: 'creator',
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'user is creator but case is closed',
          status: 'closed',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: 'not creator',
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'case is open but user is not creator',
        },
      ])
      .map(t => ({ ...t, prettyConditionsSets: t.conditionsSets.map(arr => `[${arr.join(',')}]`) })),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    ({ action, conditionsSets, workerSid, isSupervisor, status = 'open', expectedResult }) => {
      const rules = buildRules(conditionsSets);
      jest.spyOn(fetchRulesModule, 'fetchRules').mockReturnValueOnce(rules);

      getConfig.mockReturnValueOnce({
        workerSid,
        isSupervisor,
        permissionConfig: 'wareva',
      });

      const { can } = getPermissionsForCase('creator', status);

      expect(can(action)).toBe(expectedResult);
    },
  );
});

describe('Test different scenarios (all ContactActions)', () => {
  each(
    Object.values(ContactActions)
      .flatMap(action => [
        {
          action,
          conditionsSets: [['everyone']],
          workerSid: 'not owner',
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is not owner nor supervisor',
        },
        {
          action,
          conditionsSets: [],
          workerSid: 'owner',
          isSupervisor: true,
          expectedResult: false,
          expectedDescription: 'user is owner and supervisor',
        },
        {
          action,
          conditionsSets: [['isOwner']],
          workerSid: 'owner',
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is a owner but not a supervisor',
        },
        {
          action,
          conditionsSets: [['isSupervisor']],
          workerSid: 'not owner',
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'is a supervisor but not a owner',
        },
        {
          action,
          conditionsSets: [['isOwner']],
          workerSid: 'not owner',
          isSupervisor: true,
          expectedResult: false,
          expectedDescription: 'is not a owner but a supervisorr',
        },
        {
          action,
          conditionsSets: [['isSupervisor']],
          workerSid: 'owner',
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'is a supervisor but not a owner',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isOwner']],
          workerSid: 'not owner',
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'user is supervisor but not owner',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isOwner']],
          workerSid: 'not owner',
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'user is supervisor but not owner',
        },
      ])
      .map(t => ({ ...t, prettyConditionsSets: t.conditionsSets.map(arr => `[${arr.join(',')}]`) })),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    ({ action, conditionsSets, workerSid, isSupervisor, expectedResult }) => {
      const rules = buildRules(conditionsSets);
      jest.spyOn(fetchRulesModule, 'fetchRules').mockReturnValueOnce(rules);

      getConfig.mockReturnValueOnce({
        workerSid,
        isSupervisor,
        permissionConfig: 'wareva',
      });

      const { can } = getPermissionsForContact('owner');

      expect(can(action)).toBe(expectedResult);
    },
  );
});
describe('Test different scenarios for ViewIdentifiersAction', () => {
  each(
    Object.values(ViewIdentifiersAction)
      .flatMap(action => [
        {
          action,
          conditionsSets: [['everyone']],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is not a supervisor',
        },
        {
          action,
          conditionsSets: [],
          isSupervisor: true,
          expectedResult: false,
          expectedDescription: 'user is supervisor',
        },
        {
          action,
          conditionsSets: [],
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'user is not a supervisor',
        },
        {
          action,
          conditionsSets: [['isSupervisor']],
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'user is a supervisor',
        },
        {
          action,
          conditionsSets: [['isSupervisor']],
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'user is not a supervisor',
        },
      ])
      .map(t => ({ ...t, prettyConditionsSets: t.conditionsSets.map(arr => `[${arr.join(',')}]`) })),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    ({ action, conditionsSets, isSupervisor, expectedResult }) => {
      const rules = buildRules(conditionsSets);
      jest.spyOn(fetchRulesModule, 'fetchRules').mockReturnValueOnce(rules);

      getConfig.mockReturnValueOnce({
        isSupervisor,
        permissionConfig: 'wareva',
      });

      const { canView } = getPermissionsForViewingIdentifiers();

      expect(canView(action)).toBe(expectedResult);
    },
  );
});

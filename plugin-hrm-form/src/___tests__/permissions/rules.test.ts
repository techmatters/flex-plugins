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
import subHours from 'date-fns/subHours';
import { subDays } from 'date-fns';

import { mockPartialConfiguration } from '../mockGetConfig';
import { cleanupInitializedCan, getInitializedCan, validateAndSetPermissionRules } from '../../permissions/rules';
import { fetchPermissionRules } from '../../services/PermissionsService';
import {
  actionsMaps,
  CaseActions,
  ContactActions,
  ContactFieldActions,
  PermissionActions,
  ProfileActions,
  ProfileSectionActions,
  TargetKind,
  ViewIdentifiersAction,
} from '../../permissions/actions';

const NOT_CREATOR_WORKER_SID = 'WK-not creator';

jest.mock('../../services/PermissionsService', () => {
  return {
    fetchPermissionRules: jest.fn(() => {
      throw new Error('fetchRules not mocked!');
    }),
  };
});

const fetchPermissionRulesSpy = fetchPermissionRules as jest.MockedFunction<typeof fetchPermissionRules>;

const buildRules = (conditionsSets, kind: TargetKind | 'all') => {
  const actionsForTK = kind === 'all' ? [] : Object.values(actionsMaps[kind]);
  return Object.values(PermissionActions).reduce(
    (accum, action) => ({
      ...accum,
      [action]: kind === 'all' || actionsForTK.includes(action) ? conditionsSets : [],
    }),
    {},
  );
};

afterEach(() => {
  jest.resetAllMocks();
});

const addPrettyPrintConditions = (testCase: { conditionsSets: any[][] }) => ({
  ...testCase,
  prettyConditionsSets: testCase.conditionsSets
    .map(arr => arr.map(e => (typeof e === 'string' ? e : JSON.stringify(e))))
    .map(arr => `[${arr.join(',')}]`),
});

describe('Test that all actions work fine (everyone)', () => {
  each(
    Object.values(PermissionActions).map(action => ({
      action,
    })),
  ).test(`Action $action should return true`, async ({ action }) => {
    const rules = buildRules([['everyone']], 'all');

    mockPartialConfiguration({
      workerSid: NOT_CREATOR_WORKER_SID,
      isSupervisor: false,
    });

    fetchPermissionRulesSpy.mockResolvedValue(rules);

    await validateAndSetPermissionRules();
    const can = getInitializedCan();

    expect(can(action, { status: 'open', twilioWorkerId: 'some one' })).toBeTruthy();
  });
});

describe('CasesActions', () => {
  afterEach(() => {
    cleanupInitializedCan();
  });

  each(
    Object.values(CaseActions)
      .flatMap(action => [
        {
          action,
          conditionsSets: [['everyone']],
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is not creator nor supervisor, case is open',
        },
        {
          action,
          conditionsSets: [['everyone']],
          workerSid: NOT_CREATOR_WORKER_SID,
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
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'user is supervisor but not creator, case open',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'user is supervisor but not creator, case closed',
          status: 'closed',
        },
        {
          action,
          conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
          workerSid: NOT_CREATOR_WORKER_SID,
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
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'case is open but user is not creator',
        },
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 hour ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created less than 1 hour ago',
          createdAt: subHours(new Date(), 2).toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 day ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          workerSid: NOT_CREATOR_WORKER_SID,
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created less than 1 day ago',
          createdAt: subDays(new Date(), 2).toISOString(),
        },
      ])
      .map(addPrettyPrintConditions),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    async ({ action, conditionsSets, workerSid, isSupervisor, status = 'open', expectedResult, createdAt }) => {
      const rules = buildRules(conditionsSets, 'case');
      fetchPermissionRulesSpy.mockResolvedValue(rules);

      mockPartialConfiguration({
        workerSid,
        isSupervisor,
      });

      await validateAndSetPermissionRules();

      const can = getInitializedCan();

      expect(can(action, { status, twilioWorkerId: 'creator', createdAt })).toBe(expectedResult);
    },
  );
});

describe('ContactActions', () => {
  afterEach(() => {
    cleanupInitializedCan();
  });

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
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          workerSid: 'not owner',
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 hour ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          workerSid: 'not owner',
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created more than 1 hour ago',
          createdAt: subHours(new Date(), 2).toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          workerSid: 'not owner',
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 day ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          workerSid: 'not owner',
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created more than 1 day ago',
          createdAt: subDays(new Date(), 2).toISOString(),
        },
      ])
      .map(addPrettyPrintConditions),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    async ({ action, conditionsSets, workerSid, isSupervisor, expectedResult, createdAt }) => {
      const rules = buildRules(conditionsSets, 'contact');
      fetchPermissionRulesSpy.mockResolvedValue(rules);

      mockPartialConfiguration({
        workerSid,
        isSupervisor,
      });

      await validateAndSetPermissionRules();

      const can = getInitializedCan();

      expect(can(action, { twilioWorkerId: 'owner', createdAt })).toBe(expectedResult);
    },
  );
});

describe('ProfileActions', () => {
  afterEach(() => {
    cleanupInitializedCan();
  });

  each(
    Object.values(ProfileActions)
      .flatMap(action => [
        {
          action,
          conditionsSets: [['everyone']],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is not supervisor',
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
          conditionsSets: [['isSupervisor']],
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'is a supervisor',
        },
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 hour ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created more than 1 hour ago',
          createdAt: subHours(new Date(), 2).toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 day ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created more than 1 day ago',
          createdAt: subDays(new Date(), 2).toISOString(),
        },
      ])
      .map(addPrettyPrintConditions),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    async ({ action, conditionsSets, workerSid = 'workerSid', isSupervisor, expectedResult, createdAt }) => {
      const rules = buildRules(conditionsSets, 'profile');
      fetchPermissionRulesSpy.mockResolvedValue(rules);

      mockPartialConfiguration({
        workerSid,
        isSupervisor,
      });

      await validateAndSetPermissionRules();

      const can = getInitializedCan();

      expect(can(action, { createdAt })).toBe(expectedResult);
    },
  );
});

describe('ProfileSectionActions', () => {
  afterEach(() => {
    cleanupInitializedCan();
  });

  each(
    Object.values(ProfileSectionActions)
      .flatMap(action => [
        {
          action,
          conditionsSets: [['everyone']],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'is not supervisor',
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
          conditionsSets: [['isSupervisor']],
          isSupervisor: true,
          expectedResult: true,
          expectedDescription: 'is a supervisor',
        },
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 hour ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdHoursAgo: 1 }]],
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created more than 1 hour ago',
          createdAt: subHours(new Date(), 2).toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'created less than 1 day ago',
          createdAt: new Date().toISOString(),
        },
        {
          action,
          conditionsSets: [[{ createdDaysAgo: 1 }]],
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'created more than 1 day ago',
          createdAt: subDays(new Date(), 2).toISOString(),
        },
        {
          action,
          conditionsSets: [[{ sectionType: 'sectionType' }]],
          isSupervisor: false,
          expectedResult: true,
          expectedDescription: 'sectionType matches',
          sectionType: 'sectionType',
        },
        {
          action,
          conditionsSets: [[{ sectionType: 'sectionType' }]],
          isSupervisor: false,
          expectedResult: false,
          expectedDescription: 'sectionType does not matches',
          sectionType: 'something else',
        },
      ])
      .map(addPrettyPrintConditions),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    async ({
      action,
      conditionsSets,
      workerSid = 'workerSid',
      isSupervisor,
      expectedResult,
      createdAt,
      sectionType,
    }) => {
      const rules = buildRules(conditionsSets, 'profileSection');
      fetchPermissionRulesSpy.mockResolvedValue(rules);

      mockPartialConfiguration({
        workerSid,
        isSupervisor,
      });

      await validateAndSetPermissionRules();
      const can = getInitializedCan();

      expect(can(action, { createdAt, sectionType })).toBe(expectedResult);
    },
  );
});

describe('ViewIdentifiersAction', () => {
  afterEach(() => {
    cleanupInitializedCan();
  });

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
          conditionsSets: [] as any,
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
      .map(addPrettyPrintConditions),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    async ({ action, conditionsSets, isSupervisor, expectedResult }) => {
      const rules = buildRules(conditionsSets, 'viewIdentifiers');
      fetchPermissionRulesSpy.mockResolvedValue(rules);

      mockPartialConfiguration({
        workerSid: NOT_CREATOR_WORKER_SID,
        isSupervisor,
      });

      await validateAndSetPermissionRules();

      const can = getInitializedCan();

      expect(can(action)).toBe(expectedResult);
    },
  );
});

describe('ContactFieldActions', () => {
  afterEach(() => {
    cleanupInitializedCan();
  });

  const mockContact = { twilioWorkerId: 'owner', createdAt: new Date().toISOString() };
  const testField = 'rawJson.childInformation.name';
  const otherField = 'rawJson.childInformation.age';

  each(
    Object.values(ContactFieldActions)
      .flatMap(action => [
        // Test 1: Fields not specified by a 'field' condition in any condition set are always allowed
        {
          action,
          conditionsSets: [
            ['isSupervisor'],
            [{ field: otherField }],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'field is not specified in any condition set - should be allowed',
        },
        {
          action,
          conditionsSets: [
            [{ field: otherField }],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'field is not specified (only other field specified) - should be allowed',
        },
        // Test 2: Condition sets with no field condition will allow any field if they evaluate to true
        {
          action,
          conditionsSets: [
            ['everyone'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'no field condition, everyone condition evaluates to true',
        },
        {
          action,
          conditionsSets: [
            ['isSupervisor'],
          ],
          workerSid: 'not owner',
          isSupervisor: true,
          field: testField,
          expectedResult: true,
          expectedDescription: 'no field condition, isSupervisor condition evaluates to true',
        },
        {
          action,
          conditionsSets: [
            ['isOwner'],
          ],
          workerSid: 'owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'no field condition, isOwner condition evaluates to true',
        },
        // Test 3: If condition sets with no field condition evaluate to false, but there are no condition sets 
        // with a field condition matching the field being checked, the action should be allowed
        {
          action,
          conditionsSets: [
            ['isSupervisor'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'no field-specific conditions exist, so field is allowed even though isSupervisor is false',
        },
        {
          action,
          conditionsSets: [
            ['isOwner'],
            ['isSupervisor'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'no field-specific conditions exist, field is allowed even though conditions are false',
        },
        {
          action,
          conditionsSets: [
            ['isSupervisor'],
            [{ field: otherField }],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'field has no specific conditions (only other field specified), allowed even though isSupervisor is false',
        },
        // Test 4: Multiple field conditions in the same set specifying different fields means 
        // that condition set will be filtered out, demonstrating it can't restrict a field on its own
        {
          action,
          conditionsSets: [
            [{ field: testField }, { field: otherField }],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'multiple different field conditions in same set gets filtered out, no field-specific conditions remain, so allowed',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }, { field: otherField }],
            ['everyone'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'conflicting field conditions get filtered out, everyone condition allows',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }, { field: otherField }],
            ['isSupervisor'],
          ],
          workerSid: 'not owner',
          isSupervisor: true,
          field: testField,
          expectedResult: true,
          expectedDescription: 'conflicting field conditions get filtered out, isSupervisor allows',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }, { field: otherField }],
            ['isSupervisor'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'conflicting field conditions get filtered out, no field-specific conditions remain even though isSupervisor is false, so allowed',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }, { field: otherField }],
            [{ field: testField }, 'isOwner'],
          ],
          workerSid: 'owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'conflicting field conditions filtered out, but valid field condition with isOwner passes',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }, { field: otherField }],
            [{ field: testField }, 'isOwner'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: false,
          expectedDescription: 'conflicting field conditions filtered out, valid field condition exists but isOwner is false',
        },
        // Additional comprehensive tests
        {
          action,
          conditionsSets: [
            [{ field: testField }, 'isOwner'],
          ],
          workerSid: 'owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'field condition matches and isOwner is true',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }, 'isOwner'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: false,
          expectedDescription: 'field condition matches but isOwner is false',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }],
            ['isSupervisor'],
          ],
          workerSid: 'not owner',
          isSupervisor: true,
          field: testField,
          expectedResult: true,
          expectedDescription: 'field condition in first set, isSupervisor in second set evaluates to true',
        },
        {
          action,
          conditionsSets: [
            [{ field: testField }],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'only field condition with no additional conditions - always true',
        },
        {
          action,
          conditionsSets: [
            [{ field: otherField }, 'everyone'],
          ],
          workerSid: 'not owner',
          isSupervisor: false,
          field: testField,
          expectedResult: true,
          expectedDescription: 'other field condition with everyone - field not specified so allowed',
        },
      ])
      .map(addPrettyPrintConditions),
  ).test(
    `Should return $expectedResult for action $action when $expectedDescription and conditionsSets are $prettyConditionsSets`,
    async ({ action, conditionsSets, workerSid, isSupervisor, field, expectedResult }) => {
      const rules = buildRules(conditionsSets, 'contactField');
      fetchPermissionRulesSpy.mockResolvedValue(rules);

      mockPartialConfiguration({
        workerSid,
        isSupervisor,
      });

      await validateAndSetPermissionRules();

      const can = getInitializedCan();

      expect(can(action, { contact: mockContact, field })).toBe(expectedResult);
    },
  );
});

import each from 'jest-each';

import { getConfig } from '../../HrmFormPlugin';
import * as fetchRulesModule from '../../permissions/fetchRules';
import { getPermissionsForCase, PermissionActions } from '../../permissions';

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

describe('Test different scenarios (random action)', () => {
  const PermissionActionsValues = Object.values(PermissionActions);
  const getRandomAction = () =>
    PermissionActionsValues[Math.floor(Math.random() * 100) % PermissionActionsValues.length];

  each(
    [
      {
        action: getRandomAction(),
        conditionsSets: [['everyone']],
        workerSid: 'not creator',
        isSupervisor: false,
        expectedResult: true,
        expectedDescription: 'is not creator nor supervisor, case is open',
      },
      {
        action: getRandomAction(),
        conditionsSets: [['everyone']],
        workerSid: 'not creator',
        isSupervisor: false,
        expectedResult: true,
        expectedDescription: 'is not creator nor supervisor, case is close',
        status: 'close',
      },
      {
        action: getRandomAction(),
        conditionsSets: [],
        workerSid: 'creator',
        isSupervisor: true,
        expectedResult: false,
        expectedDescription: 'user is creator, supervisor, case is open',
      },
      {
        action: getRandomAction(),
        conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
        workerSid: 'not creator',
        isSupervisor: true,
        expectedResult: true,
        expectedDescription: 'user is supervisor but not creator, case open',
      },
      {
        action: getRandomAction(),
        conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
        workerSid: 'not creator',
        isSupervisor: true,
        expectedResult: true,
        expectedDescription: 'user is supervisor but not creator, case closed',
        status: 'closed',
      },
      {
        action: getRandomAction(),
        conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
        workerSid: 'not creator',
        isSupervisor: false,
        expectedResult: false,
        expectedDescription: 'user is not supervisor nor creator',
      },
      {
        action: getRandomAction(),
        conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
        workerSid: 'creator',
        isSupervisor: false,
        expectedResult: true,
        expectedDescription: 'user is creator and case is open',
      },
      {
        action: getRandomAction(),
        conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
        workerSid: 'creator',
        isSupervisor: false,
        expectedResult: false,
        expectedDescription: 'user is creator but case is closed',
        status: 'closed',
      },
      {
        action: getRandomAction(),
        conditionsSets: [['isSupervisor'], ['isCreator', 'isCaseOpen']],
        workerSid: 'not creator',
        isSupervisor: false,
        expectedResult: false,
        expectedDescription: 'case is open but user is not creator',
      },
    ].map(t => ({ ...t, prettyConditionsSets: t.conditionsSets.map(arr => `[${arr.join(',')}]`) })),
  ).test(
    `Should return $expectedResult when $expectedDescription and conditionsSets are $prettyConditionsSets`,
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

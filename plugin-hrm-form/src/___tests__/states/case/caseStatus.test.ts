import { DefinitionVersion, DefinitionVersionId, loadDefinition, StatusInfo } from 'hrm-form-definitions';

import { getPermissionsForCase, PermissionActions } from '../../../permissions';
import { Case } from '../../../types/types';
import { getAvailableCaseStatusTransitions } from '../../../states/case/caseStatus';

jest.mock('../../../permissions', () => ({
  // Tried using jest.requireActual for this & it didn't work
  PermissionActions: {
    CLOSE_CASE: 'closeCase',
    REOPEN_CASE: 'reopenCase',
    CASE_STATUS_TRANSITION: 'caseStatusTransition',
  },
  getPermissionsForCase: jest.fn(),
}));
let mockV1: DefinitionVersion;
const baselineDate = new Date(2010, 1, 1);

function createCase(status: string, twilioWorkerId: string): Case {
  return {
    accountSid: 'ACxx',
    id: 0,
    helpline: '',
    status,
    twilioWorkerId,
    createdAt: baselineDate.toISOString(),
    updatedAt: baselineDate.toISOString(),
    childName: '',
    connectedContacts: [],
    categories: {},
  };
}

function createCaseStatus(value: string, transitions: string[]): StatusInfo {
  return {
    value,
    label: value,
    color: 'octarine',
    transitions,
  };
}

function createDefinition(statuses: StatusInfo[]): DefinitionVersion {
  return {
    ...mockV1,
    caseStatus: statuses.reduce((cs, s) => ({ ...cs, [s.value]: s }), {}),
  };
}

describe('getAvailableCaseStatusTransitions', () => {
  beforeEach(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.demoV1);
  });
  describe('Given open permissions', () => {
    beforeEach(() => {
      (<jest.Mock>getPermissionsForCase).mockReturnValue({
        can: () => true,
      });
    });
    test('Looks up case permissions using worker and current status', () => {
      getAvailableCaseStatusTransitions(createCase('mulching', 'a worker'), createDefinition([]));
      expect(getPermissionsForCase).toHaveBeenCalledWith('a worker', 'mulching');
    });
    test('Status exists with valid transitions - returns current status and transitions', () => {
      const result = getAvailableCaseStatusTransitions(
        createCase('mulching', ''),
        createDefinition([
          createCaseStatus('spaghettifying', ['crushed', 'spaghetti']),
          createCaseStatus('mulching', ['compost', 'trash']),
          createCaseStatus('compost', []),
          createCaseStatus('trash', []),
        ]),
      );
      expect(result).toStrictEqual([
        createCaseStatus('mulching', ['compost', 'trash']),
        createCaseStatus('compost', []),
        createCaseStatus('trash', []),
      ]);
    });
    test('Status has no transitions - returns current status only', () => {
      const result = getAvailableCaseStatusTransitions(
        createCase('mulching', ''),
        createDefinition([
          createCaseStatus('spaghettifying', ['crushed', 'spaghetti']),
          createCaseStatus('mulching', []),
          createCaseStatus('compost', []),
          createCaseStatus('trash', []),
        ]),
      );
      expect(result).toStrictEqual([createCaseStatus('mulching', [])]);
    });
    test('Status has invalid transitions - filters them out', () => {
      const result = getAvailableCaseStatusTransitions(
        createCase('mulching', ''),
        createDefinition([
          createCaseStatus('spaghettifying', ['crushed', 'spaghetti']),
          createCaseStatus('mulching', ['compost', 'not existing']),
          createCaseStatus('compost', []),
          createCaseStatus('trash', []),
        ]),
      );
      expect(result).toStrictEqual([
        createCaseStatus('mulching', ['compost', 'not existing']),
        createCaseStatus('compost', []),
      ]);
    });
    test('Status not defined - returns empty aary', () => {
      const result = getAvailableCaseStatusTransitions(
        createCase('not existing', ''),
        createDefinition([
          createCaseStatus('spaghettifying', ['crushed', 'spaghetti']),
          createCaseStatus('mulching', ['compost']),
          createCaseStatus('compost', []),
          createCaseStatus('trash', []),
        ]),
      );
      expect(result).toStrictEqual([]);
    });
  });

  const permissionableDefinition = createDefinition([
    createCaseStatus('spaghettifying', ['mulching', 'compost']),
    createCaseStatus('mulching', ['compost']),
    createCaseStatus('compost', ['mulching', 'closed']),
    createCaseStatus('closed', ['spaghettifying', 'mulching']),
  ]);

  test('Can close case and open status that can transition to closed - closed option available', () => {
    (<jest.Mock>getPermissionsForCase).mockReturnValue({
      can: () => true,
    });
    const result = getAvailableCaseStatusTransitions(createCase('compost', ''), permissionableDefinition);
    expect(result).toStrictEqual([
      createCaseStatus('mulching', ['compost']),
      createCaseStatus('compost', ['mulching', 'closed']),
      createCaseStatus('closed', ['spaghettifying', 'mulching']),
    ]);
  });

  test('Cannot close case and open status that can transition to closed - closed option not available', () => {
    (<jest.Mock>getPermissionsForCase).mockReturnValue({
      can: action => action !== PermissionActions.CLOSE_CASE,
    });
    const result = getAvailableCaseStatusTransitions(createCase('compost', ''), permissionableDefinition);
    expect(result).toStrictEqual([
      createCaseStatus('mulching', ['compost']),
      createCaseStatus('compost', ['mulching', 'closed']),
    ]);
  });

  test('Can reopen case and closed status that can transition to open - open option available', () => {
    (<jest.Mock>getPermissionsForCase).mockReturnValue({
      can: action => action === PermissionActions.REOPEN_CASE,
    });
    const result = getAvailableCaseStatusTransitions(createCase('closed', ''), permissionableDefinition);
    expect(result).toStrictEqual([
      createCaseStatus('spaghettifying', ['mulching', 'compost']),
      createCaseStatus('mulching', ['compost']),
      createCaseStatus('closed', ['spaghettifying', 'mulching']),
    ]);
  });

  test('Cannot reopen case and closed status that can transition to open - open option not available', () => {
    (<jest.Mock>getPermissionsForCase).mockReturnValue({
      can: action => action !== PermissionActions.REOPEN_CASE,
    });
    const result = getAvailableCaseStatusTransitions(createCase('closed', ''), permissionableDefinition);
    expect(result).toStrictEqual([createCaseStatus('closed', ['spaghettifying', 'mulching'])]);
  });

  test('Can transition case and open status that can transition to another open status - transition options available', () => {
    (<jest.Mock>getPermissionsForCase).mockReturnValue({
      can: action => action === PermissionActions.CASE_STATUS_TRANSITION,
    });
    const result = getAvailableCaseStatusTransitions(createCase('compost', ''), permissionableDefinition);
    expect(result).toStrictEqual([
      createCaseStatus('mulching', ['compost']),
      createCaseStatus('compost', ['mulching', 'closed']),
    ]);
  });

  test('Cannot transition case and open status that to another open status - transition options not available', () => {
    (<jest.Mock>getPermissionsForCase).mockReturnValue({
      can: action => action !== PermissionActions.CASE_STATUS_TRANSITION,
    });
    const result = getAvailableCaseStatusTransitions(createCase('compost', ''), permissionableDefinition);
    expect(result).toStrictEqual([
      createCaseStatus('compost', ['mulching', 'closed']),
      createCaseStatus('closed', ['spaghettifying', 'mulching']),
    ]);
  });
});

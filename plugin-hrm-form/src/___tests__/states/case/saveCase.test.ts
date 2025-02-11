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
import promiseMiddleware from 'redux-promise-middleware';
import { configureStore } from '@reduxjs/toolkit';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import '../../mockGetConfig';
import { createCaseAsyncAction, saveCaseReducer, updateCaseOverviewAsyncAction } from '../../../states/case/saveCase';
import { HrmState } from '../../../states';
import { reduce } from '../../../states/case/reducer';
import { createCase, getCase, updateCaseOverview, updateCaseStatus } from '../../../services/CaseService';
import { connectToCase } from '../../../services/ContactService';
import { ReferralLookupStatus } from '../../../states/contacts/resourceReferral';
import { Case, Contact } from '../../../types/types';
import { RecursivePartial } from '../../RecursivePartial';
import { VALID_EMPTY_CASE } from '../../testCases';

jest.mock('../../../services/CaseService');
jest.mock('../../../services/ContactService');

const { mockFetchImplementation, buildBaseURL } = mockLocalFetchDefinitions();

const mockCreateCase = createCase as jest.Mock<ReturnType<typeof createCase>>;
const mockConnectedCase = connectToCase as jest.Mock<ReturnType<typeof connectToCase>>;
const mockUpdateCaseOverview = updateCaseOverview as jest.Mock<
  ReturnType<typeof updateCaseOverview>,
  Parameters<typeof updateCaseOverview>
>;
const mockUpdateStatus = updateCaseStatus as jest.Mock<
  ReturnType<typeof updateCaseStatus>,
  Parameters<typeof updateCaseStatus>
>;

const mockGetCase = getCase as jest.Mock<ReturnType<typeof getCase>, Parameters<typeof getCase>>;
const workerSid = 'Worker-Sid';
const definitionVersion: DefinitionVersionId = DefinitionVersionId.demoV1;
const partialState: RecursivePartial<HrmState> = {
  connectedCase: {
    cases: {},
  },
  configuration: {
    definitionVersions: {
      [definitionVersion]: {},
    },
  },
};

const saveCaseState = partialState as HrmState;

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(definitionVersion as DefinitionVersionId);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  const mockV1 = await loadDefinition(formDefinitionsBaseUrl);
  partialState.configuration = {
    definitionVersions: {
      [definitionVersion]: mockV1,
    },
    currentDefinitionVersion: mockV1,
  };
});

beforeEach(() => {
  mockCreateCase.mockReset();
  mockCreateCase.mockResolvedValue({ id: '234' } as Case);
  mockConnectedCase.mockReset();
  mockConnectedCase.mockResolvedValue({ id: 'contact-1' } as Contact);
});

const boundSaveCaseReducer = saveCaseReducer(saveCaseState);

const mockPayload: Omit<Case, 'sections' | 'label'> = {
  accountSid: 'AC-test-id',
  id: '213',
  helpline: 'za',
  status: 'test-st',
  twilioWorkerId: 'WK2xxx1',
  info: {},
  createdAt: '12-05-2023',
  updatedAt: '12-05-2023',
  categories: {},
};

const testStore = (stateChanges: Partial<HrmState> = {}) =>
  configureStore({
    preloadedState: { ...saveCaseState, ...stateChanges },
    reducer: boundSaveCaseReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

// Mock the necessary dependencies
const nonInitialPartialState: RecursivePartial<HrmState> = {
  ...partialState,
  connectedCase: {
    cases: {
      213: {
        connectedCase: {
          accountSid: 'AC-test-id',
          id: '213',
          helpline: 'za',
          status: 'test-st',
          twilioWorkerId: 'WK2xxx1',
          info: {},
          createdAt: '12-05-2023',
          updatedAt: '12-05-2023',
          categories: {},
        },
        caseWorkingCopy: {
          sections: {},
          caseSummary: {
            status: 'test-st',
            followUpDate: '',
            childIsAtRisk: false,
            summary: '',
          },
        },
        availableStatusTransitions: [],
        references: new Set(['x']),
      },
    },
  },
};

const nonInitialState = nonInitialPartialState as HrmState;

const contact = {
  callType: 'chile',
  callerInformation: {
    age: 'Unknown',
    district: '',
    ethnicity: '',
    firstName: '',
    gender: 'Unknown',
    language: 'Unknown',
    lastName: '',
    phone1: '',
    phone2: '',
    postalCode: '',
    province: '',
    relationshipToChild: 'Unknown',
    streetAddress: '',
  },
  caseInformation: {
    actionTaken: [],
    callSummary: 'tesd',
    didTheChildFeelWeSolvedTheirProblem: 'mixed',
    didYouDiscussRightsWithTheChild: 'mixed',
    howDidYouKnowAboutOurLine: 'Unknown',
    keepConfidential: true,
    mustCallBack: 'mixed',
    okForCaseWorkerToCall: 'mixed',
    repeatCaller: false,
    urgencyLevel: 'Urgent',
    wouldTheChildRecommendUsToAFriend: 'mixed',
  },
  categories: ['categories.Mental Health.Anxiety'],
  childInformation: {},
  contactlessTask: { channel: undefined },
  csamReports: [],
  draft: {
    resourceReferralList: { resourceReferralIdToAdd: '', lookupStatus: ReferralLookupStatus.NOT_STARTED },
  },
  helpline: '',
  metadata: { categories: { expanded: {}, gridView: false }, endMillis: 0, recreated: false, startMillis: 0 },
  referrals: [],
};

const expectObject: RecursivePartial<HrmState> = {
  ...partialState,
  connectedCase: {
    cases: {
      [mockPayload.id]: {
        connectedCase: mockPayload,
        caseWorkingCopy: {
          sections: {},
          caseSummary: {
            status: 'test-st',
            followUpDate: '',
            childIsAtRisk: false,
            summary: '',
          },
        },
        availableStatusTransitions: [],
        references: new Set(['x']),
      },
    },
  },
};

describe('createCaseAsyncAction', () => {
  test('Calls the createCase service, and create a case', () => {
    createCaseAsyncAction(contact, workerSid, definitionVersion as DefinitionVersionId);
    expect(createCase).toHaveBeenCalledWith(contact, workerSid, definitionVersion);
  });

  test('should dispatch createCaseAsyncAction correctly', async () => {
    const { dispatch, getState } = testStore(nonInitialState);
    const startingState = getState();
    await ((dispatch(
      createCaseAsyncAction(contact, workerSid, definitionVersion as DefinitionVersionId),
    ) as unknown) as Promise<void>);
    const state = getState();
    expect(state).toStrictEqual({
      ...startingState,
      connectedCase: {
        ...startingState.connectedCase,
        cases: {
          ...state.connectedCase.cases,
          234: {
            availableStatusTransitions: [],
            caseWorkingCopy: {
              sections: {},
            },
            connectedCase: {
              firstContact: undefined,
              id: '234',
            },
            references: new Set(),
            sections: {},
            timelines: {},
            outstandingUpdateCount: 0,
          },
        },
      },
    });
  });

  test('should handle createCaseAsyncAction in the reducer', async () => {
    const expected: HrmState = expectObject as HrmState;
    const result = reduce(nonInitialState, createCaseAsyncAction(contact, workerSid, definitionVersion));
    expect(result).toEqual(expected);
  });
});

describe('updateCaseOverviewAsyncAction', () => {
  const overview = {
    followUpDate: '2023-05-12',
    childIsAtRisk: true,
    summary: 'test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateCaseOverview.mockImplementation(async (id, overview) => ({
      ...VALID_EMPTY_CASE,
      id,
      info: { ...VALID_EMPTY_CASE.info, ...overview },
    }));
    mockUpdateStatus.mockImplementation(async (id, status) => ({
      ...VALID_EMPTY_CASE,
      id,
      status,
    }));
    mockGetCase.mockImplementation(async id => ({
      ...VALID_EMPTY_CASE,
      id,
    }));
  });

  test('overview populated in action but status omitted - just calls updateCaseOverview with case ID and overview object', async () => {
    const action = updateCaseOverviewAsyncAction(mockPayload.id, overview, undefined);
    expect(updateCaseOverview).toHaveBeenCalledWith(mockPayload.id, overview);
    expect(updateCaseStatus).not.toHaveBeenCalled();

    const payload = await action.payload;
    expect(payload).toEqual({
      ...VALID_EMPTY_CASE,
      id: mockPayload.id,
      info: { ...VALID_EMPTY_CASE.info, ...overview },
    });
  });

  test('overview omitted in action but status populated - calls updateStatus with case ID and new status', async () => {
    const action = updateCaseOverviewAsyncAction(mockPayload.id, {}, 'new-status');
    expect(updateCaseStatus).toHaveBeenCalledWith(mockPayload.id, 'new-status');
    expect(updateCaseOverview).not.toHaveBeenCalled();
    expect(mockGetCase).not.toHaveBeenCalled();

    const payload = await action.payload;
    expect(payload).toEqual({
      ...VALID_EMPTY_CASE,
      id: mockPayload.id,
      status: 'new-status',
    });
  });

  test('overview and status populated in action - calls both endpoints', async () => {
    updateCaseOverviewAsyncAction(mockPayload.id, overview, 'new-status');
    await Promise.resolve(); // Give time for the inner promises to resolve
    expect(updateCaseOverview).toHaveBeenCalledWith(mockPayload.id, overview);
    expect(updateCaseStatus).toHaveBeenCalledWith(mockPayload.id, 'new-status');
    expect(mockGetCase).not.toHaveBeenCalled();
  });

  test('neither overview and status populated in action - just calls get to refresh case', async () => {
    updateCaseOverviewAsyncAction(mockPayload.id, {}, undefined);
    expect(updateCaseStatus).not.toHaveBeenCalled();
    expect(updateCaseOverview).not.toHaveBeenCalled();
  });

  describe('fulfilled', () => {
    test('case exists in redux store - updates case overview ', async () => {
      const { getState, dispatch } = testStore(nonInitialState);
      const actionResultPromise = (dispatch(
        updateCaseOverviewAsyncAction(mockPayload.id, overview, undefined),
      ) as unknown) as PromiseLike<void>;
      const pendingState = getState();
      expect(pendingState.connectedCase.cases[mockPayload.id].outstandingUpdateCount).toEqual(1);
      await actionResultPromise;
      const {
        connectedCase: {
          cases: {
            [mockPayload.id]: { connectedCase: updatedCase, outstandingUpdateCount },
          },
        },
      } = getState() as HrmState;
      expect(updatedCase).toEqual({
        ...VALID_EMPTY_CASE,
        id: mockPayload.id,
        info: {
          ...VALID_EMPTY_CASE.info,
          ...overview,
        },
      });
      expect(outstandingUpdateCount).toEqual(0);
    });
    test("case doesn't exist in redux store - adds case", async () => {
      const { getState, dispatch } = testStore(nonInitialState);
      const {
        connectedCase: { cases: originalCases },
      } = getState() as HrmState;
      await ((dispatch(updateCaseOverviewAsyncAction('ANOTHER_CASE', overview, undefined)) as unknown) as PromiseLike<
        void
      >);
      const {
        connectedCase: { cases: updatedCases },
      } = getState() as HrmState;
      expect(updatedCases).toStrictEqual({
        ...originalCases,
        firstContact: undefined,
        ANOTHER_CASE: {
          connectedCase: {
            ...VALID_EMPTY_CASE,
            id: 'ANOTHER_CASE',
            info: { ...overview, definitionVersion: DefinitionVersionId.v1 },
          },
          references: new Set(),
          availableStatusTransitions: [],
          caseWorkingCopy: { sections: {} },
          sections: {},
          timelines: {},
          outstandingUpdateCount: 0,
        },
      });
    });
  });
});

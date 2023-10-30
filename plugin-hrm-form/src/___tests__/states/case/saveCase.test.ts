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
import { DefinitionVersionId } from 'hrm-form-definitions';

import '../../mockGetConfig';
import {
  SaveCaseReducerState,
  createCaseAsyncAction,
  saveCaseReducer,
  updateCaseAsyncAction,
} from '../../../states/case/saveCase';
import { RootState } from '../../../states';
import { saveCaseState, reduce } from '../../../states/case/reducer';
import { updateCase, createCase } from '../../../services/CaseService';
import { connectToCase } from '../../../services/ContactService';
import { ReferralLookupStatus } from '../../../states/contacts/resourceReferral';
import { configurationBase, connectedCaseBase } from '../../../states/storeNamespaces';

jest.mock('../../../services/CaseService');
jest.mock('../../../services/ContactService');

const mockUpdateCase = updateCase as jest.Mock<ReturnType<typeof updateCase>>;
const mockCreateCase = createCase as jest.Mock<ReturnType<typeof createCase>>;
const mockConnectedCase = connectToCase as jest.Mock<ReturnType<typeof connectToCase>>;

beforeEach(() => {
  mockUpdateCase.mockReset();
  mockUpdateCase.mockResolvedValue({ id: 234 });
  mockCreateCase.mockReset();
  mockCreateCase.mockResolvedValue({ id: 234 });
  mockConnectedCase.mockReset();
  mockConnectedCase.mockResolvedValue({ id: 'contact-1' });
});

const stubRootState = { [configurationBase]: { definitionVersions: {} } } as RootState['plugin-hrm-form'];

const boundSaveCaseReducer = saveCaseReducer(saveCaseState);

const mockPayload = {
  case: {
    accountSid: 'test-id',
    id: 213,
    helpline: 'za',
    status: 'test-st',
    twilioWorkerId: 'WE2xxx1',
    info: {},
    createdAt: '12-05-2023',
    updatedAt: '12-05-2023',
    connectedContacts: [],
    categories: {},
  },
  taskSid: 'task-sid',
};

const testStore = (stateChanges: SaveCaseReducerState) =>
  configureStore({
    preloadedState: { ...saveCaseState, ...stateChanges },
    reducer: boundSaveCaseReducer,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

// Mock the necessary dependencies
const nonInitialState: SaveCaseReducerState = {
  state: {
    tasks: {
      task1: {
        connectedCase: {
          accountSid: 'test-id',
          id: 213,
          helpline: 'za',
          status: 'test-st',
          twilioWorkerId: 'WE2xxx1',
          info: {},
          createdAt: '12-05-2023',
          updatedAt: '12-05-2023',
          connectedContacts: [],
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
      },
    },
  },
  rootState: stubRootState,
};

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
  isCallTypeCaller: false,
  metadata: { categories: { expanded: {}, gridView: false }, endMillis: 0, recreated: false, startMillis: 0 },
  referrals: [],
};
const workerSid = 'Worker-Sid';
const definitionVersion = 'demo-v1';
const expectObject = {
  tasks: {
    task1: {
      connectedCase: mockPayload.case,
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
    },
  },
};

describe('actions', () => {
  test('Calls the updateCase service, and update a case', async () => {
    updateCaseAsyncAction(234, mockPayload.taskSid, mockPayload.case);
    expect(updateCase).toHaveBeenCalledWith(234, mockPayload.case);
  });

  test('Calls the createCase service, and create a case', () => {
    createCaseAsyncAction(contact, mockPayload.taskSid, workerSid, definitionVersion as DefinitionVersionId);
    expect(createCase).toHaveBeenCalledWith(contact, workerSid, definitionVersion);
  });

  test('should dispatch updateCaseAsyncAction correctly', async () => {
    const { dispatch, getState } = testStore(nonInitialState);
    const startingState = getState();
    await ((dispatch(updateCaseAsyncAction(234, mockPayload.taskSid, mockPayload.case)) as unknown) as Promise<void>);
    const state = getState();
    expect(state).toStrictEqual({
      rootState: {
        configuration: { definitionVersions: {} },
      },
      state: {
        ...startingState.state,
        tasks: {
          ...state.state.tasks,
          'task-sid': {
            availableStatusTransitions: [],
            caseWorkingCopy: {
              sections: {},
            },
            connectedCase: {
              id: 234,
            },
          },
        },
      },
    });
  });

  test('should dispatch createCaseAsyncAction correctly', async () => {
    const { dispatch, getState } = testStore(nonInitialState);
    const startingState = getState();
    await ((dispatch(
      createCaseAsyncAction(contact, mockPayload.taskSid, workerSid, definitionVersion as DefinitionVersionId),
    ) as unknown) as Promise<void>);
    const state = getState();
    expect(state).toStrictEqual({
      state: {
        ...startingState.state,
        tasks: {
          ...state.state.tasks,
          'task-sid': {
            availableStatusTransitions: [],
            caseWorkingCopy: {
              sections: {},
            },
            connectedCase: {
              id: 234,
              connectedContacts: [{ id: 'contact-1' }],
            },
          },
        },
      },
      rootState: startingState.rootState,
    });
  });

  test('should handle updateCaseAsyncAction in the reducer', async () => {
    const expected: RootState['plugin-hrm-form'][typeof connectedCaseBase] = expectObject;

    const result = reduce(
      nonInitialState.rootState,
      nonInitialState.state,
      updateCaseAsyncAction(234, mockPayload.taskSid, mockPayload.case),
    );
    expect(result).toStrictEqual(expected);
  });

  test('should handle createCaseAsyncAction in the reducer', async () => {
    const expected: RootState['plugin-hrm-form'][typeof connectedCaseBase] = expectObject;

    const result = reduce(
      nonInitialState.rootState,
      nonInitialState.state,
      createCaseAsyncAction(contact, mockPayload.taskSid, workerSid, definitionVersion as DefinitionVersionId),
    );
    expect(result).toEqual(expected);
  });
});

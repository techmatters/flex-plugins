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
import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import '../../mockGetConfig';
import { createCaseAsyncAction, saveCaseReducer } from '../../../states/case/saveCase';
import { HrmState } from '../../../states';
import { reduce } from '../../../states/case/reducer';
import { createCase } from '../../../services/CaseService';
import { connectToCase } from '../../../services/ContactService';
import { ReferralLookupStatus } from '../../../states/contacts/resourceReferral';
import { Case } from '../../../types/types';
import { RecursivePartial } from '../../RecursivePartial';

jest.mock('../../../services/CaseService');
jest.mock('../../../services/ContactService');
// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, buildBaseURL } = useFetchDefinitions();

const mockCreateCase = createCase as jest.Mock<ReturnType<typeof createCase>>;
const mockConnectedCase = connectToCase as jest.Mock<ReturnType<typeof connectToCase>>;
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
  mockCreateCase.mockResolvedValue({ id: '234' });
  mockConnectedCase.mockReset();
  mockConnectedCase.mockResolvedValue({ id: 'contact-1' });
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
  connectedContacts: [],
  categories: {},
};

const testStore = (stateChanges: HrmState) =>
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

describe('actions', () => {
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
              id: '234',
              connectedContacts: [{ id: 'contact-1' }],
            },
            references: new Set(),
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

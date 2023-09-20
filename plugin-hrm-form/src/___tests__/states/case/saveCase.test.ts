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

import {
  SaveCaseReducerState,
  handleFulfilledAction,
  saveCaseReducer,
  handlePendingAction,
  createCaseAsyncAction,
  handleRejectedAction,
  updateCaseAsyncAction,
} from '../../../states/case/saveCase';
import { configurationBase, connectedCaseBase, namespace, RootState } from '../../../states';
import { createCase, updateCase } from '../../../services/CaseService';
import { Case } from '../../../types/types';
import { saveCaseState as initialState } from '../../../states/case/reducer';
import {
  CREATE_CASE_ACTION,
  CaseActionType,
  CaseState,
  SavedCaseStatus,
  UPDATE_CASE_ACTION,
  UpdatedCaseAction,
} from '../../../states/case/types';
import { TaskEntry } from '../../../states/contacts/types';
import { ReferralLookupStatus } from '../../../states/contacts/resourceReferral';

jest.mock('../../../services/CaseService');

const mockUpdateCase = updateCase as jest.Mock<Promise<{ taskSid: string; case: Case }>>;

jest.mock('../../../states/case/saveCase', () => ({
  handleFulfilledAction: jest.fn(),
  saveCaseReducer: jest.fn(),
  handlePendingAction: jest.fn(),
  createCaseAsyncAction: jest.fn(),
  updateCaseAsyncAction: jest.fn(),
}));

jest.mock('../../../states/case/reducer', () => ({
  boundSaveCaseReducer: jest.fn(),
  reduce: jest.fn(),
}));

const stubRootState = {} as RootState['plugin-hrm-form'];

const boundSaveCaseReducer = saveCaseReducer(initialState);

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
    preloadedState: { ...initialState, ...stateChanges },
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
          accountSid: '',
          id: 0,
          helpline: '',
          status: '',
          twilioWorkerId: '',
          info: {},
          createdAt: '',
          updatedAt: '',
          connectedContacts: [],
          categories: {},
        },
        caseWorkingCopy: {
          sections: {},
          caseSummary: {
            status: '',
            followUpDate: '',
            childIsAtRisk: false,
            summary: '',
          },
        },
        availableStatusTransitions: [
          {
            value: '',
            label: '',
            color: '',
            transitions: [],
          },
        ],
      },
    },
  },
  rootState: stubRootState,
};

// Define a mock rootState for testing
const mockRootState = {
  [configurationBase]: {
    definitionVersions: stubRootState,
  },
};

describe('actions', () => {
  test('Calls the updateCaseAsyncAction service with the correct arguments', async () => {
    const { dispatch, getState } = testStore(nonInitialState);
    const startingState = getState();
    dispatch(updateCaseAsyncAction(234, mockPayload.taskSid, mockPayload.case));
    expect(getState()).toStrictEqual({
      state: {
        ...startingState.state,
      },
      rootState: startingState.rootState,
    });
  });
});

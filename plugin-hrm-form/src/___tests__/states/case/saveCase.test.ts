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

import { SaveCaseReducerState, saveCaseReducer, updateCaseAsyncAction } from '../../../states/case/saveCase';
import { configurationBase, RootState } from '../../../states';
import { saveCaseState as initialState } from '../../../states/case/reducer';

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

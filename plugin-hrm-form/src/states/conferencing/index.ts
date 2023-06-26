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
import { createAction, createReducer } from 'redux-promise-middleware-actions';
import { omit } from 'lodash';

import { GeneralActionType, INITIALIZE_CONTACT_STATE, RECREATE_CONTACT_STATE } from '../types';
import { removeContactState } from '../actions';

export type ConferencingState = {
  tasks: {
    [taskId: string]: {
      isDialogOpen: boolean;
      isLoading: boolean;
      phoneNumber: string;
    };
  };
};

export const newTaskEntry = {
  isDialogOpen: false,
  isLoading: false,
  phoneNumber: '',
};

const SET_IS_DIALOG_OPEN = 'conferencing/set-is-dialog-open';

export const setIsDialogOpenAction = createAction(SET_IS_DIALOG_OPEN, (taskId: string, isDialogOpen: boolean) => ({
  taskId,
  isDialogOpen,
}));

const SET_IS_LOADING = 'conferencing/set-is-loading';

export const setIsLoadingAction = createAction(SET_IS_LOADING, (taskId: string, isLoading: boolean) => ({
  taskId,
  isLoading,
}));

const SET_PHONE_NUMBER = 'conferencing/set-phone-number';

export const setPhoneNumberAction = createAction(SET_PHONE_NUMBER, (taskId: string, phoneNumber: string) => ({
  taskId,
  phoneNumber,
}));

type ConferencingStateAction =
  | ReturnType<typeof setIsDialogOpenAction>
  | ReturnType<typeof setIsLoadingAction>
  | ReturnType<typeof setPhoneNumberAction>;

const initialState: ConferencingState = {
  tasks: {},
};

const createNewEntryForTaskId = (state: ConferencingState, payload: GeneralActionType) => {
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [payload.taskId]: newTaskEntry,
    },
  };
};

const conferencingReducer = createReducer(initialState, handleAction => [
  // Handle GeneralActionType
  {
    [INITIALIZE_CONTACT_STATE]: createNewEntryForTaskId,
  },
  {
    [RECREATE_CONTACT_STATE]: createNewEntryForTaskId,
  },
  handleAction(removeContactState, (state, { taskId }) => {
    if (state.tasks[taskId]) {
      return {
        ...state,
        tasks: omit(state.tasks, taskId),
      };
    }

    return state;
  }),

  // Handle ConferencingStateAction
  handleAction(setIsDialogOpenAction, (state, { payload }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      [payload.taskId]: {
        ...state.tasks[payload.taskId],
        isDialogOpen: payload.isDialogOpen,
      },
    },
  })),
  handleAction(setIsLoadingAction, (state, { payload }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      [payload.taskId]: {
        ...state.tasks[payload.taskId],
        isLoading: payload.isLoading,
      },
    },
  })),
  handleAction(setPhoneNumberAction, (state, { payload }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      [payload.taskId]: {
        ...state.tasks[payload.taskId],
        phoneNumber: payload.phoneNumber,
      },
    },
  })),
]);

// eslint-disable-next-line import/no-unused-modules
export const reduce = (
  inputState = initialState,
  action: ConferencingStateAction | GeneralActionType,
): ConferencingState => {
  return conferencingReducer(inputState, action);
};

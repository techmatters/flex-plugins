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
import { RootState, conferencingBase, namespace } from '..';

export type CallStatus =
  | 'no-call'
  | 'initiating'
  | 'initiated'
  | 'ringing'
  | 'busy'
  | 'failed'
  | 'in-progress'
  | 'completed';

export type ConferencingState = {
  tasks: {
    [taskId: string]: {
      isDialogOpen: boolean;
      callStatus: CallStatus;
      phoneNumber: string;
    };
  };
};

export const newTaskEntry = {
  isDialogOpen: false,
  callStatus: 'no-call' as CallStatus,
  phoneNumber: '',
};

const SET_IS_DIALOG_OPEN = 'conferencing/set-is-dialog-open';

export const setIsDialogOpenAction = createAction(SET_IS_DIALOG_OPEN, (taskId: string, isDialogOpen: boolean) => ({
  taskId,
  isDialogOpen,
}));

const SET_CALL_STATUS = 'conferencing/set-call-status';

export const setCallStatusAction = createAction(SET_CALL_STATUS, (taskId: string, callStatus: CallStatus) => ({
  taskId,
  callStatus,
}));

const SET_PHONE_NUMBER = 'conferencing/set-phone-number';

export const setPhoneNumberAction = createAction(SET_PHONE_NUMBER, (taskId: string, phoneNumber: string) => ({
  taskId,
  phoneNumber,
}));

type ConferencingStateAction =
  | ReturnType<typeof setIsDialogOpenAction>
  | ReturnType<typeof setCallStatusAction>
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
  handleAction(setCallStatusAction, (state, { payload }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      [payload.taskId]: {
        ...state.tasks[payload.taskId],
        callStatus: payload.callStatus,
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

export const isCallStatusLoading = (callStatus: CallStatus) =>
  callStatus === 'initiating' || callStatus === 'initiated' || callStatus === 'ringing';

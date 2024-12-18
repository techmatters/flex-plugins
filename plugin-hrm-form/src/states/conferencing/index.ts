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
import { Action } from 'redux';

import { RemoveContactStateAction } from '../types';
import { removeContactState } from '../actions';
import {
  createContactAsyncAction,
  newLoadContactFromHrmForTaskAsyncAction,
  updateContactInHrmAsyncAction,
} from '../contacts/saveContact';
import { CallStatus } from './callStatus';

export type ConferencingState = {
  tasks: {
    [taskId: string]: {
      isDialogOpen: boolean;
      callStatus: CallStatus;
      phoneNumber: string;
      participantsLabels: { [participantSid: string]: string };
    };
  };
};

export const newTaskEntry = {
  isDialogOpen: false,
  callStatus: 'no-call' as CallStatus,
  phoneNumber: '',
  participantsLabels: {},
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

const ADD_PARTICIPANT_LABEL = 'conferencing/add-participant-label';

export const addParticipantLabelAction = createAction(
  ADD_PARTICIPANT_LABEL,
  (taskId: string, participantSid: string, participantLabel: string) => ({
    taskId,
    participantSid,
    participantLabel,
  }),
);

type ConferencingStateAction =
  | ReturnType<typeof setIsDialogOpenAction>
  | ReturnType<typeof setCallStatusAction>
  | ReturnType<typeof setPhoneNumberAction>
  | ReturnType<typeof addParticipantLabelAction>
  | RemoveContactStateAction;

const initialState: ConferencingState = {
  tasks: {},
};

const createNewEntryForTaskId = (state: ConferencingState, action: Action) => {
  const { contact } = (action as any).payload;
  if (!contact) {
    return state;
  }
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [contact.taskId]: newTaskEntry,
    },
  };
};

const conferencingReducer = createReducer(initialState, handleAction => [
  // Handle GeneralActionType
  handleAction(createContactAsyncAction.fulfilled, createNewEntryForTaskId),
  handleAction(newLoadContactFromHrmForTaskAsyncAction.fulfilled, createNewEntryForTaskId),
  handleAction(updateContactInHrmAsyncAction.fulfilled, (state, action) => {
    const {
      payload: { contact, previousContact },
    } = action;
    let stateWithoutPreviousContact = state;
    if (previousContact && previousContact.taskId !== contact.taskId) {
      stateWithoutPreviousContact = {
        ...state,
        tasks: omit(state.tasks, previousContact.taskId),
      };
    }
    return createNewEntryForTaskId(stateWithoutPreviousContact, action);
  }),

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
  handleAction(addParticipantLabelAction, (state, { payload }) => ({
    ...state,
    tasks: {
      ...state.tasks,
      [payload.taskId]: {
        ...state.tasks[payload.taskId],
        participantsLabels: {
          ...state.tasks[payload.taskId]?.participantsLabels,
          [payload.participantSid]: payload.participantLabel,
        },
      },
    },
  })),
]);

// eslint-disable-next-line import/no-unused-modules
export const reduce = (inputState = initialState, action: ConferencingStateAction): ConferencingState => {
  return conferencingReducer(inputState, action);
};

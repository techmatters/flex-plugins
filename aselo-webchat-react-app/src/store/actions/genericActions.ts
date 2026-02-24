/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { AnyAction, Dispatch } from 'redux';
import { Conversation } from '@twilio/conversations';
import { ThunkAction } from 'redux-thunk';
import { PreEngagementFormItem } from 'hrm-form-definitions';

import { AppState, EngagementPhase, Notification, PreEngagementData, PreEngagementDataItem } from '../definitions';
import {
  ACTION_ADD_MULTIPLE_MESSAGES,
  ACTION_ADD_NOTIFICATION,
  ACTION_ATTACH_FILES,
  ACTION_CHANGE_ENGAGEMENT_PHASE,
  ACTION_CHANGE_EXPANDED_STATUS,
  ACTION_DETACH_FILES,
  ACTION_REMOVE_NOTIFICATION,
  ACTION_UPDATE_PRE_ENGAGEMENT_DATA,
} from './actionTypes';
import { MESSAGES_LOAD_COUNT } from '../../constants';
import { validateInput } from '../../components/forms/formInputs/validation';

export function changeEngagementPhase({ phase }: { phase: EngagementPhase }) {
  return {
    type: ACTION_CHANGE_ENGAGEMENT_PHASE,
    payload: {
      currentPhase: phase,
    },
  };
}

export function addNotification(notification: Notification) {
  return {
    type: ACTION_ADD_NOTIFICATION,
    payload: {
      notification,
    },
  };
}

export function removeNotification(id: string) {
  return {
    type: ACTION_REMOVE_NOTIFICATION,
    payload: {
      id,
    },
  };
}

export function getMoreMessages({ anchor, conversation }: { anchor: number; conversation: Conversation }) {
  return async (dispatch: Dispatch) =>
    dispatch({
      type: ACTION_ADD_MULTIPLE_MESSAGES,
      payload: {
        messages: (await conversation.getMessages(MESSAGES_LOAD_COUNT, anchor)).items,
      },
    });
}

export function changeExpandedStatus({ expanded }: { expanded: boolean }) {
  return {
    type: ACTION_CHANGE_EXPANDED_STATUS,
    payload: {
      expanded,
    },
  };
}

export function attachFiles(files: File[]) {
  return {
    type: ACTION_ATTACH_FILES,
    payload: {
      filesToAttach: files,
    },
  };
}

export function detachFiles(files: File[]) {
  return {
    type: ACTION_DETACH_FILES,
    payload: {
      filesToDetach: files,
    },
  };
}

export const updatePreEngagementData = (data: PreEngagementData) => ({
  type: ACTION_UPDATE_PRE_ENGAGEMENT_DATA,
  payload: data,
});

const updateDataItem = ({
  value,
  definition,
}: {
  value: string | boolean;
  definition: PreEngagementFormItem;
}): PreEngagementDataItem => {
  const error = validateInput({ value, definition });
  return { error, value, dirty: true };
};

export const updatePreEngagementDataField = ({
  name,
  value,
}: {
  name: string;
  value: PreEngagementDataItem['value'];
}): ThunkAction<void, AppState, unknown, AnyAction> => {
  return (dispatch, getState) => {
    const state = getState();
    const definition = state.config.preEngagementFormDefinition?.fields?.find(fd => fd.name === name);
    const updatedItem = updateDataItem({ definition: definition as PreEngagementFormItem, value });

    const data = {
      ...state.session.preEngagementData,
      [name]: updatedItem,
    };

    dispatch({
      type: ACTION_UPDATE_PRE_ENGAGEMENT_DATA,
      payload: data,
    });
  };
};

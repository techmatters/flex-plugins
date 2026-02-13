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

import { AnyAction } from 'redux';
import { Conversation } from '@twilio/conversations';

import { ACTION_START_SESSION, ACTION_UPDATE_CONVERSATION_ATTRIBUTES } from './store/actions/actionTypes';
import type { AppState } from './store/store';

export type TaskState = {
  tasksSids?: string[];
};

const initialState: TaskState = {};

export const taskReducer = (state: TaskState = initialState, { type, payload }: AnyAction) => {
  if ([ACTION_START_SESSION, ACTION_UPDATE_CONVERSATION_ATTRIBUTES].includes(type)) {
    return { ...state, tasksSids: (payload.conversation as Conversation).attributes.tasksSids };
  }
  return state;
};

export const selectTaskSids = (state: AppState) => state.task?.tasksSids;

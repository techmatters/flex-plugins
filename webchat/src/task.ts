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

import { Manager } from '@twilio/flex-webchat-ui';
import { Channel } from 'twilio-chat/lib/channel';

export type TaskState = {
  tasksSids?: string[];
};

const initialState: TaskState = {};

const SET_CURRENT_TASK = 'setCurrentTask';

type SetCurrentTaskAction = {
  type: typeof SET_CURRENT_TASK;
  tasksSids: string[] | undefined;
};

export const setCurrentTaskFromChannel = (channel: Channel): SetCurrentTaskAction => {
  const { tasksSids } = channel.attributes as any;
  return { type: SET_CURRENT_TASK, tasksSids };
};

export const taskReducer = (state: TaskState = initialState, action: SetCurrentTaskAction) => {
  if (action.type === SET_CURRENT_TASK) {
    return { ...state, tasksSids: action.tasksSids };
  }
  return state;
};

export const subscribeToChannel = async (manager: Manager, channel: Channel) => {
  channel.addListener('updated', () => {
    manager.store.dispatch(setCurrentTaskFromChannel(channel));
  });
  manager.store.dispatch(setCurrentTaskFromChannel(channel));
};

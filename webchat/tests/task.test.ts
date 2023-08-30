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

import { Channel } from 'twilio-chat/lib/channel';

import { taskReducer, TaskState, setCurrentTaskFromChannel } from '../src/task';

describe('task reducer', () => {
  test('should return initial state when no action is passed', () => {
    const expected = {};
    const initialState = undefined;
    const updatedState = taskReducer(initialState, {} as any);

    expect(updatedState).toStrictEqual(expected);
  });

  test('should return new taskSid when updating channel with current task', () => {
    const initialState: TaskState = { tasksSids: ['Task1'] };

    const expected = { ...initialState, tasksSids: ['Task1', 'Task2'] };
    const channel: Partial<Channel> = { attributes: { tasksSids: ['Task1', 'Task2'] } };
    const action = setCurrentTaskFromChannel(channel as Channel);
    const updatedState = taskReducer(initialState, action);

    expect(updatedState).toStrictEqual(expected);
  });
});

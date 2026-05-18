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

import { AnyAction } from 'redux';

import { NotificationReducer } from '../notification.reducer';
import { NotificationState, Notification } from '../definitions';
import { ACTION_ADD_NOTIFICATION, ACTION_REMOVE_NOTIFICATION } from '../actions/actionTypes';

describe('Notification Reducer', () => {
  const notification: Notification = {
    message: 'Test notification',
    id: 'TestNotification',
    type: 'neutral',
    dismissible: false,
  };

  it('should return the initial state', () => {
    expect(NotificationReducer(undefined, {} as AnyAction)).toEqual([]);
  });

  it('should return the previous state if action is unkwown', () => {
    const previousState: NotificationState = [];
    expect(NotificationReducer(previousState, { type: 'UNKNOWN_ACTION' })).toEqual([]);
  });

  it('should handle a notification being added', () => {
    const previousState: NotificationState = [];
    expect(
      NotificationReducer(previousState, {
        type: ACTION_ADD_NOTIFICATION,
        payload: {
          notification,
        },
      }),
    ).toEqual([notification]);
  });

  it('should handle a notification being removed', () => {
    const previousState: NotificationState = [notification];
    expect(
      NotificationReducer(previousState, {
        type: ACTION_REMOVE_NOTIFICATION,
        payload: {
          id: notification.id,
        },
      }),
    ).toEqual([]);
  });
});

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

import {
  newSetFlexTransferActionInProgressAction,
  newSetQueueGreetingPopupDismissedAction,
  reduce,
} from '../../../states/taskScopedMetadata';
import { REMOVE_CONTACT_STATE } from '../../../states/types';

const taskId = 'WT123';

describe('taskScopedMetadata reducer', () => {
  test('SET_QUEUE_GREETING_POPUP_DISMISSED - sets the queue greeting popup dismissal for the task', () => {
    const dismissed = reduce({}, newSetQueueGreetingPopupDismissedAction(taskId, true));
    expect(dismissed).toStrictEqual({ [taskId]: { queueGreetings: { dismissedPopup: true } } });

    const reopened = reduce(dismissed, newSetQueueGreetingPopupDismissedAction(taskId, false));
    expect(reopened).toStrictEqual({ [taskId]: { queueGreetings: { dismissedPopup: false } } });
  });

  test('SET_QUEUE_GREETING_POPUP_DISMISSED - leaves other tasks untouched', () => {
    const otherTask = { queueGreetings: { dismissedPopup: true } };
    const state = reduce({ WT456: otherTask }, newSetQueueGreetingPopupDismissedAction(taskId, true));

    expect(state.WT456).toBe(otherTask);
  });

  test('SET_FLEX_TRANSFER_ACTION_IN_PROGRESS - sets and clears transfer state for a task', () => {
    const inProgress = reduce({}, newSetFlexTransferActionInProgressAction(taskId, true));
    expect(inProgress).toStrictEqual({ [taskId]: { flexTransferActionInProgress: true } });

    const finished = reduce(inProgress, newSetFlexTransferActionInProgressAction(taskId, false));
    expect(finished).toStrictEqual({ [taskId]: { flexTransferActionInProgress: false } });
  });

  test('SET_FLEX_TRANSFER_ACTION_IN_PROGRESS - leaves other tasks untouched', () => {
    const otherTask = { queueGreetings: { dismissedPopup: true } };
    const state = reduce({ WT456: otherTask }, newSetFlexTransferActionInProgressAction(taskId, true));

    expect(state.WT456).toBe(otherTask);
  });

  test('REMOVE_CONTACT_STATE - removes the metadata of the task', () => {
    const state = reduce({}, newSetQueueGreetingPopupDismissedAction(taskId, true));

    expect(reduce(state, { type: REMOVE_CONTACT_STATE, taskId, contactId: 'contact1' })).toStrictEqual({});
  });
});

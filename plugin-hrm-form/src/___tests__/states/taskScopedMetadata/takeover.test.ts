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

import { Actions, Notifications, TaskHelper } from '@twilio/flex-ui';
import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';

import {
  newClearTakeoverAction,
  newFailCallTakeoverAsyncAction,
  newStartTakeoverAsyncAction,
  reduce,
} from '../../../states/taskScopedMetadata';
import { requestCallTakeover, updateCallTakeoverStatus } from '../../../services/twilioTaskService';
import { stopMonitoringCall, TAKEOVER_FAILED_NOTIFICATION_ID } from '../../../transfer/takeoverReservation';
import { REMOVE_CONTACT_STATE } from '../../../states/types';
import { TaskSID } from '../../../types/twilio';

jest.mock('@twilio/flex-ui', () => ({
  Actions: { invokeAction: jest.fn() },
  Notifications: { showNotificationSingle: jest.fn() },
  TaskHelper: { isCallTask: jest.fn() },
}));
jest.mock('../../../services/twilioTaskService', () => ({
  requestCallTakeover: jest.fn(),
  updateCallTakeoverStatus: jest.fn(),
}));
jest.mock('../../../transfer/takeoverReservation', () => ({
  stopMonitoringCall: jest.fn(),
  TAKEOVER_FAILED_NOTIFICATION_ID: 'TakeOver_FailedNotification',
}));

const mockIsCallTask = TaskHelper.isCallTask as jest.Mock;
const mockInvokeAction = Actions.invokeAction as jest.Mock;
const mockShowNotificationSingle = Notifications.showNotificationSingle as jest.Mock;
const mockRequestCallTakeover = requestCallTakeover as jest.Mock;
const mockUpdateCallTakeoverStatus = updateCallTakeoverStatus as jest.Mock;
const mockStopMonitoringCall = stopMonitoringCall as jest.Mock;

const TASK_SID = 'WTcall' as TaskSID;
const SUPERVISOR_SID = 'WKsupervisor';
const EARLIER_REQUESTED_AT = '2026-11-20T09:00:00.000Z';
const task = ({
  taskSid: TASK_SID,
  attributes: { takeoverRequest: { requestedAt: EARLIER_REQUESTED_AT, status: 'failed' } },
} as unknown) as ITask;

const testStore = () =>
  configureStore({
    reducer: reduce,
    middleware: getDefaultMiddleware => [
      ...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
      promiseMiddleware(),
    ],
  });

// Rejections are routed to the _REJECTED handler, like asyncDispatch does in the app
const dispatchAndSettle = async (store: ReturnType<typeof testStore>, action: any) => {
  await Promise.resolve(store.dispatch(action)).catch(() => undefined);
};

beforeEach(() => {
  jest.clearAllMocks();
  mockStopMonitoringCall.mockResolvedValue(undefined);
  mockRequestCallTakeover.mockResolvedValue(undefined);
  mockUpdateCallTakeoverStatus.mockResolvedValue(undefined);
  mockInvokeAction.mockResolvedValue(undefined);
});

describe('newStartTakeoverAsyncAction', () => {
  test('call task - stops monitoring, requests the take over and leaves it pending', async () => {
    mockIsCallTask.mockReturnValue(true);
    const store = testStore();
    await dispatchAndSettle(store, newStartTakeoverAsyncAction(task, SUPERVISOR_SID));

    expect(mockStopMonitoringCall).toHaveBeenCalled();
    expect(mockRequestCallTakeover).toHaveBeenCalledWith({ taskSid: TASK_SID });
    expect(mockInvokeAction).not.toHaveBeenCalled();
    expect(store.getState()[TASK_SID].takeover).toStrictEqual({
      status: 'pending',
      requestedAtBeforeTakeover: EARLIER_REQUESTED_AT,
    });
  });

  test('chat task - cold transfers the task to the supervisor', async () => {
    mockIsCallTask.mockReturnValue(false);
    const store = testStore();
    await dispatchAndSettle(store, newStartTakeoverAsyncAction(task, SUPERVISOR_SID));

    expect(mockInvokeAction).toHaveBeenCalledWith('TransferTask', {
      task,
      targetSid: SUPERVISOR_SID,
      options: { mode: 'COLD' },
    });
    expect(mockRequestCallTakeover).not.toHaveBeenCalled();
    expect(store.getState()[TASK_SID].takeover.status).toBe('pending');
  });

  test('call take over request rejected - failed with the error, and notifies the supervisor', async () => {
    mockIsCallTask.mockReturnValue(true);
    mockRequestCallTakeover.mockRejectedValue(new Error('A take over is already active for this task'));
    const store = testStore();
    await dispatchAndSettle(store, newStartTakeoverAsyncAction(task, SUPERVISOR_SID));

    expect(store.getState()[TASK_SID].takeover).toStrictEqual({
      status: 'failed',
      error: 'A take over is already active for this task',
    });
    expect(mockShowNotificationSingle).toHaveBeenCalledWith(TAKEOVER_FAILED_NOTIFICATION_ID);
  });

  test('chat transfer rejected - failed, without the call take over notification', async () => {
    mockIsCallTask.mockReturnValue(false);
    mockInvokeAction.mockRejectedValue(new Error('boom'));
    const store = testStore();
    await dispatchAndSettle(store, newStartTakeoverAsyncAction(task, SUPERVISOR_SID));

    expect(store.getState()[TASK_SID].takeover.status).toBe('failed');
    expect(mockShowNotificationSingle).not.toHaveBeenCalled();
  });
});

describe('newFailCallTakeoverAsyncAction', () => {
  test('failure reported by the counselor client - failed and notified, request left alone', async () => {
    const store = testStore();
    await dispatchAndSettle(store, newFailCallTakeoverAsyncAction(TASK_SID, 'too many participants', false));

    expect(store.getState()[TASK_SID].takeover).toStrictEqual({ status: 'failed', error: 'too many participants' });
    expect(mockShowNotificationSingle).toHaveBeenCalledWith(TAKEOVER_FAILED_NOTIFICATION_ID);
    expect(mockUpdateCallTakeoverStatus).not.toHaveBeenCalled();
  });

  test('timed out - also marks the request failed', async () => {
    const store = testStore();
    await dispatchAndSettle(store, newFailCallTakeoverAsyncAction(TASK_SID, 'Timed out', true));

    expect(mockUpdateCallTakeoverStatus).toHaveBeenCalledWith({
      taskSid: TASK_SID,
      status: 'failed',
      reason: 'Timed out',
    });
    expect(store.getState()[TASK_SID].takeover.status).toBe('failed');
  });

  test('marking the request failed errors - still failed and notified', async () => {
    mockUpdateCallTakeoverStatus.mockRejectedValue(new Error('409'));
    const store = testStore();
    await dispatchAndSettle(store, newFailCallTakeoverAsyncAction(TASK_SID, 'Timed out', true));

    expect(store.getState()[TASK_SID].takeover.status).toBe('failed');
    expect(mockShowNotificationSingle).toHaveBeenCalledWith(TAKEOVER_FAILED_NOTIFICATION_ID);
  });
});

describe('take over reducer', () => {
  const pendingState = { [TASK_SID]: { queueGreetings: { dismissedPopup: true }, takeover: { status: 'pending' } } };

  test('CLEAR_TAKEOVER - removes the take over and keeps other task metadata', () => {
    expect(reduce(pendingState as any, newClearTakeoverAction(TASK_SID))).toStrictEqual({
      [TASK_SID]: { queueGreetings: { dismissedPopup: true }, takeover: undefined },
    });
  });

  test('REMOVE_CONTACT_STATE - removes the take over with the rest of the task metadata', () => {
    expect(
      reduce(pendingState as any, { type: REMOVE_CONTACT_STATE, taskId: TASK_SID, contactId: 'c1' }),
    ).toStrictEqual({});
  });
});

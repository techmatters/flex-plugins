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

/* eslint-disable camelcase */
import * as Flex from '@twilio/flex-ui';
import { omit } from 'lodash';
import '../mockGetConfig';
import each from 'jest-each';

import * as TransferHelpers from '../../transfer/transferTaskState';
import { transferModes, transferStatuses } from '../../states/DomainConstants';
import { acceptTask, createTask } from '../helpers';
import * as callStatus from '../../states/conferencing/callStatus';
import { conferencingBase, namespace } from '../../states/storeNamespaces';

const members = new Map();
members.set('some_40identity', { source: { sid: 'member1' } });
const channel1 = { members };
const mockChannels = { channel1 };

jest.mock('@twilio/flex-ui', () => ({
  ...jest.requireActual('@twilio/flex-ui'),
  Actions: { invokeAction: jest.fn() },
  StateHelper: { getChatChannelStateForTask: task => mockChannels[task.taskChannelSid] },
}));

describe('Transfer mode, status and conditionals helpers', () => {
  test('hasTransferStarted', async () => {
    const task1 = createTask({});
    const task2 = createTask({
      transferMeta: {
        originalTask: 'task2',
        originalReservation: 'task2',
        originalCounselor: 'worker2',
        transferStatus: transferStatuses.transferring,
        formDocument: null,
        mode: transferModes.cold,
      },
    });

    expect(TransferHelpers.hasTransferStarted(task1)).toBe(false); // not transferred
    expect(TransferHelpers.hasTransferStarted(task2)).toBe(true); // transferred
  });

  test('isOriginalReservation', async () => {
    const task1 = createTask({ transferMeta: { originalReservation: 'task1' } }, { sid: 'task1' });
    const task2 = createTask({ transferMeta: { originalReservation: 'task2' } }, { sid: 'task3' });
    const task3 = createTask();

    expect(TransferHelpers.isOriginalReservation(task1)).toBe(true); // is original
    expect(TransferHelpers.isOriginalReservation(task2)).toBe(false); // not original
    expect(TransferHelpers.isOriginalReservation(task3)).toBe(false); // not transferred
  });

  test('isWarmTransfer', async () => {
    const task1 = createTask({ transferMeta: { mode: transferModes.warm } });
    const task2 = createTask({ transferMeta: { mode: transferModes.cold } });
    const task3 = createTask();

    expect(TransferHelpers.isWarmTransfer(task1)).toBe(true); // is warm
    expect(TransferHelpers.isWarmTransfer(task2)).toBe(false); // is cold
    expect(TransferHelpers.isWarmTransfer(task3)).toBe(false); // not transferred
  });

  test('isColdTransfer', async () => {
    const task1 = createTask({ transferMeta: { mode: transferModes.cold } });
    const task2 = createTask({ transferMeta: { mode: transferModes.warm } });
    const task3 = createTask();

    expect(TransferHelpers.isColdTransfer(task1)).toBe(true); // is cold
    expect(TransferHelpers.isColdTransfer(task2)).toBe(false); // is warm
    expect(TransferHelpers.isColdTransfer(task3)).toBe(false); // not transferred
  });

  // TODO: refactor with nice syntax once Twilio lets us update jest
  each(
    [
      {
        task: createTask({ transferMeta: { transferStatus: transferStatuses.transferring } }),
        expectedResult: true,
        description: 'transferring state',
      },
      {
        task: createTask({ transferMeta: { transferStatus: transferStatuses.accepted } }),
        expectedResult: false,
        description: 'accepted state',
      },
      {
        task: createTask({ transferMeta: { transferStatus: transferStatuses.rejected } }),
        expectedResult: false,
        description: 'rejected state',
      },
      { task: createTask(), expectedResult: false, description: 'no attributes' },
      {
        task: createTask(
          {
            transferMeta: {
              transferStatus: transferStatuses.accepted,
              transferModes: transferModes.cold,
              sidWithTaskControl: 'AN SID',
            },
          },
          { sid: 'AN SID' },
        ),
        expectedResult: false,
        description: 'cold transfer with control',
      },
      {
        task: createTask(
          {
            transferMeta: {
              transferStatus: transferStatuses.accepted,
              transferModes: transferModes.cold,
              sidWithTaskControl: 'AN SID',
            },
          },
          { sid: 'ANOTHER SID' },
        ),
        expectedResult: false,
        description: 'cold transfer without control',
      },
    ].map(tc => ({ ...tc, toString: () => `${tc.description} should return ${tc.expectedResult}` })),
  ).test('isTransferring with %s', async ({ task, expectedResult }) => {
    expect(TransferHelpers.isTransferring(task)).toBe(expectedResult);
  });

  test('shouldShowTransferButton', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const [task2c, task2r] = await Promise.all([acceptTask(task1), acceptTask(task1)]);
    await TransferHelpers.setTransferAccepted(task2c);
    await TransferHelpers.setTransferRejected(task2r);
    const [task3c, task3r] = await Promise.all([task2c.wrapUp(), task2c.wrapUp()]);
    const [task4c, task4r] = await Promise.all([task2c.complete(), task2c.complete()]);

    expect(TransferHelpers.shouldShowTransferButton(task1)).toBe(false); // pending
    expect(TransferHelpers.shouldShowTransferButton(task2c)).toBe(true); // ok
    expect(TransferHelpers.shouldShowTransferButton(task2r)).toBe(true); // ok
    expect(TransferHelpers.shouldShowTransferButton(task3c)).toBe(false); // wraping
    expect(TransferHelpers.shouldShowTransferButton(task3r)).toBe(false); // wraping
    expect(TransferHelpers.shouldShowTransferButton(task4c)).toBe(false); // complete
    expect(TransferHelpers.shouldShowTransferButton(task4r)).toBe(false); // complete
  });

  test('shouldShowTransferControls', async () => {
    const task1 = createTask({ transferMeta: { originalReservation: 'task1' } }, { sid: 'task1' });
    const task2 = createTask(
      { transferMeta: { originalReservation: 'task1', transferStatus: transferStatuses.transferring } },
      { sid: 'task2' },
    );
    const task2Accepted = await acceptTask(task2);
    const task3 = {
      ...task2Accepted,
      sid: 'task3',
      attributes: {
        ...task2Accepted.attributes,
        transferMeta: {
          ...task2Accepted.attributes.transferMeta,
          sidWithTaskControl: 'task3',
        },
      },
    };
    const [task4c, task4r] = [{ ...task3 }, { ...task3 }];
    await TransferHelpers.setTransferAccepted(task4c);
    await TransferHelpers.setTransferRejected(task4r);
    const task5 = {
      ...task2Accepted,
      sid: 'task3',
      attributes: {
        ...task2Accepted.attributes,
        transferMeta: {
          ...task2Accepted.attributes.transferMeta,
          sidWithTaskControl: 'not_task3',
        },
      },
    };

    expect(TransferHelpers.shouldShowTransferControls(task1)).toBe(false); // is original
    expect(TransferHelpers.shouldShowTransferControls(task2)).toBe(false); // pending
    expect(TransferHelpers.shouldShowTransferControls(task3)).toBe(false); // controlled
    expect(TransferHelpers.shouldShowTransferControls(task4c)).toBe(false); // accepted
    expect(TransferHelpers.shouldShowTransferControls(task4r)).toBe(false); // rejected
    expect(TransferHelpers.shouldShowTransferControls(task5)).toBe(true); // ok
  });

  test('hasTaskControl', async () => {
    const task1 = createTask(
      {
        transferMeta: {
          transferStatus: transferStatuses.transferring,
          originalReservation: 'task1',
          sidWithTaskControl: '',
        },
      },
      { sid: 'task1' },
    );
    const task2 = createTask(
      {
        transferMeta: {
          transferStatus: transferStatuses.transferring,
          originalReservation: 'task1',
          sidWithTaskControl: '',
        },
      },
      { sid: 'task2' },
    );
    const [task1c, task1r] = [{ ...task1 }, { ...task1 }];
    const [task2c, task2r] = [{ ...task2 }, { ...task2 }];
    await TransferHelpers.setTransferAccepted(task1c);
    await TransferHelpers.takeTaskControl(task1c);

    await TransferHelpers.setTransferRejected(task1r);
    await TransferHelpers.returnTaskControl(task1r);

    await TransferHelpers.setTransferAccepted(task2c);
    await TransferHelpers.takeTaskControl(task2c);

    await TransferHelpers.setTransferRejected(task2r);
    await TransferHelpers.returnTaskControl(task2r);

    const task3 = createTask({});

    expect(TransferHelpers.hasTaskControl(task1)).toBe(false); // transferring
    expect(TransferHelpers.hasTaskControl(task2)).toBe(false); // transferring
    expect(TransferHelpers.hasTaskControl(task1c)).toBe(true); // original but accepted (control to 2nd counselor)
    expect(TransferHelpers.hasTaskControl(task1r)).toBe(false); // ok
    expect(TransferHelpers.hasTaskControl(task2c)).toBe(true); // ok
    expect(TransferHelpers.hasTaskControl(task2r)).toBe(false); // transferred task rejected
    expect(TransferHelpers.hasTaskControl(task3)).toBe(true); // ok
  });

  test('takeTaskControl (voice task)', async () => {
    const task = createTask({ transferMeta: {} }, { sid: 'task1', taskChannelUniqueName: 'voice' });

    await TransferHelpers.takeTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(task.sid);
  });

  test('takeTaskControl (chat task)', async () => {
    const task = createTask({ transferMeta: {} }, { sid: 'task1', taskChannelUniqueName: 'chat' });

    await TransferHelpers.takeTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(task.sid);
  });

  test('returnTaskControl (voice task)', async () => {
    const task = createTask(
      { transferMeta: { originalReservation: 'reservationX' } },
      { sid: 'task1', taskChannelUniqueName: 'voice' },
    );

    await TransferHelpers.returnTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(task.attributes.transferMeta.originalReservation);
  });
});

describe('Kick, close and helpers', () => {
  const mockFlexActionsInvoke = Flex.Actions.invokeAction as jest.Mock;
  const task = createTask(
    {
      ignoreAgent: 'some@identity',
      transferMeta: {
        originalTask: 'task1',
        originalReservation: 'reservation1',
        originalCounselor: 'some@identity',
      },
    },
    { sid: 'reservation2', taskSid: 'task2', taskChannelSid: 'channel1' },
  );

  test('closeCallOriginal', async () => {
    const expected1 = { sid: 'reservation2', targetSid: 'some@identity' };
    mockFlexActionsInvoke.mockClear();
    expect(Flex.Actions.invokeAction).not.toHaveBeenCalled();

    await TransferHelpers.closeCallOriginal(task);

    expect(task.attributes.transferMeta.transferStatus).toBe(transferStatuses.accepted);
    expect(Flex.Actions.invokeAction).toHaveBeenCalledWith('KickParticipant', expected1);
  });

  test('closeCallSelf', async () => {
    const expected1 = { sid: 'reservation2' };
    mockFlexActionsInvoke.mockClear();
    expect(Flex.Actions.invokeAction).not.toHaveBeenCalled();

    await TransferHelpers.closeCallSelf(task);

    expect(task.attributes.transferMeta.transferStatus).toBe(transferStatuses.rejected);
    expect(Flex.Actions.invokeAction).toHaveBeenCalledWith('CompleteTask', expected1);
  });

  test('setTransferAccepted', async () => {
    const before = { ...task };
    await TransferHelpers.setTransferAccepted(task);

    const { attributes, ...after } = before;
    const { transferMeta, ...afterAttributes } = attributes;
    const { transferStatus, ...afterTransferMeta } = transferMeta;

    expect(task.attributes.transferMeta.transferStatus).toBe(transferStatuses.accepted);
    expect(after).toStrictEqual(omit(before, 'attributes'));
    expect(afterAttributes).toStrictEqual(omit(before.attributes, 'transferMeta'));
    expect(afterTransferMeta).toStrictEqual(omit(before.attributes.transferMeta, 'transferStatus'));
  });

  test('setTransferRejected', async () => {
    const before = { ...task };
    await TransferHelpers.setTransferRejected(task);

    const { attributes, ...after } = before;
    const { transferMeta, ...afterAttributes } = attributes;
    const { transferStatus, ...afterTransferMeta } = transferMeta;

    expect(task.attributes.transferMeta.transferStatus).toBe(transferStatuses.rejected);
    expect(after).toStrictEqual(omit(before, 'attributes'));
    expect(afterAttributes).toStrictEqual(omit(before.attributes, 'transferMeta'));
    expect(afterTransferMeta).toStrictEqual(omit(before.attributes.transferMeta, 'transferStatus'));
  });

  test('setTransferMeta', async () => {
    const coldTask = createTask(
      { channelSid: 'channel1' },
      { sid: 'reservation1', taskSid: 'task1', taskChannelSid: 'channel1', workerSid: 'worker1' },
    );

    const coldPayload = {
      targetSid: 'WKworker2',
      options: { mode: transferModes.cold },
      task: coldTask,
    };

    const counselorName = 'full name';

    const coldExpected = {
      originalTask: 'task1',
      originalReservation: 'reservation1',
      originalCounselor: 'worker1',
      originalCounselorName: counselorName,
      originalConversationSid: 'channel1',
      transferStatus: transferStatuses.accepted,
      mode: transferModes.cold,
      sidWithTaskControl: 'WR00000000000000000000000000000000',
      targetType: 'worker',
    };

    await TransferHelpers.setTransferMeta(coldPayload, counselorName);
    expect(coldTask.attributes.transferMeta).toStrictEqual(coldExpected);

    const warmTask = createTask(
      {},
      { sid: 'reservation1', taskSid: 'task1', taskChannelSid: 'channel1', workerSid: 'WKworker1' },
    );

    const warmExpected = {
      originalTask: 'task1',
      originalReservation: 'reservation1',
      originalCounselor: 'WKworker1',
      originalCounselorName: counselorName,
      originalConversationSid: undefined,
      transferStatus: transferStatuses.transferring,
      mode: transferModes.warm,
      sidWithTaskControl: '',
      targetType: 'worker',
    };

    const warmPayload = {
      targetSid: 'WKworker2',
      options: { mode: transferModes.warm },
      task: warmTask,
    };

    await TransferHelpers.setTransferMeta(warmPayload, counselorName);
    expect(warmTask.attributes.transferMeta).toStrictEqual(warmExpected);
  });

  test('clearTransferMeta', async () => {
    const anotherTask = createTask(
      { something: 'something' },
      { sid: 'reservation1', taskSid: 'task1', taskChannelSid: 'channel1', workerSid: 'WKworker1' },
    );

    const counselorName = 'full name';

    const coldPayload = {
      targetSid: 'WKworker2',
      options: { mode: transferModes.cold },
      task: anotherTask,
    };

    await TransferHelpers.setTransferMeta(coldPayload, counselorName);
    expect(anotherTask.attributes.transferMeta).not.toBeUndefined();
    expect(anotherTask.attributes.transferStarted).toBeTruthy();

    await TransferHelpers.clearTransferMeta(anotherTask);
    expect(anotherTask.attributes.transferMeta).toBeUndefined();
    expect(anotherTask.attributes.transferStarted).toBeFalsy();

    const warmPayload = {
      targetSid: 'WKworker2',
      options: { mode: transferModes.warm },
      task: anotherTask,
    };

    await TransferHelpers.setTransferMeta(warmPayload, counselorName);
    expect(anotherTask.attributes.transferMeta).not.toBeUndefined();
    expect(anotherTask.attributes.transferStarted).toBeTruthy();

    await TransferHelpers.clearTransferMeta(anotherTask);
    expect(anotherTask.attributes.transferMeta).toBeUndefined();
    expect(anotherTask.attributes.transferStarted).toBeFalsy();
  });
});

describe('Conference Transfer', () => {
  jest.mock('@twilio/flex-ui', () => ({
    ...jest.requireActual('@twilio/flex-ui'),
    TaskHelper: {
      isLiveCall: jest.fn(),
      isChatBasedTask: jest.fn(),
    },
    Manager: { getInstance: jest.fn() },
  }));

  afterEach(() => jest.resetAllMocks());

  const task = {
    taskSid: 'task-sid',
    conference: {
      liveParticipantCount: 2,
    },
  };

  const mockIsChatBasedTask = (value: boolean) => jest.spyOn(Flex.TaskHelper, 'isChatBasedTask').mockReturnValue(value);
  const mockIsLiveCall = (value: boolean) => jest.spyOn(Flex.TaskHelper, 'isLiveCall').mockReturnValue(value);
  const mockInstance = (task: Required<{ taskSid: string }>) => {
    const instance = {
      ...Flex.Manager,
      store: {
        getState: () => ({
          [namespace]: {
            [conferencingBase]: {
              tasks: {
                [task.taskSid]: task,
              },
            },
          },
        }),
      },
    };
    jest.spyOn(Flex.Manager, 'getInstance').mockReturnValue(instance as any);
  };
  const mockIsCallStatusLoading = (task: Required<{ taskSid: string }>, value: boolean) =>
    jest.spyOn(callStatus, 'isCallStatusLoading').mockReturnValue(value);

  test('Cannot transfer if is not live call', () => {
    mockIsChatBasedTask(false);
    mockIsLiveCall(false);
    mockInstance(task);
    mockIsCallStatusLoading(task, false);

    expect(TransferHelpers.canTransferConference(task as Flex.ITask)).toBe(false);
  });

  test('Cannot transfer while isLoading', () => {
    mockIsChatBasedTask(false);
    mockIsLiveCall(true);
    mockInstance(task);
    mockIsCallStatusLoading(task, true);

    expect(TransferHelpers.canTransferConference(task as Flex.ITask)).toBe(false);
  });

  test('Cannot transfer if there are three or more participants', () => {
    const threeParticipantsTask = { ...task, conference: { ...task.conference } };
    threeParticipantsTask.conference.liveParticipantCount = 3;

    mockIsChatBasedTask(false);
    mockIsLiveCall(true);
    mockInstance(task);
    mockIsCallStatusLoading(threeParticipantsTask, false);

    expect(TransferHelpers.canTransferConference(threeParticipantsTask as Flex.ITask)).toBe(false);
  });

  test('Should be able to transfer', () => {
    mockIsChatBasedTask(false);
    mockIsLiveCall(true);
    mockInstance(task);
    mockIsCallStatusLoading(task, false);

    expect(TransferHelpers.canTransferConference(task as Flex.ITask)).toBe(true);
  });

  test('Should be able to transfer when chat task', () => {
    mockIsChatBasedTask(true);
    mockIsLiveCall(false);
    mockInstance(task);
    mockIsCallStatusLoading(task, false);

    expect(TransferHelpers.canTransferConference(task as Flex.ITask)).toBe(true);
  });
});

/* eslint-disable camelcase */
import { StateHelper, Actions } from '@twilio/flex-ui';
import { omit } from 'lodash';

import '../mockGetConfig';
import * as TransferHelpers from '../../utils/transfer';
import { transferModes, transferStatuses } from '../../states/DomainConstants';
import { createTask } from '../helpers';
import { transferChatResolve } from '../../services/ServerlessService';

jest.mock('../../services/ServerlessService', () => ({
  transferChatResolve: jest.fn(),
}));

Actions.invokeAction = jest.fn();

const members = new Map();
members.set('some_40identity', { source: { sid: 'member1' } });
const channel1 = { members };
const channels = { channel1 };
StateHelper.getChatChannelStateForTask = task => channels[task.taskChannelSid];

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

  test('isTransferring', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const task2 = createTask({ transferMeta: { transferStatus: transferStatuses.accepted } });
    const task3 = createTask({ transferMeta: { transferStatus: transferStatuses.rejected } });
    const task4 = createTask();

    expect(TransferHelpers.isTransferring(task1)).toBe(true); // transferring
    expect(TransferHelpers.isTransferring(task2)).toBe(false); // accepted
    expect(TransferHelpers.isTransferring(task3)).toBe(false); // rejected
    expect(TransferHelpers.isTransferring(task4)).toBe(false); // not transferred
  });

  test('isTransferRejected', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.rejected } });
    const task2 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const task3 = createTask({ transferMeta: { transferStatus: transferStatuses.accepted } });
    const task4 = createTask();

    expect(TransferHelpers.isTransferRejected(task1)).toBe(true); // rejected
    expect(TransferHelpers.isTransferRejected(task2)).toBe(false); // transferring
    expect(TransferHelpers.isTransferRejected(task3)).toBe(false); // accepted
    expect(TransferHelpers.isTransferRejected(task4)).toBe(false); // not transferred
  });

  test('isTransferAccepted', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.accepted } });
    const task2 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const task3 = createTask({ transferMeta: { transferStatus: transferStatuses.rejected } });
    const task4 = createTask();

    expect(TransferHelpers.isTransferAccepted(task1)).toBe(true); // accepted
    expect(TransferHelpers.isTransferAccepted(task2)).toBe(false); // transferring
    expect(TransferHelpers.isTransferAccepted(task3)).toBe(false); // rejected
    expect(TransferHelpers.isTransferAccepted(task4)).toBe(false); // not transferred
  });

  test('shouldShowTransferButton', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const [task2c, task2r] = await Promise.all([task1.accept(), task1.accept()]);
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
    const task3 = await task2.accept();
    const [task4c, task4r] = [{ ...task3 }, { ...task3 }];
    await TransferHelpers.setTransferAccepted(task4c);
    await TransferHelpers.setTransferRejected(task4r);

    expect(TransferHelpers.shouldShowTransferControls(task1)).toBe(false); // is original
    expect(TransferHelpers.shouldShowTransferControls(task2)).toBe(false); // pending
    expect(TransferHelpers.shouldShowTransferControls(task3)).toBe(true); // ok
    expect(TransferHelpers.shouldShowTransferControls(task4c)).toBe(false); // accepted
    expect(TransferHelpers.shouldShowTransferControls(task4r)).toBe(false); // rejected
  });

  test('hasTaskControl', async () => {
    const task1 = createTask(
      { transferMeta: { transferStatus: transferStatuses.transferring, originalReservation: 'task1' } },
      { sid: 'task1' },
    );
    const task2 = createTask(
      { transferMeta: { transferStatus: transferStatuses.transferring, originalReservation: 'task1' } },
      { sid: 'task2' },
    );
    const [task1c, task1r] = [{ ...task1 }, { ...task1 }];
    const [task2c, task2r] = [{ ...task2 }, { ...task2 }];
    await TransferHelpers.setTransferAccepted(task1c);
    await TransferHelpers.setTransferRejected(task1r);
    await TransferHelpers.setTransferAccepted(task2c);
    await TransferHelpers.setTransferRejected(task2r);
    const task3 = createTask({});

    expect(TransferHelpers.hasTaskControl(task1)).toBe(false); // transferring
    expect(TransferHelpers.hasTaskControl(task2)).toBe(false); // transferring
    expect(TransferHelpers.hasTaskControl(task1c)).toBe(false); // original but accepted (control to 2nd counselor)
    expect(TransferHelpers.hasTaskControl(task1r)).toBe(true); // ok
    expect(TransferHelpers.hasTaskControl(task2c)).toBe(true); // ok
    expect(TransferHelpers.hasTaskControl(task2r)).toBe(false); // transferred task rejected
    expect(TransferHelpers.hasTaskControl(task3)).toBe(true); // ok
  });

  test('takeTaskControl (voice task)', async () => {
    const task = createTask({ transferMeta: {} }, { sid: 'task1', taskChannelUniqueName: 'voice' });

    await TransferHelpers.takeTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(task.sid);
  });

  // this should change when true warm transfer for chat task is implemented
  test('takeTaskControl (chat task)', async () => {
    const task = createTask({ transferMeta: {} }, { sid: 'task1', taskChannelUniqueName: 'chat' });

    await TransferHelpers.takeTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(undefined);
  });

  test('returnTaskControl (voice task)', async () => {
    const task = createTask(
      { transferMeta: { originalReservation: 'reservationX' } },
      { sid: 'task1', taskChannelUniqueName: 'voice' },
    );

    await TransferHelpers.returnTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(task.attributes.transferMeta.originalReservation);
  });

  // this should change when true warm transfer for chat task is implemented
  test('returnTaskControl (chat task)', async () => {
    const task = createTask(
      { transferMeta: { originalReservation: 'reservationX' } },
      { sid: 'task1', taskChannelUniqueName: 'chat' },
    );

    await TransferHelpers.returnTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(undefined);
  });

  test('clearTaskControl (voice task)', async () => {
    const task = createTask(
      { transferMeta: { originalReservation: 'reservationX' } },
      { sid: 'task1', taskChannelUniqueName: 'voice' },
    );

    await TransferHelpers.clearTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe('');
  });

  // this should change when true warm transfer for chat task is implemented
  test('clearTaskControl (chat task)', async () => {
    const task = createTask(
      { transferMeta: { originalReservation: 'reservationX' } },
      { sid: 'task1', taskChannelUniqueName: 'chat' },
    );

    await TransferHelpers.clearTaskControl(task);

    expect(task.attributes.transferMeta.sidWithTaskControl).toBe(undefined);
  });
});

describe('Kick, close and helpers', () => {
  test('shouldReplaceChar', async () => {
    const changeSome = string => string.split('').some(char => TransferHelpers.shouldReplaceChar(char));

    expect(changeSome('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(false);
    expect(changeSome('abcdefghijklmnopqrstuvwxyz')).toBe(false);
    expect(changeSome('0123456789')).toBe(false);
    expect(TransferHelpers.shouldReplaceChar('_')).toBe(true);
    expect(TransferHelpers.shouldReplaceChar('-')).toBe(true);
    expect(TransferHelpers.shouldReplaceChar('@')).toBe(true);
    expect(TransferHelpers.shouldReplaceChar('.')).toBe(true);
  });

  test('transformIdentity', async () => {
    expect(TransferHelpers.transformIdentity('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(TransferHelpers.transformIdentity('abcdefghijklmnopqrstuvwxyz')).toBe('abcdefghijklmnopqrstuvwxyz');
    expect(TransferHelpers.transformIdentity('0123456789')).toBe('0123456789');
    expect(TransferHelpers.transformIdentity('_')).toBe('_5F');
    expect(TransferHelpers.transformIdentity('-')).toBe('_2D');
    expect(TransferHelpers.transformIdentity('@')).toBe('_40');
    expect(TransferHelpers.transformIdentity('.')).toBe('_2E');
  });

  test('getMemberToKick', async () => {
    const task = createTask({}, { taskChannelSid: 'channel1' });
    expect(TransferHelpers.getMemberToKick(task, 'some@identity')).toBe('member1');
    expect(TransferHelpers.getMemberToKick(task, 'non existing')).toBe('');
  });

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

  test('closeChatOriginal', async () => {
    const expected = {
      closeSid: task.attributes.transferMeta.originalTask,
      keepSid: task.taskSid,
      memberToKick: TransferHelpers.getMemberToKick(task, 'some@identity'),
      newStatus: transferStatuses.accepted,
    };

    await TransferHelpers.closeChatOriginal(task);

    expect(transferChatResolve).toBeCalledWith(expected);
  });

  test('closeChatOriginal', async () => {
    const expected = {
      keepSid: task.attributes.transferMeta.originalTask,
      closeSid: task.taskSid,
      memberToKick: '',
      newStatus: transferStatuses.rejected,
    };

    await TransferHelpers.closeChatSelf(task);

    expect(transferChatResolve).toBeCalledWith(expected);
  });

  test('closeCallOriginal', async () => {
    const expected1 = { sid: 'reservation2', targetSid: 'some@identity' };

    await TransferHelpers.closeCallOriginal(task);

    expect(task.attributes.transferMeta.transferStatus).toBe(transferStatuses.accepted);
    expect(Actions.invokeAction).toBeCalledWith('KickParticipant', expected1);
  });

  test('closeCallSelf', async () => {
    const expected1 = { sid: 'reservation2' };

    await TransferHelpers.closeCallSelf(task);

    expect(task.attributes.transferMeta.transferStatus).toBe(transferStatuses.rejected);
    expect(Actions.invokeAction).toBeCalledWith('HangupCall', expected1);
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
      {},
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
      transferStatus: transferStatuses.accepted,
      formDocument: 'some string',
      mode: transferModes.cold,
      sidWithTaskControl: '',
      targetType: 'worker',
    };

    await TransferHelpers.setTransferMeta(coldPayload, 'some string', counselorName);
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
      transferStatus: transferStatuses.transferring,
      formDocument: 'some string',
      mode: transferModes.warm,
      sidWithTaskControl: warmTask.sid,
      targetType: 'worker',
    };

    const warmPayload = {
      targetSid: 'WKworker2',
      options: { mode: transferModes.warm },
      task: warmTask,
    };

    await TransferHelpers.setTransferMeta(warmPayload, 'some string', counselorName);
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

    await TransferHelpers.setTransferMeta(coldPayload, 'some string', counselorName);
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

    await TransferHelpers.setTransferMeta(warmPayload, 'some string', counselorName);
    expect(anotherTask.attributes.transferMeta).not.toBeUndefined();
    expect(anotherTask.attributes.transferStarted).toBeTruthy();

    await TransferHelpers.clearTransferMeta(anotherTask);
    expect(anotherTask.attributes.transferMeta).toBeUndefined();
    expect(anotherTask.attributes.transferStarted).toBeFalsy();
  });
});

describe('TransferredTaskJanitor helpers', () => {
  const createReservation = (sid, workerSid) => ({
    reservation_sid: sid,
    worker_sid: workerSid,
    status: 'pending',
    attributes: {},
    accept() {
      return { ...this, status: 'accepted' };
    },
    wrapUp() {
      return { ...this, status: 'wrapup' };
    },
    complete() {
      return { ...this, status: 'completed' };
    },
    reject() {
      return { ...this, status: 'rejected' };
    },
    setTransferMeta(transferMeta) {
      return { ...this, attributes: { ...this.attributes, transferMeta } };
    },
  });

  const createTransferMeta = (transferStatus, sidWithTaskControl = '') => ({
    originalTask: 'task1',
    originalReservation: 'reservation1',
    originalCounselor: 'worker1',
    transferStatus,
    sidWithTaskControl,
  });

  test('someoneHasTaskControll', async () => {
    const reservation = createReservation('reservation1', 'worker1');

    const withControl = reservation.setTransferMeta({ sidWithTaskControl: 'worker1' });
    const withouthControl = reservation.setTransferMeta({ sidWithTaskControl: '' });

    expect(TransferHelpers.someoneHasTaskControll(withControl)).toBe(true);
    expect(TransferHelpers.someoneHasTaskControll(withouthControl)).toBe(false);
  });

  test('reservationHasTaskControl', async () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const withControl = reservation1.setTransferMeta({ sidWithTaskControl: 'reservation1' });
    const withouthControl = reservation2.setTransferMeta({ sidWithTaskControl: 'reservation1' });

    expect(TransferHelpers.reservationHasTaskControl(withControl)).toBe(true);
    expect(TransferHelpers.reservationHasTaskControl(withouthControl)).toBe(false);
  });

  test('taskControlledByOther', async () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const withControl = reservation1.setTransferMeta({ sidWithTaskControl: 'reservation1' });
    const withouthControl = reservation2.setTransferMeta({ sidWithTaskControl: 'reservation1' });

    expect(TransferHelpers.taskControlledByOther(withControl)).toBe(false);
    expect(TransferHelpers.taskControlledByOther(withouthControl)).toBe(true);
  });

  test('shouldCloseOriginalReservation (accepted)', async () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const acceptedMeta = createTransferMeta(transferStatuses.accepted);
    const withAcceptedMeta1 = reservation1.setTransferMeta(acceptedMeta);
    const withAcceptedMeta2 = reservation2.setTransferMeta(acceptedMeta);

    expect(TransferHelpers.shouldCloseOriginalReservation(withAcceptedMeta1)).toBe(true);
    expect(TransferHelpers.shouldCloseOriginalReservation(withAcceptedMeta2)).toBe(false);
  });

  test('shouldCloseOriginalReservation (rejected)', async () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const rejectedMeta = createTransferMeta(transferStatuses.rejected);
    const withRejectedMeta1 = reservation1.setTransferMeta(rejectedMeta);
    const withRejectedMeta2 = reservation2.setTransferMeta(rejectedMeta);

    expect(TransferHelpers.shouldCloseOriginalReservation(withRejectedMeta1)).toBe(false);
    expect(TransferHelpers.shouldCloseOriginalReservation(withRejectedMeta2)).toBe(false);
  });

  test('shouldCloseTransferredReservation (accepted)', async () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const acceptedMeta = createTransferMeta(transferStatuses.accepted);
    const withAcceptedMeta1 = reservation1.setTransferMeta(acceptedMeta);
    const withAcceptedMeta2 = reservation2.setTransferMeta(acceptedMeta);

    expect(TransferHelpers.shouldCloseTransferredReservation(withAcceptedMeta1)).toBe(false);
    expect(TransferHelpers.shouldCloseTransferredReservation(withAcceptedMeta2)).toBe(false);
  });

  test('shouldCloseTransferredReservation (rejected)', async () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const rejectedMeta = createTransferMeta(transferStatuses.rejected);
    const withRejectedMeta1 = reservation1.setTransferMeta(rejectedMeta);
    const withRejectedMeta2 = reservation2.setTransferMeta(rejectedMeta);

    expect(TransferHelpers.shouldCloseTransferredReservation(withRejectedMeta1)).toBe(false);
    expect(TransferHelpers.shouldCloseTransferredReservation(withRejectedMeta2)).toBe(true);
  });

  test('shouldInvokeCompleteTask (accepted)', () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const acceptedMeta = createTransferMeta(transferStatuses.accepted, 'reservation2');
    const withAcceptedMeta1 = reservation1.setTransferMeta(acceptedMeta);
    const withAcceptedMeta2 = reservation2.setTransferMeta(acceptedMeta);

    const sict = TransferHelpers.shouldInvokeCompleteTask;

    // pending
    expect(sict(withAcceptedMeta1, withAcceptedMeta1.worker_sid)).toBe(false);
    expect(sict(withAcceptedMeta2, withAcceptedMeta2.worker_sid)).toBe(false);
    // accepted
    expect(sict(withAcceptedMeta1.accept(), withAcceptedMeta1.worker_sid)).toBe(false);
    expect(sict(withAcceptedMeta2.accept(), withAcceptedMeta2.worker_sid)).toBe(false);
    // wrapup
    expect(sict(withAcceptedMeta1.wrapUp(), withAcceptedMeta1.worker_sid)).toBe(true);
    expect(sict(withAcceptedMeta2.wrapUp(), withAcceptedMeta2.worker_sid)).toBe(false);
    // completed
    expect(sict(withAcceptedMeta1.complete(), withAcceptedMeta1.worker_sid)).toBe(false);
    expect(sict(withAcceptedMeta2.complete(), withAcceptedMeta2.worker_sid)).toBe(false);
  });

  test('shouldInvokeCompleteTask (rejected)', () => {
    const reservation1 = createReservation('reservation1', 'worker1');
    const reservation2 = createReservation('reservation2', 'worker2');

    const rejectedMeta = createTransferMeta(transferStatuses.rejected, 'reservation1');
    const withRejectedMeta1 = reservation1.setTransferMeta(rejectedMeta);
    const withRejectedMeta2 = reservation2.setTransferMeta(rejectedMeta);

    const sict = TransferHelpers.shouldInvokeCompleteTask;

    // pending
    expect(sict(withRejectedMeta1, withRejectedMeta1.worker_sid)).toBe(false);
    expect(sict(withRejectedMeta2, withRejectedMeta2.worker_sid)).toBe(false);
    // accepted
    expect(sict(withRejectedMeta1.accept(), withRejectedMeta1.worker_sid)).toBe(false);
    expect(sict(withRejectedMeta2.accept(), withRejectedMeta2.worker_sid)).toBe(false);
    // wrapup
    expect(sict(withRejectedMeta1.wrapUp(), withRejectedMeta1.worker_sid)).toBe(false);
    expect(sict(withRejectedMeta2.wrapUp(), withRejectedMeta2.worker_sid)).toBe(true);
    // completed
    expect(sict(withRejectedMeta1.complete(), withRejectedMeta1.worker_sid)).toBe(false);
    expect(sict(withRejectedMeta2.complete(), withRejectedMeta2.worker_sid)).toBe(false);
  });

  test('shouldTakeControlBack', async () => {
    const reservation = createReservation('reservation1', 'worker1');
    const withAttr = reservation.setTransferMeta({
      targetType: 'worker',
      originalCounselor: 'worker1',
      mode: transferModes.warm,
    });

    expect(TransferHelpers.shouldTakeControlBack(withAttr, 'worker1')).toBe(false);
    expect(TransferHelpers.shouldTakeControlBack(withAttr.accept(), 'worker1')).toBe(false);
    expect(TransferHelpers.shouldTakeControlBack(withAttr.wrapUp(), 'worker1')).toBe(false);
    expect(TransferHelpers.shouldTakeControlBack(withAttr.complete(), 'worker1')).toBe(false);
    expect(TransferHelpers.shouldTakeControlBack(withAttr.reject(), 'worker1')).toBe(true);

    expect(TransferHelpers.shouldTakeControlBack(withAttr.reject(), 'worker2')).toBe(false);

    const cold = reservation.setTransferMeta({
      targetType: 'worker',
      originalCounselor: 'worker1',
      mode: transferModes.cold,
    });

    expect(TransferHelpers.shouldTakeControlBack(cold.reject(), 'worker1')).toBe(false);

    const toQueue = reservation.setTransferMeta({
      targetType: 'queue',
      originalCounselor: 'worker1',
      mode: transferModes.warm,
    });

    expect(TransferHelpers.shouldTakeControlBack(toQueue.reject(), 'worker1')).toBe(false);
  });
});

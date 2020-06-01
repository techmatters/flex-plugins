import { StateHelper } from '@twilio/flex-ui';
import { omit } from 'lodash';

import '../mockGetConfig';
import * as TransferHelpers from '../../utils/transfer';
import { transferModes, transferStatuses } from '../../states/DomainConstants';
import { createTask } from '../helpers';
import { transferChatResolve } from '../../services/ServerlessService';

jest.mock('../../services/ServerlessService', () => ({
  transferChatResolve: jest.fn(),
}));

const members = new Map();
members.set('some_40identity', { source: { sid: 'member1' } });
const channel1 = { members };
const channels = { channel1 };
StateHelper.getChatChannelStateForTask = task => channels[task.taskChannelSid];

describe('Transfer mode, status and conditionals helpers', () => {
  test('tranferStarted', async () => {
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

    expect(TransferHelpers.tranferStarted(task1)).toBe(false); // not transferred
    expect(TransferHelpers.tranferStarted(task2)).toBe(true); // transferred
  });

  test('isOriginal', async () => {
    const task1 = createTask({ transferMeta: { originalReservation: 'task1' } }, { sid: 'task1' });
    const task2 = createTask({ transferMeta: { originalReservation: 'task2' } }, { sid: 'task3' });
    const task3 = createTask();

    expect(TransferHelpers.isOriginal(task1)).toBe(true); // is original
    expect(TransferHelpers.isOriginal(task2)).toBe(false); // not original
    expect(TransferHelpers.isOriginal(task3)).toBe(false); // not transferred
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
    const task2 = createTask({ transferMeta: { transferStatus: transferStatuses.completed } });
    const task3 = createTask({ transferMeta: { transferStatus: transferStatuses.rejected } });
    const task4 = createTask();

    expect(TransferHelpers.isTransferring(task1)).toBe(true); // transferring
    expect(TransferHelpers.isTransferring(task2)).toBe(false); // completed
    expect(TransferHelpers.isTransferring(task3)).toBe(false); // rejected
    expect(TransferHelpers.isTransferring(task4)).toBe(false); // not transferred
  });

  test('isTransferRejected', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.rejected } });
    const task2 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const task3 = createTask({ transferMeta: { transferStatus: transferStatuses.completed } });
    const task4 = createTask();

    expect(TransferHelpers.isTransferRejected(task1)).toBe(true); // rejected
    expect(TransferHelpers.isTransferRejected(task2)).toBe(false); // transferring
    expect(TransferHelpers.isTransferRejected(task3)).toBe(false); // completed
    expect(TransferHelpers.isTransferRejected(task4)).toBe(false); // not transferred
  });

  test('isTransferCompleted', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.completed } });
    const task2 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const task3 = createTask({ transferMeta: { transferStatus: transferStatuses.rejected } });
    const task4 = createTask();

    expect(TransferHelpers.isTransferCompleted(task1)).toBe(true); // completed
    expect(TransferHelpers.isTransferCompleted(task2)).toBe(false); // transferring
    expect(TransferHelpers.isTransferCompleted(task3)).toBe(false); // rejected
    expect(TransferHelpers.isTransferCompleted(task4)).toBe(false); // not transferred
  });

  test('showTransferButton', async () => {
    const task1 = createTask({ transferMeta: { transferStatus: transferStatuses.transferring } });
    const [task2c, task2r] = await Promise.all([task1.accept(), task1.accept()]);
    await TransferHelpers.setTransferCompleted(task2c);
    await TransferHelpers.setTransferRejected(task2r);
    const [task3c, task3r] = await Promise.all([task2c.wrapUp(), task2c.wrapUp()]);
    const [task4c, task4r] = await Promise.all([task2c.complete(), task2c.complete()]);

    expect(TransferHelpers.showTransferButton(task1)).toBe(false); // pending
    expect(TransferHelpers.showTransferButton(task2c)).toBe(true); // ok
    expect(TransferHelpers.showTransferButton(task2r)).toBe(true); // ok
    expect(TransferHelpers.showTransferButton(task3c)).toBe(false); // wraping
    expect(TransferHelpers.showTransferButton(task3r)).toBe(false); // wraping
    expect(TransferHelpers.showTransferButton(task4c)).toBe(false); // complete
    expect(TransferHelpers.showTransferButton(task4r)).toBe(false); // complete
  });

  test('showTransferControls', async () => {
    const task1 = createTask({ transferMeta: { originalReservation: 'task1' } }, { sid: 'task1' });
    const task2 = createTask(
      { transferMeta: { originalReservation: 'task1', transferStatus: transferStatuses.transferring } },
      { sid: 'task2' },
    );
    const task3 = await task2.accept();
    const [task4c, task4r] = [{ ...task3 }, { ...task3 }];
    await TransferHelpers.setTransferCompleted(task4c);
    await TransferHelpers.setTransferCompleted(task4r);

    expect(TransferHelpers.showTransferControls(task1)).toBe(false); // is original
    expect(TransferHelpers.showTransferControls(task2)).toBe(false); // pending
    expect(TransferHelpers.showTransferControls(task3)).toBe(true); // ok
    expect(TransferHelpers.showTransferControls(task4c)).toBe(false); // completed
    expect(TransferHelpers.showTransferControls(task4r)).toBe(false); // rejected
  });

  test('shouldSubmitFormChat', async () => {
    const taskC = createTask(
      { transferMeta: { transferStatus: transferStatuses.transferring } },
      { taskChannelUniqueName: 'chat' },
    );
    const taskV = createTask(
      { transferMeta: { transferStatus: transferStatuses.transferring } },
      { taskChannelUniqueName: 'voice' },
    );
    const [taskCc, taskCr] = [{ ...taskC }, { ...taskC }];
    await TransferHelpers.setTransferCompleted(taskCc);
    await TransferHelpers.setTransferRejected(taskCr);
    const [taskVc, taskVr] = [{ ...taskV }, { ...taskV }];
    await TransferHelpers.setTransferCompleted(taskVc);
    await TransferHelpers.setTransferRejected(taskVr);
    const task2 = createTask({}, { taskChannelUniqueName: 'chat' });

    expect(TransferHelpers.shouldSubmitFormChat(taskC)).toBe(false); // transferring
    expect(TransferHelpers.shouldSubmitFormChat(taskV)).toBe(false); // transferring
    expect(TransferHelpers.shouldSubmitFormChat(taskCc)).toBe(true); // ok
    expect(TransferHelpers.shouldSubmitFormChat(taskCr)).toBe(true); // ok
    expect(TransferHelpers.shouldSubmitFormChat(taskVc)).toBe(false); // not voice
    expect(TransferHelpers.shouldSubmitFormChat(taskVr)).toBe(false); // not voice
    expect(TransferHelpers.shouldSubmitFormChat(task2)).toBe(true); // ok
  });

  test('shouldSubmitFormCall', async () => {
    const taskV1 = createTask(
      { transferMeta: { transferStatus: transferStatuses.transferring, originalReservation: 'task1' } },
      { taskChannelUniqueName: 'voice', sid: 'task1' },
    );
    const taskV2 = createTask(
      { transferMeta: { transferStatus: transferStatuses.transferring, originalReservation: 'task1' } },
      { taskChannelUniqueName: 'voice', sid: 'task2' },
    );
    const taskC = createTask(
      { transferMeta: { transferStatus: transferStatuses.transferring } },
      { taskChannelUniqueName: 'chat' },
    );
    const [taskV1c, taskV1r] = [{ ...taskV1 }, { ...taskV1 }];
    const [taskV2c, taskV2r] = [{ ...taskV2 }, { ...taskV2 }];
    await TransferHelpers.setTransferCompleted(taskV1c);
    await TransferHelpers.setTransferRejected(taskV1r);
    await TransferHelpers.setTransferCompleted(taskV2c);
    await TransferHelpers.setTransferRejected(taskV2r);
    const [taskCc, taskCr] = [{ ...taskC }, { ...taskC }];
    await TransferHelpers.setTransferCompleted(taskCc);
    await TransferHelpers.setTransferRejected(taskCr);
    const task2 = createTask({}, { taskChannelUniqueName: 'voice' });

    expect(TransferHelpers.shouldSubmitFormCall(taskV1)).toBe(false); // transferring
    expect(TransferHelpers.shouldSubmitFormCall(taskV2)).toBe(false); // transferring
    expect(TransferHelpers.shouldSubmitFormCall(taskC)).toBe(false); // not call
    expect(TransferHelpers.shouldSubmitFormCall(taskV1c)).toBe(false); // original but completed (control to 2nd counselor)
    expect(TransferHelpers.shouldSubmitFormCall(taskV1r)).toBe(true); // ok
    expect(TransferHelpers.shouldSubmitFormCall(taskV2c)).toBe(true); // ok
    expect(TransferHelpers.shouldSubmitFormCall(taskV2r)).toBe(false); // transferred task rejected
    expect(TransferHelpers.shouldSubmitFormCall(taskCc)).toBe(false); // not call
    expect(TransferHelpers.shouldSubmitFormCall(taskCr)).toBe(false); // not call
    expect(TransferHelpers.shouldSubmitFormCall(task2)).toBe(true); // ok
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

  test('getKickMember', async () => {
    const task = createTask({}, { taskChannelSid: 'channel1' });
    expect(TransferHelpers.getKickMember(task, 'some@identity')).toBe('member1');
    expect(TransferHelpers.getKickMember(task, 'non existing')).toBe('');
  });

  const task = createTask(
    { ignoreAgent: 'some@identity', transferMeta: { originalTask: 'task1' } },
    { taskSid: 'task2', taskChannelSid: 'channel1' },
  );

  test('closeChatOriginal', async () => {
    const expected = {
      closeSid: task.attributes.transferMeta.originalTask,
      keepSid: task.taskSid,
      kickMember: TransferHelpers.getKickMember(task, 'some@identity'),
      newStatus: transferStatuses.completed,
    };

    await TransferHelpers.closeChatOriginal(task);

    expect(transferChatResolve).toBeCalledWith(expected);
  });

  test('closeChatOriginal', async () => {
    const expected = {
      keepSid: task.attributes.transferMeta.originalTask,
      closeSid: task.taskSid,
      kickMember: '',
      newStatus: transferStatuses.rejected,
    };

    await TransferHelpers.closeChatSelf(task);

    expect(transferChatResolve).toBeCalledWith(expected);
  });

  test('setTransferCompleted', async () => {
    const before = { ...task };
    await TransferHelpers.setTransferCompleted(task);

    const { attributes, ...after } = before;
    const { transferMeta, ...afterAttributes } = attributes;
    const { transferStatus, ...afterTransferMeta } = transferMeta;

    expect(task.attributes.transferMeta.transferStatus).toBe(transferStatuses.completed);
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

    const coldExpected = {
      originalTask: 'task1',
      originalReservation: 'reservation1',
      originalCounselor: 'worker1',
      transferStatus: transferStatuses.completed,
      formDocument: 'some string',
      mode: transferModes.cold,
    };

    await TransferHelpers.setTransferMeta(coldTask, transferModes.cold, 'some string');
    expect(coldTask.attributes.transferMeta).toStrictEqual(coldExpected);

    const warmTask = createTask(
      {},
      { sid: 'reservation1', taskSid: 'task1', taskChannelSid: 'channel1', workerSid: 'worker1' },
    );

    const warmExpected = {
      originalTask: 'task1',
      originalReservation: 'reservation1',
      originalCounselor: 'worker1',
      transferStatus: transferStatuses.transferring,
      formDocument: 'some string',
      mode: transferModes.warm,
    };

    await TransferHelpers.setTransferMeta(warmTask, transferModes.warm, 'some string');
    expect(warmTask.attributes.transferMeta).toStrictEqual(warmExpected);
  });
});

import { TaskHelper } from '@twilio/flex-ui';

import * as TransferHelpers from '../../utils/transfer';
import { transferModes, transferStatuses, channelTypes } from '../../states/DomainConstants';
import { createTask } from '../helpers';

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

    expect(TransferHelpers.shouldSubmitFormChat(taskC)).toBe(false);
    expect(TransferHelpers.shouldSubmitFormChat(taskV)).toBe(false);
    expect(TransferHelpers.shouldSubmitFormChat(taskCc)).toBe(true);
    expect(TransferHelpers.shouldSubmitFormChat(taskCr)).toBe(true);
    expect(TransferHelpers.shouldSubmitFormChat(taskVc)).toBe(false);
    expect(TransferHelpers.shouldSubmitFormChat(taskVr)).toBe(false);
    expect(TransferHelpers.shouldSubmitFormChat(task2)).toBe(true);
  });
});

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
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import {
  acceptSpecificTask,
  withAvailableWorkerForTask,
} from '../../../src/task/assignSpecificTask';
import { TEST_ACCOUNT_SID, TEST_WORKSPACE_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
}));

describe('specific task assignment', () => {
  const workerSid = 'WK_TARGET';
  const taskSid = 'WT_EXPECTED';
  const info = { taskSid, reason: 'takeover' as const, originalTaskSid: 'WT_ORIGINAL' };
  let worker: any;
  let context: any;
  let listActivities: jest.Mock;
  let attributes: Record<string, unknown>;

  beforeEach(() => {
    attributes = { helpline: 'test', waitingForSpecificTask: false };
    worker = {
      sid: workerSid,
      activitySid: 'WA_OFFLINE',
      attributes: JSON.stringify(attributes),
    };
    context = {
      fetch: jest.fn().mockImplementation(async () => ({
        ...worker,
        attributes: JSON.stringify(attributes),
      })),
      update: jest.fn().mockImplementation(async update => {
        attributes = JSON.parse(update.attributes);
      }),
    };
    listActivities = jest.fn().mockResolvedValue([{ sid: 'WA_AVAILABLE' }]);
    (getTwilioClient as jest.Mock).mockResolvedValue({
      taskrouter: {
        v1: {
          workspaces: jest.fn().mockReturnValue({
            workers: jest.fn().mockReturnValue(context),
            activities: { list: listActivities },
          }),
        },
      },
    });
    (getWorkspaceSid as jest.Mock).mockResolvedValue(TEST_WORKSPACE_SID);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(['takeover', 'offline-contact'] as const)(
    'activates atomically for %s and restores only temporary attributes',
    async reason => {
      await withAvailableWorkerForTask(
        TEST_ACCOUNT_SID,
        worker,
        { ...info, reason },
        async () => {
          expect(attributes).toEqual({
            helpline: 'test',
            waitingForSpecificTask: true,
            waitingForSpecificTaskInfo: { ...info, reason },
            ...(reason === 'offline-contact' ? { waitingOfflineContact: true } : {}),
          });
          attributes.changedMeanwhile = 'preserved';
        },
      );
      expect(context.update.mock.calls[0][0].activitySid).toBe('WA_AVAILABLE');
      expect(context.update.mock.calls[1][0]).toMatchObject({
        activitySid: 'WA_OFFLINE',
        rejectPendingReservations: true,
      });
      expect(attributes).toEqual({
        helpline: 'test',
        waitingForSpecificTask: false,
        changedMeanwhile: 'preserved',
      });
    },
  );

  it('restores activity and attributes when assignment throws', async () => {
    await expect(
      withAvailableWorkerForTask(TEST_ACCOUNT_SID, worker, info, async () => {
        attributes.changedMeanwhile = true;
        throw new Error('accept failed');
      }),
    ).rejects.toThrow('accept failed');
    expect(context.update).toHaveBeenLastCalledWith({
      activitySid: 'WA_OFFLINE',
      attributes: JSON.stringify({
        helpline: 'test',
        waitingForSpecificTask: false,
        changedMeanwhile: true,
      }),
      rejectPendingReservations: true,
    });
  });

  it('attempts restoration even if activation fails', async () => {
    context.update.mockRejectedValueOnce(new Error('activation failed'));
    const assign = jest.fn();
    await expect(
      withAvailableWorkerForTask(TEST_ACCOUNT_SID, worker, info, assign),
    ).rejects.toThrow('activation failed');
    expect(assign).not.toHaveBeenCalled();
    expect(context.update).toHaveBeenCalledTimes(2);
  });

  it.each([true, false])(
    'restores activity even if cleanup refetch fails (assignment failed: %s)',
    async failAssignment => {
      context.fetch
        .mockResolvedValueOnce(worker)
        .mockRejectedValueOnce(new Error('fetch failed'));
      const assignment = withAvailableWorkerForTask(
        TEST_ACCOUNT_SID,
        worker,
        info,
        async () => {
          if (failAssignment) throw new Error('assignment failed');
          return 'assigned';
        },
      );
      if (failAssignment) await expect(assignment).rejects.toThrow('assignment failed');
      else await expect(assignment).resolves.toBe('assigned');
      expect(context.update).toHaveBeenLastCalledWith({
        activitySid: 'WA_OFFLINE',
        attributes: worker.attributes,
        rejectPendingReservations: true,
      });
    },
  );

  it('preserves the original error if both assignment and restoration fail', async () => {
    context.update
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('restore failed'));
    await expect(
      withAvailableWorkerForTask(TEST_ACCOUNT_SID, worker, info, async () => {
        throw new Error('assignment failed');
      }),
    ).rejects.toThrow('assignment failed');
    expect(context.update).toHaveBeenCalledTimes(2);
  });

  it.each(['waitingForSpecificTask', 'waitingOfflineContact'])(
    'rejects workers already marked %s without updating them',
    async flag => {
      attributes[flag] = true;
      const assign = jest.fn();
      await expect(
        withAvailableWorkerForTask(TEST_ACCOUNT_SID, worker, info, assign),
      ).rejects.toThrow('already waiting');
      expect(assign).not.toHaveBeenCalled();
      expect(context.update).not.toHaveBeenCalled();
    },
  );

  it('does not activate if no available activity is configured', async () => {
    listActivities.mockResolvedValue([]);
    await expect(
      withAvailableWorkerForTask(TEST_ACCOUNT_SID, worker, info, jest.fn()),
    ).rejects.toThrow('No available worker activity');
    expect(context.update).not.toHaveBeenCalled();
  });

  it('polls only the provided task and accepts only the target worker reservation', async () => {
    const accept = jest.fn().mockResolvedValue({ reservationStatus: 'accepted' });
    const otherAccept = jest.fn();
    const list = jest
      .fn()
      .mockResolvedValueOnce([{ workerSid: 'WK_OTHER', update: otherAccept }])
      .mockResolvedValue([{ workerSid, reservationStatus: 'pending', update: accept }]);
    const assignment = acceptSpecificTask(workerSid, {
      sid: taskSid,
      reservations: jest.fn().mockReturnValue({ list }) as any,
    });
    await assignment;
    expect(list).toHaveBeenCalledTimes(2);
    expect(accept).toHaveBeenCalledWith({ reservationStatus: 'accepted' });
    expect(otherAccept).not.toHaveBeenCalled();
  });

  it('bounds reservation polling', async () => {
    const list = jest.fn().mockResolvedValue([]);
    const assignment = acceptSpecificTask(workerSid, {
      sid: taskSid,
      reservations: jest.fn().mockReturnValue({ list }) as any,
    });
    const rejected = expect(assignment).rejects.toThrow(
      'reservation for task not created',
    );
    await rejected;
    expect(list).toHaveBeenCalledTimes(9);
  });

  it('fails when the reservation cannot be accepted', async () => {
    await expect(
      acceptSpecificTask(workerSid, {
        sid: taskSid,
        reservations: jest.fn().mockReturnValue({
          list: jest.fn().mockResolvedValue([
            {
              workerSid,
              reservationStatus: 'pending',
              update: jest.fn().mockResolvedValue({ reservationStatus: 'rejected' }),
            },
          ]),
        }) as any,
      }),
    ).rejects.toThrow('reservation for task not accepted');
  });

  it.each(['pending', 'accepted'])(
    'skips terminal history and handles a %s reservation',
    async reservationStatus => {
      const accept = jest.fn().mockResolvedValue({ reservationStatus: 'accepted' });
      const terminalAccept = jest.fn();
      const beforeAccept = jest.fn();
      await acceptSpecificTask(
        workerSid,
        {
          sid: taskSid,
          reservations: jest.fn().mockReturnValue({
            list: jest.fn().mockResolvedValue([
              { workerSid, reservationStatus: 'rejected', update: terminalAccept },
              { workerSid, reservationStatus: 'timeout', update: terminalAccept },
              {
                workerSid: 'WK_OTHER',
                reservationStatus: 'pending',
                update: terminalAccept,
              },
              { workerSid, reservationStatus, sid: 'WR_EXPECTED', update: accept },
            ]),
          }) as any,
        },
        beforeAccept,
      );
      expect(terminalAccept).not.toHaveBeenCalled();
      expect(beforeAccept).toHaveBeenCalledWith(
        'WR_EXPECTED',
        reservationStatus === 'accepted',
      );
      expect(accept).toHaveBeenCalledTimes(reservationStatus === 'accepted' ? 0 : 1);
    },
  );
});

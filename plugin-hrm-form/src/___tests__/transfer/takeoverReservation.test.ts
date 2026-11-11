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

import type { Reservation } from 'twilio-taskrouter';

import { acceptSelfInitiatedTakeover, TAKEOVER_SUCCESS_NOTIFICATION_ID } from '../../transfer/takeoverReservation';

const mockInvokeAction = jest.fn().mockResolvedValue(undefined);
const mockShowNotificationSingle = jest.fn();
const mockWorkerSid = 'WK-current-worker';

jest.mock('@twilio/flex-ui', () => ({
  Actions: { invokeAction: (...args) => mockInvokeAction(...args) },
  Manager: { getInstance: () => ({ workerClient: { sid: mockWorkerSid } }) },
  Notifications: { showNotificationSingle: (...args) => mockShowNotificationSingle(...args) },
}));

const reservation = (initiatedByWorker: string) =>
  (({
    sid: 'WR-reservation',
    task: { attributes: { initiatedByWorker } },
  } as unknown) as Reservation);

describe('acceptSelfInitiatedTakeover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts a reservation initiated by the current worker and shows success', async () => {
    await acceptSelfInitiatedTakeover(reservation(mockWorkerSid));

    expect(mockInvokeAction).toHaveBeenCalledWith('AcceptTask', { sid: 'WR-reservation' });
    expect(mockShowNotificationSingle).toHaveBeenCalledWith(TAKEOVER_SUCCESS_NOTIFICATION_ID);
  });

  it('does not accept reservations initiated by another worker', async () => {
    await acceptSelfInitiatedTakeover(reservation('WK-another-worker'));

    expect(mockInvokeAction).not.toHaveBeenCalled();
    expect(mockShowNotificationSingle).not.toHaveBeenCalled();
  });

  it('does not show success if accepting the reservation fails', async () => {
    mockInvokeAction.mockRejectedValueOnce(new Error('accept failed'));

    await expect(acceptSelfInitiatedTakeover(reservation(mockWorkerSid))).rejects.toThrow('accept failed');
    expect(mockShowNotificationSingle).not.toHaveBeenCalled();
  });
});

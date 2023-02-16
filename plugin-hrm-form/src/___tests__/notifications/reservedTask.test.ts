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

import { AudioPlayerManager } from '@twilio/flex-ui';

import '../mockGetConfig';
import { subscribeReservedTaskAlert } from '../../notifications/reservedTask';

const mockFlexManager = {
  workerClient: {
    on: jest.fn(),
  },
};

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: () => mockFlexManager,
  },
  AudioPlayerManager: {
    play: jest.fn(),
  },
}));

describe('Notification for a reserved task ', () => {
  let notifyReservedTask;

  beforeEach(() => {
    subscribeReservedTaskAlert();
    notifyReservedTask = mockFlexManager.workerClient.on.mock.calls[0][1];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('subscribeReservedTaskAlert subscribes to the "reservationCreated" event on the worker client', () => {
    expect(mockFlexManager.workerClient.on).toHaveBeenCalledWith('reservationCreated', notifyReservedTask);
  });

  test('audio notification should play when a reservation is pending state', () => {
    const mockReservation = {
      sid: 'reservation-sid',
      status: 'pending',
    };
    notifyReservedTask(mockReservation);
    expect(AudioPlayerManager.play).toHaveBeenCalledWith(
      {
        url: 'http://assets.fake.com/notifications/ringtone.mp3',
        repeatable: false,
      },
      expect.any(Function),
    );
  });

  test('audio notification should not play when reservation status changes to accepted', () => {
    const mockReservation = {
      sid: 'reservation-sid',
      status: 'accepted',
    };
    notifyReservedTask(mockReservation);

    const notificationUrl = 'http://assets.fake.com/notifications/ringtone.mp3';

    const playWhilePendingMock = jest.fn();
    playWhilePendingMock(mockReservation, notificationUrl);

    expect(AudioPlayerManager.play).not.toHaveBeenCalled();
  });
});

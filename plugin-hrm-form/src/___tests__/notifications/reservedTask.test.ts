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

import '../mockGetConfig';

const mockPlay = jest.fn();
const mockIsPlaying = jest.fn().mockReturnValue(false);
const mockIsTwilioTask = jest.fn().mockReturnValue(true);
const mockFlexManager = {
  workerClient: {
    on: jest.fn(),
    reservations: new Map(),
  },
};

jest.mock('../../types/types', () => ({
  isTwilioTask: (...args) => mockIsTwilioTask(...args),
}));

jest.mock('@twilio/flex-ui', () => ({
  Manager: {
    getInstance: () => mockFlexManager,
  },
  AudioPlayerManager: {
    play: (...args) => mockPlay(...args),
    isPlaying: (...args) => mockIsPlaying(...args),
  },
}));

describe('Notification for a reserved task ', () => {
  let subscribeReservedTaskAlert;
  let notifyReservedTask;

  beforeEach(async () => {
    jest.useFakeTimers();
    mockPlay.mockClear();
    mockIsPlaying.mockReset();
    mockIsPlaying.mockReturnValue(false);
    mockIsTwilioTask.mockReset();
    mockIsTwilioTask.mockReturnValue(true);
    mockFlexManager.workerClient = {
      on: jest.fn(),
      reservations: new Map(),
    };

    jest.resetModules();
    ({ subscribeReservedTaskAlert } = await import('../../notifications/reservedTask'));

    subscribeReservedTaskAlert();
    notifyReservedTask = mockFlexManager.workerClient.on.mock.calls[0][1];
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('subscribeReservedTaskAlert subscribes to the "reservationCreated" event on the worker client', () => {
    expect(mockFlexManager.workerClient.on).toHaveBeenCalledWith('reservationCreated', notifyReservedTask);
  });

  test('audio notification should play immediately for a Twilio task reservation', () => {
    notifyReservedTask({
      task: {
        taskSid: 'twilio-task-sid',
        attributes: {
          isContactlessTask: false,
        },
      },
    });

    expect(mockPlay).toHaveBeenCalledWith(
      {
        url: 'http://assets.fake.com/notifications/ringtone.mp3',
        repeatable: false,
      },
      expect.any(Function),
    );
  });

  test('audio notification should not play when something else is already playing', () => {
    mockIsPlaying.mockReturnValue(true);

    notifyReservedTask({
      task: {
        taskSid: 'twilio-task-sid',
        attributes: {
          isContactlessTask: false,
        },
      },
    });

    expect(mockIsPlaying).toHaveBeenCalledTimes(1);
    expect(mockPlay).not.toHaveBeenCalled();
  });

  test('audio notification should repeat while there is one pending reservation for the worker', () => {
    mockFlexManager.workerClient.reservations = new Map([
      [
        'reservation-sid',
        {
          sid: 'reservation-sid',
          status: 'pending',
        },
      ],
    ]);

    jest.advanceTimersByTime(3000);

    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  test('audio notification should play once while there are multiple pending reservations for the worker', () => {
    mockFlexManager.workerClient.reservations = new Map([
      [
        'reservation-one',
        {
          sid: 'reservation-one',
          status: 'pending',
        },
      ],
      [
        'reservation-two',
        {
          sid: 'reservation-two',
          status: 'pending',
        },
      ],
    ]);

    jest.advanceTimersByTime(3000);

    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  test('audio notification should not play or throw when worker session expires', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFlexManager.workerClient = null;

    jest.advanceTimersByTime(3000);

    expect(mockPlay).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('reservation created should not trigger an extra notification while repeating notifications are already playing', () => {
    mockFlexManager.workerClient.reservations = new Map([
      [
        'reservation-sid',
        {
          sid: 'reservation-sid',
          status: 'pending',
        },
      ],
    ]);

    jest.advanceTimersByTime(3000);
    mockPlay.mockClear();

    notifyReservedTask({
      task: {
        taskSid: 'twilio-task-sid',
        attributes: {
          isContactlessTask: false,
        },
      },
    });

    expect(mockPlay).not.toHaveBeenCalled();
  });

  test('reservation created should play again after pending reservations are cleared', () => {
    mockFlexManager.workerClient.reservations = new Map([
      [
        'reservation-sid',
        {
          sid: 'reservation-sid',
          status: 'pending',
        },
      ],
    ]);

    jest.advanceTimersByTime(3000);
    mockFlexManager.workerClient.reservations = new Map();
    jest.advanceTimersByTime(3000);
    mockPlay.mockClear();

    notifyReservedTask({
      task: {
        taskSid: 'twilio-task-sid',
        attributes: {
          isContactlessTask: false,
        },
      },
    });

    expect(mockPlay).toHaveBeenCalledTimes(1);
  });
});

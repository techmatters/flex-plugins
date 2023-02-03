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

// Audio alerts will play only when the author of the message is not the counselor, and the document is visible.

import { AudioPlayerManager } from '@twilio/flex-ui';

import '../mockGetConfig';
import { notifyNewMessage, subscribeReservedTaskAlert, notifyReservedTask } from '../../utils/audioNotifications';

const mockFlexManager = {
  user: {
    identity: 'imacounsellor@aselo.org',
  },
  conversationsClient: {
    once: jest.fn(),
  },
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
    stop: jest.fn(),
  },
}));

describe('notifyNewMessage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('audio notification should play when author of a message is the customer (or Bot or System) and the document is visible', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    const messageFrom = { author: 'IDforAChildOrBotOrSystem' };
    notifyNewMessage(messageFrom);
    expect(AudioPlayerManager.play).toHaveBeenCalled();
  });

  test('audio notification should not play when author of a message is the customer (or Bot or System) but the document is not visible', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    const messageFromChild = { author: 'IDforAChildOrBotOrSystem' };
    notifyNewMessage(messageFromChild);
    expect(AudioPlayerManager.play).not.toHaveBeenCalled();
  });

  test('audio notification should not play when author of a message is the counselor even when document is visible', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    const messageFromCounsellor = { author: 'imacounsellor@aselo.org' };
    notifyNewMessage(messageFromCounsellor);
    expect(AudioPlayerManager.play).not.toHaveBeenCalled();
  });
});

describe('notifyReservedTask', () => {
  jest.useFakeTimers();

  const media = {};
  let reservation;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    reservation = {
      on: jest.fn(),
    };
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
    });
  });

  test('audio notification should play when a reservation is created with an online agent', () => {
    subscribeReservedTaskAlert();
    expect(mockFlexManager.workerClient.on).toHaveBeenCalledWith('reservationCreated', notifyReservedTask);

    notifyReservedTask(reservation);
    expect(AudioPlayerManager.play).toHaveBeenCalledWith(
      {
        url: 'http://assets.fake.com/notifications/ringtone.mp3',
        repeatable: true,
      },
      expect.any(Function),
    );
    jest.advanceTimersByTime(14000);
    expect(AudioPlayerManager.stop).not.toHaveBeenCalled();
  });
  test('audio notification should not play when document is not visible but task is reserved', () => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    subscribeReservedTaskAlert();
    expect(mockFlexManager.workerClient.on).toHaveBeenCalledWith('reservationCreated', notifyReservedTask);

    notifyReservedTask(reservation);
    expect(AudioPlayerManager.play).not.toHaveBeenCalledWith(
      {
        url: 'http://assets.fake.com/notifications/ringtone.mp3',
        repeatable: true,
      },
      expect.any(Function),
    );
  });

  test('audio notification should stop when the reservation changes its state to one of the specified statuses', () => {
    subscribeReservedTaskAlert();
    expect(mockFlexManager.workerClient.on).toHaveBeenCalledWith('reservationCreated', notifyReservedTask);

    notifyReservedTask(reservation);
    expect(AudioPlayerManager.play).toHaveBeenCalledWith(
      {
        url: 'http://assets.fake.com/notifications/ringtone.mp3',
        repeatable: true,
      },
      expect.any(Function),
    );
    const taskStatuses = ['accepted', 'canceled', 'rejected', 'rescinded', 'timeout'];
    taskStatuses.forEach(status => {
      expect(reservation.on).toHaveBeenCalledWith(status, AudioPlayerManager.stop);
    });
  });

  test('audio notification should stop when the timeout ends(after 15000ms)', () => {
    subscribeReservedTaskAlert();
    expect(mockFlexManager.workerClient.on).toHaveBeenCalledWith('reservationCreated', notifyReservedTask);

    notifyReservedTask(reservation);

    jest.advanceTimersByTime(15000);
    expect(AudioPlayerManager.stop).toHaveBeenCalled();
  });
});

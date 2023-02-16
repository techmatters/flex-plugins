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

import { StateHelper, AudioPlayerManager } from '@twilio/flex-ui';

import '../mockGetConfig';
import {
  subscribeAlertOnConversationJoined,
  subscribeNewMessageAlertOnPluginInit,
} from '../../notifications/newMessage';

const mockConversationState = {
  isLoadingConversation: false, // TODO try testing true with mock timers, it should call StateHelper N times
  source: { on: jest.fn() },
};

const mockMessageInstance = { author: 'imacounsellor@test.org' };

const mockFlexManager = {
  conversationsClient: {
    once: jest.fn(),
    user: {
      identity: 'imacounsellor@tes.org',
    },
  },
  store: {
    getState: jest.fn(() => ({
      flex: {
        worker: {
          tasks: [{ sid: 'WTtask1' }, { sid: 'WTtask2' }],
        },
      },
    })),
  },
};

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    // getInstance: jest.fn().mockReturnValue(mockFlexManager),
    getInstance: () => mockFlexManager,
  },
  AudioPlayerManager: {
    play: jest.fn().mockReturnValue({}),
  },
  StateHelper: {
    // getConversationStateForTask: jest.fn().mockReturnValue(mockConversationState),
    getConversationStateForTask: jest.fn(() => {
      return mockConversationState;
    }),
  },
}));

describe('Notification for a new message ', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribeAlertOnConversationJoined', () => {
    let task;
    let trySubscribeAudioAlerts;

    beforeEach(() => {
      task = { sid: 'WTtask' };
      subscribeAlertOnConversationJoined(task);
      trySubscribeAudioAlerts = mockFlexManager.conversationsClient.once.mock.calls[0][1];
    });

    test('should call the trySubscribeAudioAlerts when subscribeAlertOnConversationJoined(task) is called', () => {
      trySubscribeAudioAlerts(task, 0, 0);
      jest.advanceTimersByTime(10);

      expect(StateHelper.getConversationStateForTask).toHaveBeenCalledTimes(1);
      expect(StateHelper.getConversationStateForTask).toHaveBeenCalledWith(task);
      expect(mockConversationState.source.on).toHaveBeenCalledTimes(1);
      expect(mockConversationState.source.on).toHaveBeenCalledWith('messageAdded', expect.any(Function));
    });

    test('should play the audio alert when the document is hidden', () => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });

      trySubscribeAudioAlerts(task, 0, 0);
      jest.advanceTimersByTime(10);

      expect(StateHelper.getConversationStateForTask).toHaveBeenCalledWith(task);
      expect(mockConversationState.source.on).toHaveBeenCalledWith('messageAdded', expect.any(Function));

      const notifyNewMessage = mockConversationState.source.on.mock.calls[0][1];
      notifyNewMessage(mockMessageInstance);

      expect(AudioPlayerManager.play).toHaveBeenCalledWith(
        {
          url: 'http://assets.fake.com/notifications/bell.mp3',
          repeatable: false,
        },
        expect.any(Function),
      );
    });

    test('should not play the audio alert when the document is visible', () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });

      trySubscribeAudioAlerts(task, 0, 0);
      jest.advanceTimersByTime(10);

      expect(StateHelper.getConversationStateForTask).toHaveBeenCalledWith(task);
      expect(mockConversationState.source.on).toHaveBeenCalledWith('messageAdded', expect.any(Function));

      const notifyNewMessage = mockConversationState.source.on.mock.calls[0][1];
      notifyNewMessage(mockMessageInstance);

      expect(AudioPlayerManager.play).not.toHaveBeenCalled();
    });
  });
});

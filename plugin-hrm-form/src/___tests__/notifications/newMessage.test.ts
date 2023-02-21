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
  isLoadingConversation: false,
  source: { on: jest.fn() },
};

const mockFlexManager = {
  conversationsClient: {
    once: jest.fn(),
    user: {
      identity: 'imacounsellor@testing.org',
    },
  },
  store: {
    getState: jest.fn(() => ({
      flex: {
        worker: {
          tasks: [{}],
        },
      },
    })),
  },
};

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: () => mockFlexManager,
  },
  AudioPlayerManager: {
    play: jest.fn().mockReturnValue({}),
  },
  StateHelper: {
    getConversationStateForTask: jest.fn(() => mockConversationState),
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
      const mockMessageInstance = { author: 'imaclient@test.org' };

      notifyNewMessage(mockMessageInstance);

      expect(AudioPlayerManager.play).toHaveBeenCalledWith(
        {
          url: 'http://assets.fake.com/notifications/bell.mp3',
          repeatable: false,
        },
        expect.any(Function),
      );
    });

    test('should not play the audio alert when the document is hidden and the author of the message is the counsellor', () => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });

      trySubscribeAudioAlerts(task, 0, 0);
      jest.advanceTimersByTime(10);

      expect(StateHelper.getConversationStateForTask).toHaveBeenCalledWith(task);
      expect(mockConversationState.source.on).toHaveBeenCalledWith('messageAdded', expect.any(Function));

      const notifyNewMessage = mockConversationState.source.on.mock.calls[0][1];
      const mockMessageInstance = { author: 'imacounsellor@testing.org' };

      notifyNewMessage(mockMessageInstance);

      expect(AudioPlayerManager.play).not.toHaveBeenCalled();
    });

    test('should not play the audio alert when the document is visible', () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });

      trySubscribeAudioAlerts(task, 0, 0);
      jest.advanceTimersByTime(10);

      expect(StateHelper.getConversationStateForTask).toHaveBeenCalledWith(task);
      expect(mockConversationState.source.on).toHaveBeenCalledWith('messageAdded', expect.any(Function));

      const notifyNewMessage = mockConversationState.source.on.mock.calls[0][1];
      const mockMessageInstance = { author: 'imaclient@test.org' };

      notifyNewMessage(mockMessageInstance);

      expect(AudioPlayerManager.play).not.toHaveBeenCalled();
    });

    test('should not subscribe to messageAdded event when task is still loading', () => {
      mockConversationState.isLoadingConversation = true;

      jest.runAllTimers();

      expect(mockConversationState.source.on).not.toHaveBeenCalled();
    });
  });

  describe('subscribeNewMessageAlertOnPluginInit', () => {
    beforeEach(() => {
      mockConversationState.isLoadingConversation = false;
      jest.useFakeTimers();
      const tasks = [{ sid: 'WTtask1' }, { sid: 'WTtask2' }];
      mockFlexManager.store.getState.mockReturnValueOnce({
        flex: {
          worker: {
            tasks,
          },
        },
      });
      subscribeNewMessageAlertOnPluginInit();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should subscribe to messageAdded event for all task when plugin is initialized', () => {
      const tasks = [{ sid: 'WTtask1' }, { sid: 'WTtask2' }];

      jest.runAllTimers();

      expect(StateHelper.getConversationStateForTask).toHaveBeenCalledTimes(2);
      tasks.forEach(task => expect(StateHelper.getConversationStateForTask).toHaveBeenCalledWith(task));

      expect(mockConversationState.source.on).toHaveBeenCalledWith('messageAdded', expect.any(Function));
    });
  });
});

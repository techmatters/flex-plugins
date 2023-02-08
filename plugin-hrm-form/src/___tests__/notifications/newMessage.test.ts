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

import { AudioPlayerManager, StateHelper } from '@twilio/flex-ui';

import '../mockGetConfig';
import {
  subscribeAlertOnConversationJoined,
  subscribeNewMessageAlertOnPluginInit,
} from '../../notifications/newMessage';

const mockFlexManager = {
  user: {
    identity: 'imacounsellor@aselo.org',
  },
  conversationsClient: {
    once: jest.fn(),
  },
  StateHelper: {
    getConversationStateForTask: jest.fn(),
  },
  /*
   * store.getState().flex.worker:{
   * }
   */
};

jest.mock('@twilio/flex-ui', () => ({
  ...(jest.requireActual('@twilio/flex-ui') as any),
  Manager: {
    getInstance: () => mockFlexManager,
  },
  AudioPlayerManager: {
    play: jest.fn().mockReturnValue({}),
  },
}));

describe('Notification for a new messages', () => {
  describe('subscribeAlertOnConversationJoined', () => {
    let notifyNewMessageMock;
    let task;
    // const convoState = StateHelper.getConversationStateForTask(task);
    beforeEach(() => {
      task = {};
      subscribeAlertOnConversationJoined(task);
      notifyNewMessageMock = mockFlexManager.conversationsClient.once.mock.calls[0][1];
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('subscribes to the "conversationJoined" event on the conversations client', () => {
      expect(mockFlexManager.conversationsClient.once).toHaveBeenCalledWith('conversationJoined', notifyNewMessageMock);
    });

    /*
     * describe('subscribeNewMessageAlertOnPluginInit', () => {
     *   beforeEach(() => {
     *     subscribeNewMessageAlertOnPluginInit();
     *     notifyNewMessageMock = mockFlexManager.store.getState().flex.worker.tasks = {}
     *   });
     *   test('calls Manager.getInstance().conversationsClient.once with conversationJoined event', () => {
     *     const task = {};
     *     subscribeAlertOnConversationJoined(task);
     *     expect(Manager.getInstance().conversationsClient.once).toHaveBeenCalledWith(
     *       'conversationJoined',
     *       expect.any(Function),
     *     );
     *   });
     * });
     */
  });
});

/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { Message } from '@twilio/conversations';

import { Conversation } from '../../../../__mocks__/@twilio/conversations/conversation';
import { initMessagesListener } from '../messagesListener';
import { ACTION_ADD_MESSAGE, ACTION_REMOVE_MESSAGE, ACTION_UPDATE_MESSAGE } from '../../actionTypes';
import * as newMessageNotification from '../../../../utils/newMessageNotification';
import { AppState } from '../../../store';

jest.mock('../../../../utils/newMessageNotification', () => ({
  playNotificationSound: jest.fn(),
  showBrowserNotification: jest.fn(),
  getAssetsBucketUrl: jest.fn().mockReturnValue('https://assets-test.tl.techmatters.org/plugins/hrm'),
}));

const buildConversation = () =>
  new Conversation(
    {
      channel: 'chat',
      entityName: '',
      uniqueName: '',
      attributes: {},
      lastConsumedMessageIndex: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    },
    'sid',
    {
      self: '',
      messages: '',
      participants: '',
    },
    {} as any,
    {} as any,
  );

const LOCAL_IDENTITY = 'local-user';
const COUNSELLOR_IDENTITY = 'counsellor-user';

const buildState = (overrides: Partial<AppState['session']> = {}): AppState =>
  ({
    session: {
      expanded: false,
      ...overrides,
    },
    config: {
      environment: 'test',
      translations: { 'xx-XX': { NewMessageNotification: 'Test notification' } },
      defaultLocale: 'xx-XX',
    },
  } as unknown as AppState);

describe('initMessagesListener', () => {
  let conversation: Conversation;

  beforeEach(() => {
    conversation = buildConversation();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  afterEach(() => {
    conversation.removeAllListeners();
    jest.clearAllMocks();
  });

  it('adds a listener for the "messageAdded" event', () => {
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(buildState({ expanded: true }));

    initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
    const message = { author: COUNSELLOR_IDENTITY } as unknown as Message;
    conversation.emit('messageAdded', message);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_ADD_MESSAGE,
      payload: expect.objectContaining({ message }),
    });
  });

  it('adds a listener for the "messageUpdated" event', () => {
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(buildState({ expanded: true }));

    initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
    const message = {} as Message;
    conversation.emit('messageUpdated', {
      message,
      updateReasons: ['author'],
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_UPDATE_MESSAGE,
      payload: expect.objectContaining({ message }),
    });
  });

  it('adds a listener for the "messageRemoved" event subset', () => {
    const dispatch = jest.fn();
    const getState = jest.fn().mockReturnValue(buildState({ expanded: true }));

    initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
    const message = {} as Message;
    conversation.emit('messageRemoved', message);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_REMOVE_MESSAGE,
      payload: expect.objectContaining({ message }),
    });
  });

  describe('new message notifications', () => {
    it('plays sound and shows browser notification when message is from counsellor and widget is collapsed', () => {
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(buildState({ expanded: false }));

      initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
      const message = { author: COUNSELLOR_IDENTITY } as unknown as Message;
      conversation.emit('messageAdded', message);

      expect(newMessageNotification.playNotificationSound).toHaveBeenCalledWith(
        'https://assets-test.tl.techmatters.org/plugins/hrm',
      );
      expect(newMessageNotification.showBrowserNotification).toHaveBeenCalledWith('Test notification');
    });

    it('plays sound and shows browser notification when message is from counsellor and document is hidden', () => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(buildState({ expanded: true }));

      initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
      const message = { author: COUNSELLOR_IDENTITY } as unknown as Message;
      conversation.emit('messageAdded', message);

      expect(newMessageNotification.playNotificationSound).toHaveBeenCalled();
      expect(newMessageNotification.showBrowserNotification).toHaveBeenCalled();
    });

    it('does not play notification when message is from local user', () => {
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(buildState({ expanded: false }));

      initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
      const message = { author: LOCAL_IDENTITY } as unknown as Message;
      conversation.emit('messageAdded', message);

      expect(newMessageNotification.playNotificationSound).not.toHaveBeenCalled();
      expect(newMessageNotification.showBrowserNotification).not.toHaveBeenCalled();
    });

    it('does not play notification when message is from counsellor but widget is expanded and document is visible', () => {
      const dispatch = jest.fn();
      const getState = jest.fn().mockReturnValue(buildState({ expanded: true }));

      initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
      const message = { author: COUNSELLOR_IDENTITY } as unknown as Message;
      conversation.emit('messageAdded', message);

      expect(newMessageNotification.playNotificationSound).not.toHaveBeenCalled();
      expect(newMessageNotification.showBrowserNotification).not.toHaveBeenCalled();
    });

    it('uses fallback notification message when translation key is missing', () => {
      const dispatch = jest.fn();
      const stateWithoutTranslation = {
        session: { expanded: false },
        config: {
          environment: 'test',
          translations: { 'xx-XX': {} },
          defaultLocale: 'xx-XX',
        },
      } as unknown as AppState;
      const getState = jest.fn().mockReturnValue(stateWithoutTranslation);

      initMessagesListener(conversation, dispatch, LOCAL_IDENTITY, getState);
      const message = { author: COUNSELLOR_IDENTITY } as unknown as Message;
      conversation.emit('messageAdded', message);

      expect(newMessageNotification.showBrowserNotification).toHaveBeenCalledWith('New message from counselor');
    });
  });
});

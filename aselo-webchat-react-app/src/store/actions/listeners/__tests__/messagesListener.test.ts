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

describe('initMessagesListener', () => {
  let conversation: Conversation;

  beforeEach(() => {
    conversation = new Conversation(
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
  });

  afterEach(() => {
    conversation.removeAllListeners();
  });

  it('adds a listener for the "messageAdded" event', () => {
    const dispatch = jest.fn();

    initMessagesListener(conversation, dispatch);
    const message = {} as Message;
    conversation.emit('messageAdded', message);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_ADD_MESSAGE,
      payload: expect.objectContaining({ message }),
    });
  });

  it('adds a listener for the "messageUpdated" event', () => {
    const dispatch = jest.fn();

    initMessagesListener(conversation, dispatch);
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

    initMessagesListener(conversation, dispatch);
    const message = {} as Message;
    conversation.emit('messageRemoved', message);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_REMOVE_MESSAGE,
      payload: expect.objectContaining({ message }),
    });
  });
});

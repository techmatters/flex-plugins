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

import { Conversation } from '../../../../__mocks__/@twilio/conversations/conversation';
import { initConversationListener } from '../conversationListener';

describe('initConversationListener', () => {
  it('adds a listener for the "update" event subset', () => {
    const dispatch = jest.fn();
    const conversation = new Conversation(
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

    initConversationListener(conversation, dispatch);
    conversation.emit('updated', {
      conversation,
      updateReasons: ['state'],
    });
    expect(dispatch).toHaveBeenCalledTimes(1);

    // dispatch should be called if updatedReasons: ["state"] only
    conversation.emit('updated', {
      conversation,
      updateReasons: ['status'],
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

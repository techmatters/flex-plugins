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

import { Participant, ParticipantUpdateReason, User } from '@twilio/conversations';
import { waitFor } from '@testing-library/react';

import { Conversation } from '../../../../__mocks__/@twilio/conversations/conversation';
import { initParticipantsListener } from '../participantsListener';
import {
  ACTION_ADD_PARTICIPANT,
  ACTION_REMOVE_PARTICIPANT,
  ACTION_UPDATE_PARTICIPANT,
  ACTION_UPDATE_PARTICIPANT_NAME,
} from '../../actionTypes';

describe('initParticipantsListener', () => {
  let conversation: Conversation;
  let participant: Participant;
  const user: User = {} as User;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    participant = {
      async getUser() {
        return Promise.resolve(user);
      },
    } as Participant;
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

  it('adds a listener for the "participantJoined" event', async () => {
    const dispatch = jest.fn();

    initParticipantsListener(conversation, dispatch);
    const getUserSpy = jest.spyOn(participant, 'getUser');
    conversation.emit('participantJoined', participant);
    await waitFor(() => {
      expect(getUserSpy).toHaveBeenCalled();
    });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_ADD_PARTICIPANT,
      payload: expect.objectContaining({ participant, user }),
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_UPDATE_PARTICIPANT_NAME,
      payload: expect.objectContaining({
        participantSid: participant.sid,
        name: user.friendlyName,
      }),
    });
  });

  it('adds a listener for the "participantLeft" event', () => {
    const dispatch = jest.fn();

    initParticipantsListener(conversation, dispatch);
    conversation.emit('participantLeft', participant);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_REMOVE_PARTICIPANT,
      payload: expect.objectContaining({ participant }),
    });
  });

  it('adds a listener for the "participantUpdated" event subset', () => {
    const dispatch = jest.fn();

    initParticipantsListener(conversation, dispatch);
    conversation.emit('participantUpdated', {
      participant,
      updateReasons: ['dateUpdated'] as ParticipantUpdateReason[],
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_UPDATE_PARTICIPANT,
      payload: expect.objectContaining({ participant }),
    });
  });

  it('adds a listener for the "typingStarted" event subset', () => {
    const dispatch = jest.fn();

    initParticipantsListener(conversation, dispatch);
    conversation.emit('typingStarted', participant);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_UPDATE_PARTICIPANT,
      payload: expect.objectContaining({ participant }),
    });
  });

  it('adds a listener for the "typingEnded" event subset', () => {
    const dispatch = jest.fn();

    initParticipantsListener(conversation, dispatch);
    conversation.emit('typingEnded', participant);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: ACTION_UPDATE_PARTICIPANT,
      payload: expect.objectContaining({ participant }),
    });
  });
});

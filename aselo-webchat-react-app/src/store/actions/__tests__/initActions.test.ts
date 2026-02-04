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

import { Client, Message, Conversation } from '@twilio/conversations';
import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import thunk from 'redux-thunk';

import { MockedPaginator } from '../../../test-utils';
import { initConfigThunk, initSession } from '../initActions';
import { initClientListeners } from '../listeners/clientListener';
import { initConversationListener } from '../listeners/conversationListener';
import { EngagementPhase } from '../../definitions';
import {
  ACTION_ADD_NOTIFICATION,
  ACTION_CHANGE_ENGAGEMENT_PHASE,
  ACTION_LOAD_CONFIG_FAILURE,
  ACTION_LOAD_CONFIG_REQUEST,
  ACTION_LOAD_CONFIG_SUCCESS,
  ACTION_START_SESSION,
} from '../actionTypes';
import { initMessagesListener } from '../listeners/messagesListener';
import { initParticipantsListener } from '../listeners/participantsListener';
import { SessionReducer } from '../../session.reducer';
import { notifications } from '../../../notifications';
import WebChatLogger from '../../../logger';
import * as configService from '../../../services/configService';

jest.mock('@twilio/conversations', () => {
  return {
    Client: jest.fn(),
  };
});
jest.mock('../listeners/clientListener', () => ({
  initClientListeners: jest.fn(),
}));
jest.mock('../listeners/conversationListener', () => ({
  initConversationListener: jest.fn(),
}));
jest.mock('../listeners/messagesListener', () => ({
  initMessagesListener: jest.fn(),
}));
jest.mock('../listeners/participantsListener', () => ({
  initParticipantsListener: jest.fn(),
}));
jest.mock('../../../logger');
jest.mock('../../../services/configService');

const createSessionStore = () =>
  createStore(
    combineReducers({
      session: SessionReducer,
    }),
    compose(applyMiddleware(thunk)),
  );

describe('Actions', () => {
  const token = 'token';
  const conversationSid = 'sid';
  const messages = [{ sid: 'sid1' }, { sid: 'sid2' }] as Message[];
  const users = [{ idenity: 'id' }];
  const participants = [{ getUser: () => users[0] }];
  const conversation = {
    state: { current: 'active' },
    getParticipants: () => participants,
    getMessages: () => new MockedPaginator(messages),
  } as unknown as Conversation;
  const conversationsClient = {
    getConversationBySid: () => conversation,
    onWithReplay: (_event, handler) => {
      handler('connected');
    },
  } as unknown as Client;

  let mockStore: any;

  beforeAll(() => {
    Object.defineProperty(window, 'Twilio', {
      value: {
        getLogger(className: string) {
          return new WebChatLogger(className);
        },
      },
    });
  });

  beforeEach(() => {
    mockStore = createSessionStore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initSession', () => {
    it('dispatches start session action with fetched state as payload', async () => {
      (Client as any).mockReturnValueOnce(conversationsClient);
      const mockDispatch = jest.fn();

      await initSession({ token, conversationSid })(mockDispatch);

      expect(mockDispatch).toHaveBeenCalled();
      const dispatchArgs = mockDispatch.mock.calls[0][0];
      expect(dispatchArgs).toMatchObject({
        type: ACTION_START_SESSION,
        payload: {
          token,
          conversationSid,
          conversationsClient,
          conversation,
          users,
          participants,
          messages,
          conversationState: conversation.state?.current,
          currentPhase: EngagementPhase.MessagingCanvas,
        },
      });
    });

    it('initializes listeners', async () => {
      (Client as any).mockReturnValueOnce(conversationsClient);

      await mockStore.dispatch(initSession({ token, conversationSid }));

      expect(initClientListeners).toHaveBeenCalledWith(conversationsClient, expect.any(Function));
      expect(initConversationListener).toHaveBeenCalledWith(conversation, expect.any(Function));
      expect(initMessagesListener).toHaveBeenCalledWith(conversation, expect.any(Function));
      expect(initParticipantsListener).toHaveBeenCalledWith(conversation, expect.any(Function));
    });

    it('revert back to preEngagementForm with an error notification if it fails to initialize session', async () => {
      (Client as any).mockReturnValueOnce({ onWithReplay: conversationsClient.onWithReplay });
      const innerDispatchSpy = jest.fn();
      jest.spyOn(mockStore, 'dispatch').mockImplementation((callback: any) => callback(innerDispatchSpy));
      await mockStore.dispatch(initSession({ token, conversationSid }));

      expect(innerDispatchSpy).toHaveBeenCalledWith({
        payload: {
          notification: notifications.failedToInitSessionNotification("Couldn't load conversation"),
        },
        type: ACTION_ADD_NOTIFICATION,
      });
      expect(innerDispatchSpy).toHaveBeenCalledWith({
        payload: { currentPhase: 'PreEngagementForm' },
        type: ACTION_CHANGE_ENGAGEMENT_PHASE,
      });
      jest.spyOn(mockStore, 'dispatch').mockRestore();
    });
  });

  describe('initConfigThunk', () => {
    it('success case calls ACTION_LOAD_CONFIG_SUCCESS', async () => {
      jest.spyOn(configService, 'getDefinitionVersion').mockResolvedValueOnce({} as any);
      const thunk = initConfigThunk({} as any);

      const dispatch = jest.fn();
      const getState = jest.fn();

      await thunk(dispatch, getState, {});
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_LOAD_CONFIG_REQUEST,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_LOAD_CONFIG_SUCCESS,
        payload: {},
      });
    });

    it('failure case calls ACTION_LOAD_CONFIG_FAILURE', async () => {
      const err = new Error('kaboom!');
      jest.spyOn(configService, 'getDefinitionVersion').mockImplementationOnce(() => {
        throw err;
      });
      const thunk = initConfigThunk({} as any);

      const dispatch = jest.fn();
      const getState = jest.fn();

      await thunk(dispatch, getState, {});
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_LOAD_CONFIG_REQUEST,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_LOAD_CONFIG_FAILURE,
        payload: err,
      });
    });
  });
});

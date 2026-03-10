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
import * as initActions from '../initActions';
import { initClientListeners } from '../listeners/clientListener';
import { initConversationListener } from '../listeners/conversationListener';
import { EngagementPhase } from '../../definitions';
import {
  ACTION_ADD_NOTIFICATION,
  ACTION_CHANGE_ENGAGEMENT_PHASE,
  ACTION_CHANGE_EXPANDED_STATUS,
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
import { sessionDataHandler } from '../../../sessionDataHandler';

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
jest.mock('../../../sessionDataHandler', () => ({
  sessionDataHandler: {
    setRegion: jest.fn(),
    setDeploymentKey: jest.fn(),
    getRegion: jest.fn(),
  },
}));

const { initSession, initConfigThunk } = initActions;

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
  let mockLogger: WebChatLogger;

  beforeAll(() => {
    Object.defineProperty(window, 'Twilio', {
      value: {
        getLogger(_className: string) {
          return mockLogger;
        },
      },
    });
  });

  beforeEach(() => {
    mockLogger = new WebChatLogger('test');
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
    const runConfigThunk = async (configData: object, overrides = {}) => {
      jest.spyOn(initActions, 'getHelplineConfig').mockResolvedValueOnce({
        status: 'ok',
        data: configData,
      });
      jest.spyOn(configService, 'getDefinitionVersion').mockResolvedValueOnce({ preEngagementForm: {} } as any);
      const thunk = initConfigThunk({ configUrl: 'some-url', overrides });
      const dispatch = jest.fn();
      const getState = jest.fn();
      await thunk(dispatch, getState, {});
      return dispatch;
    };

    it('success case calls ACTION_LOAD_CONFIG_SUCCESS', async () => {
      const dispatch = await runConfigThunk({ deploymentKey: 'deploymentKey' });
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_LOAD_CONFIG_REQUEST,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_LOAD_CONFIG_SUCCESS,
        payload: {
          currentLocale: undefined,
          deploymentKey: 'deploymentKey',
          preEngagementFormDefinition: {},
        },
      });
    });

    it('failure case calls ACTION_LOAD_CONFIG_FAILURE', async () => {
      jest.spyOn(initActions, 'getHelplineConfig').mockResolvedValueOnce({
        status: 'ok',
        data: { deploymentKey: 'deploymentKey' },
      });
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

    it('sets region correctly', async () => {
      const region = 'Foo';
      await runConfigThunk({ deploymentKey: 'CV000000', region });
      expect(sessionDataHandler.setRegion).toHaveBeenCalledWith(region);
    });

    it('sets deployment key correctly', async () => {
      const deploymentKey = 'CV000000';
      await runConfigThunk({ deploymentKey });
      expect(sessionDataHandler.setDeploymentKey).toHaveBeenCalledWith(deploymentKey);
    });

    it('gives error when deploymentKey is missing', async () => {
      jest.spyOn(initActions, 'getHelplineConfig').mockResolvedValueOnce({
        status: 'ok',
        data: {},
      });
      const errorLoggerSpy = jest.spyOn(mockLogger, 'error');

      const thunk = initConfigThunk({ configUrl: 'some-url', overrides: {} });
      const dispatch = jest.fn();
      const getState = jest.fn();

      await thunk(dispatch, getState, {});

      expect(errorLoggerSpy).toHaveBeenCalledTimes(1);
      expect(errorLoggerSpy).toHaveBeenCalledWith('deploymentKey must exist to connect to Webchat servers');
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: ACTION_LOAD_CONFIG_FAILURE }));
    });

    it('triggers expanded true if alwaysOpen is set', async () => {
      const dispatch = await runConfigThunk({ deploymentKey: 'CV000000', alwaysOpen: true });
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_CHANGE_EXPANDED_STATUS,
        payload: { expanded: true },
      });
    });

    it('triggers expanded false if alwaysOpen is not set', async () => {
      const dispatch = await runConfigThunk({ deploymentKey: 'CV000000', alwaysOpen: false });
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_CHANGE_EXPANDED_STATUS,
        payload: { expanded: false },
      });
    });

    it('triggers expanded false with default appStatus', async () => {
      const dispatch = await runConfigThunk({ deploymentKey: 'CV000000' });
      expect(dispatch).toHaveBeenCalledWith({
        type: ACTION_CHANGE_EXPANDED_STATUS,
        payload: { expanded: false },
      });
    });
  });
});

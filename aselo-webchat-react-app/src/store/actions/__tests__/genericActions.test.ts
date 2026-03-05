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

import { Message, Conversation } from '@twilio/conversations';
import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { FormInputType } from 'hrm-form-definitions';

import { MockedPaginator } from '../../../test-utils';
import {
  addNotification,
  attachFiles,
  changeEngagementPhase,
  changeExpandedStatus,
  detachFiles,
  getMoreMessages,
  removeNotification,
  submitAndInitChatThunk,
  updatePreEngagementData,
} from '../genericActions';
import { EngagementPhase, Notification } from '../../definitions';
import {
  ACTION_ADD_MULTIPLE_MESSAGES,
  ACTION_ADD_NOTIFICATION,
  ACTION_ATTACH_FILES,
  ACTION_DETACH_FILES,
  ACTION_REMOVE_NOTIFICATION,
} from '../actionTypes';
import { SessionReducer } from '../../session.reducer';
import * as initActionsModule from '../initActions';
import { sessionDataHandler } from '../../../sessionDataHandler';
import { notifications } from '../../../notifications';

jest.mock('@twilio/conversations');

jest.mock('../../../sessionDataHandler', () => ({
  sessionDataHandler: {
    fetchAndStoreNewSession: jest.fn(),
    getRegion: jest.fn(),
  },
}));

jest.mock('../initActions', () => ({
  initSession: jest.fn(),
  initConfigThunk: jest.fn(),
}));

const createSessionStore = () =>
  createStore(
    combineReducers({
      session: SessionReducer,
    }),
    compose(applyMiddleware(thunk)),
  );

describe('Actions', () => {
  const messages = [{ sid: 'sid1' }, { sid: 'sid2' }] as Message[];
  const users = [{ idenity: 'id' }];
  const participants = [{ getUser: () => users[0] }];
  const conversation = {
    state: { current: 'active' },
    getParticipants: () => participants,
    getMessages: () => new MockedPaginator(messages),
  } as unknown as Conversation;
  const notification: Notification = {
    message: 'Test notification',
    id: 'TestNotification',
    type: 'neutral',
    dismissible: false,
  };
  let mockStore: any;

  beforeEach(() => {
    mockStore = createSessionStore();
  });

  describe('getMoreMessages', () => {
    it('returns add multiple messages action', () => {
      mockStore.dispatch(getMoreMessages({ anchor: 0, conversation })).then((resolved: object) => {
        expect(resolved).toEqual({
          type: ACTION_ADD_MULTIPLE_MESSAGES,
          payload: {
            messages,
          },
        });
      });
    });
  });

  describe('changeExpandedStatus', () => {
    it('dispatches change change expanded status action', async () => {
      expect(mockStore.getState().session.expanded).toEqual(false);
      mockStore.dispatch(changeExpandedStatus({ expanded: true }));
      expect(mockStore.getState().session.expanded).toEqual(true);
    });
  });

  describe('changeEngagementPhase', () => {
    it('dispatches change engagement phase action', () => {
      expect(mockStore.getState().session.currentPhase).toEqual(EngagementPhase.Loading);
      mockStore.dispatch(changeEngagementPhase({ phase: EngagementPhase.MessagingCanvas }));
      expect(mockStore.getState().session.currentPhase).toEqual(EngagementPhase.MessagingCanvas);
    });
  });

  describe('attachFiles', () => {
    it('returns attach files action', () => {
      const files = [{ name: 'filename.jpg', type: 'image/jpeg', size: 1, lastModified: 1 }] as File[];

      expect(attachFiles(files)).toEqual({
        type: ACTION_ATTACH_FILES,
        payload: {
          filesToAttach: files,
        },
      });
    });
  });

  describe('detachFiles', () => {
    it('returns detach files action', () => {
      const files = [{ name: 'filename.jpg', type: 'image/jpeg', size: 1, lastModified: 1 }] as File[];

      expect(detachFiles(files)).toEqual({
        type: ACTION_DETACH_FILES,
        payload: {
          filesToDetach: files,
        },
      });
    });
  });

  describe('addNotification', () => {
    it('returns add notification action', () => {
      expect(addNotification(notification)).toEqual({
        type: ACTION_ADD_NOTIFICATION,
        payload: {
          notification,
        },
      });
    });
  });

  describe('removeNotification', () => {
    it('returns remove notification action', () => {
      expect(removeNotification(notification.id)).toEqual({
        type: ACTION_REMOVE_NOTIFICATION,
        payload: {
          id: notification.id,
        },
      });
    });
  });
});

describe('submitAndInitChatThunk', () => {
  const token = 'token';
  const conversationSid = 'sid';

  const formFields = [{ name: 'friendlyName', type: FormInputType.Input, label: 'Name' }];
  const preEngagementData = { friendlyName: { value: 'John', error: null, dirty: true } };
  const getState = jest.fn(() => ({
    config: { preEngagementFormDefinition: { fields: formFields } },
    session: { preEngagementData },
  }));

  beforeEach(() => {
    jest.resetAllMocks();
    getState.mockReturnValue({
      config: { preEngagementFormDefinition: { fields: formFields } },
      session: { preEngagementData },
    });
  });

  it('should dispatch actions and initialize session on successful submission', async () => {
    const mockInitSessionResult = { type: 'MOCK_INIT_SESSION' } as any;
    (initActionsModule.initSession as jest.Mock).mockReturnValue(mockInitSessionResult);
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getState as any, undefined);

    const expectedData = { friendlyName: { value: 'John', error: null, dirty: true } };
    expect(dispatch).toHaveBeenCalledWith(updatePreEngagementData(expectedData));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.Loading }));
    expect(initActionsModule.initSession).toHaveBeenCalledWith({ token, conversationSid });
    expect(dispatch).toHaveBeenCalledWith(mockInitSessionResult);
  });

  it('should dispatch error notification and reset phase on session init failure', async () => {
    const errorMessage = 'Session init failed';
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getState as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(addNotification(notifications.failedToInitSessionNotification(errorMessage)));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
  });
});

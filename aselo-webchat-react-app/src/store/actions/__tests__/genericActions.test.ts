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
import { FormInputType } from 'hrm-form-definitions';
import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import thunk from 'redux-thunk';

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
import { sessionDataHandler } from '../../../sessionDataHandler';
import * as initActions from '../initActions';
import { notifications } from '../../../notifications';

jest.mock('@twilio/conversations');

jest.mock('../../../sessionDataHandler', () => ({
  sessionDataHandler: {
    fetchAndStoreNewSession: jest.fn(),
  },
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

  describe('submitAndInitChatThunk', () => {
    const token = 'token';
    const conversationSid = 'sid';

    const formDefinition = {
      fields: [
        { name: 'friendlyName', type: FormInputType.Input, label: 'Name' },
        { name: 'email', type: FormInputType.Email, label: 'Email' },
      ],
    };

    const validPreEngagementData = {
      friendlyName: { value: 'John', error: null, dirty: true },
      email: { value: 'john@example.com', error: null, dirty: true },
    };

    const getState = () =>
      ({
        config: { preEngagementFormDefinition: formDefinition },
        session: { preEngagementData: validPreEngagementData },
      } as any);

    beforeEach(() => {
      jest.spyOn(sessionDataHandler, 'fetchAndStoreNewSession').mockResolvedValue({ token, conversationSid } as any);
      jest.spyOn(initActions, 'initSession').mockReturnValue(jest.fn() as any);
    });

    it('success scenario dispatches updatePreEngagementData, changeEngagementPhase and initSession', async () => {
      const dispatch = jest.fn();
      await submitAndInitChatThunk()(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledWith(
        updatePreEngagementData(
          expect.objectContaining({
            friendlyName: expect.objectContaining({ value: 'John', error: null }),
            email: expect.objectContaining({ value: 'john@example.com', error: null }),
          }),
        ),
      );
      expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.Loading }));
      expect(initActions.initSession).toHaveBeenCalledWith({ token, conversationSid });
    });

    it('error scenario dispatches addNotification and changeEngagementPhase', async () => {
      const errMessage = 'Network error';
      jest.spyOn(sessionDataHandler, 'fetchAndStoreNewSession').mockRejectedValue(new Error(errMessage));

      const dispatch = jest.fn();
      await submitAndInitChatThunk()(dispatch, getState, {});

      expect(dispatch).toHaveBeenCalledWith(addNotification(notifications.failedToInitSessionNotification(errMessage)));
      expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    });
  });
});

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

import { waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { notifications } from '../../../../notifications';
import * as genericActions from '../../genericActions';
import { initClientListeners } from '../clientListener';
import { TokenResponse } from '../../../../definitions';
import { sessionDataHandler } from '../../../../sessionDataHandler';
import { Client } from '../../../../__mocks__/@twilio/conversations';
import WebChatLogger from '../../../../logger';

jest.mock('../../../../logger');

describe('Client Listeners', () => {
  const tokenAboutToExpireEvent = 'tokenAboutToExpire';
  const connectionStateChangedEvent = 'connectionStateChanged';
  const mockDispatch = jest.fn();
  const mockClient = new Client('token');

  beforeAll(() => {
    Object.defineProperty(window, 'Twilio', {
      value: {
        getLogger(className: string) {
          return new WebChatLogger(className);
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates token on tokenAboutToExpire event', async () => {
    const tokenResponsePayload: TokenResponse = {
      token: 'myToken',
      conversationSid: 'myConversationSid',
      identity: 'id',
      expiration: 'never',
    };
    const updateSessionDataAction = {
      type: 'ACTION_UPDATE_SESSION_DATA',
      payload: {
        token: tokenResponsePayload.token,
        conversationSid: tokenResponsePayload.conversationSid,
      },
    };
    jest.spyOn(sessionDataHandler, 'getUpdatedToken').mockImplementation(async () => ({
      ...tokenResponsePayload,
      region: '',
    }));

    initClientListeners(mockClient, mockDispatch);
    mockClient.emit(tokenAboutToExpireEvent, 1000);
    const updateTokenSpy = jest.spyOn(mockClient, 'updateToken');

    await waitFor(() => {
      expect(updateTokenSpy).toHaveBeenCalledWith(tokenResponsePayload.token);
    });

    expect(mockDispatch).toHaveBeenCalledWith(updateSessionDataAction);
  });

  it('shows notification when disconnected on connectionStateChanged event', async () => {
    const addNotificationSpy = jest.spyOn(genericActions, 'addNotification');

    initClientListeners(mockClient, mockDispatch);
    mockClient.emit(connectionStateChangedEvent, 'connecting');
    expect(addNotificationSpy).toHaveBeenCalledWith(notifications.noConnectionNotification());
  });

  it('dismisses notification when reconnected on connectionStateChanged event', () => {
    const removeNotificationSpy = jest.spyOn(genericActions, 'removeNotification');

    initClientListeners(mockClient, mockDispatch);
    mockClient.emit(connectionStateChangedEvent, 'connected');
    expect(removeNotificationSpy).toHaveBeenCalledWith(notifications.noConnectionNotification().id);
  });
});

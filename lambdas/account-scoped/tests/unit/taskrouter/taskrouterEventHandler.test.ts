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

import { getSsmParameter } from '../../../src/ssmCache';
import twilio from 'twilio';
import { EventType, handleTaskRouterEvent } from '../../../src/taskrouter';
import { TEST_ACCOUNT_SID, TEST_AUTH_TOKEN } from '../testTwilioValues';
import { HttpRequest } from '../../../src/httpTypes';
import {
  clearTaskRouterEventHandlers,
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../../../src/taskrouter/taskrouterEventHandler';
import {
  RESERVATION_CANCELED,
  RESERVATION_RESCINDED,
  TASK_CANCELED,
} from '../../../src/taskrouter/eventTypes';

jest.mock('twilio', () => jest.fn());
const mockTwilio: jest.MockedFunction<(account: string, auth: string) => twilio.Twilio> =
  twilio as unknown as jest.MockedFunction<
    (account: string, auth: string) => twilio.Twilio
  >;

jest.mock('../../../src/ssmCache', () => ({
  getSsmParameter: jest.fn(),
}));
const mockGetSsmParameter = getSsmParameter as jest.MockedFunction<
  typeof getSsmParameter
>;

const newTestHttpRequest = (eventType: EventType): HttpRequest => ({
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: {
    EventType: eventType,
  },
  path: '/ignored',
});

describe('handleTaskRouterEvent', () => {
  const mockTwilioClient: twilio.Twilio = {} as twilio.Twilio;
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSsmParameter.mockImplementation((path: string) => {
      if (path.endsWith('/auth_token')) {
        return Promise.resolve(TEST_AUTH_TOKEN);
      }
      throw new Error(`Unexpected SSM parameter path: ${path}`);
    });
    mockTwilio.mockReturnValue(mockTwilioClient);
    clearTaskRouterEventHandlers();
  });

  test('Nothing registered - no op', async () => {
    await handleTaskRouterEvent(newTestHttpRequest(TASK_CANCELED), TEST_ACCOUNT_SID);
    expect(mockTwilio).not.toHaveBeenCalled();
  });

  test('One handler registered for event - calls handler', async () => {
    const handler: jest.MockedFunction<TaskRouterEventHandler> = jest.fn();
    registerTaskRouterEventHandler([RESERVATION_RESCINDED], handler);
    const request = newTestHttpRequest(RESERVATION_RESCINDED);
    await handleTaskRouterEvent(request, TEST_ACCOUNT_SID);
    expect(mockTwilio).toHaveBeenCalledWith(TEST_ACCOUNT_SID, TEST_AUTH_TOKEN);
    expect(handler).toHaveBeenCalledWith(
      request.body,
      TEST_ACCOUNT_SID,
      mockTwilioClient,
    );
  });

  test('Handler registered for other event - no op', async () => {
    const handler: jest.MockedFunction<TaskRouterEventHandler> = jest.fn();
    registerTaskRouterEventHandler([RESERVATION_CANCELED], handler);
    const request = newTestHttpRequest(RESERVATION_RESCINDED);
    await handleTaskRouterEvent(request, TEST_ACCOUNT_SID);
    expect(mockTwilio).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  test('Multiple handlers registered for event - calls all handlers', async () => {
    const handler1: jest.MockedFunction<TaskRouterEventHandler> = jest.fn();
    const handler2: jest.MockedFunction<TaskRouterEventHandler> = jest.fn();
    registerTaskRouterEventHandler([RESERVATION_RESCINDED], handler1);
    registerTaskRouterEventHandler([RESERVATION_RESCINDED], handler2);
    const request = newTestHttpRequest(RESERVATION_RESCINDED);
    await handleTaskRouterEvent(request, TEST_ACCOUNT_SID);
    expect(mockTwilio.mock.calls).toEqual([
      [TEST_ACCOUNT_SID, TEST_AUTH_TOKEN],
      [TEST_ACCOUNT_SID, TEST_AUTH_TOKEN],
    ]);
    expect(handler1).toHaveBeenCalledWith(
      request.body,
      TEST_ACCOUNT_SID,
      mockTwilioClient,
    );
    expect(handler2).toHaveBeenCalledWith(
      request.body,
      TEST_ACCOUNT_SID,
      mockTwilioClient,
    );
  });

  test('Handler registered for multiple events - calls handler for all events', async () => {
    const handler: jest.MockedFunction<TaskRouterEventHandler> = jest.fn();
    registerTaskRouterEventHandler(
      [RESERVATION_RESCINDED, RESERVATION_CANCELED],
      handler,
    );
    const request1 = newTestHttpRequest(RESERVATION_RESCINDED);
    await handleTaskRouterEvent(request1, TEST_ACCOUNT_SID);

    expect(mockTwilio).toHaveBeenCalledWith(TEST_ACCOUNT_SID, TEST_AUTH_TOKEN);
    expect(handler).toHaveBeenCalledWith(
      request1.body,
      TEST_ACCOUNT_SID,
      mockTwilioClient,
    );
    mockTwilio.mockClear();
    handler.mockClear();

    const request2 = newTestHttpRequest(RESERVATION_CANCELED);
    await handleTaskRouterEvent(request2, TEST_ACCOUNT_SID);

    expect(mockTwilio).toHaveBeenCalledWith(TEST_ACCOUNT_SID, TEST_AUTH_TOKEN);
    expect(handler).toHaveBeenCalledWith(
      request2.body,
      TEST_ACCOUNT_SID,
      mockTwilioClient,
    );
  });
});

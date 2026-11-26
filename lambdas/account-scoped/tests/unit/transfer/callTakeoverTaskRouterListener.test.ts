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

import twilio from 'twilio';
import { handleEvent } from '../../../src/transfer/callTakeoverTaskRouterListener';
import { patchTaskAttributes } from '../../../src/task/patchTaskAttributes';
import { EventFields } from '../../../src/taskrouter';
import {
  EventType,
  RESERVATION_ACCEPTED,
  RESERVATION_REJECTED,
  RESERVATION_TIMEOUT,
} from '../../../src/taskrouter/eventTypes';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';
import { newOk } from '@tech-matters/result-type';

jest.mock('../../../src/task/patchTaskAttributes', () => ({
  patchTaskAttributes: jest.fn(),
}));

const mockPatchTaskAttributes = patchTaskAttributes as jest.MockedFunction<
  typeof patchTaskAttributes
>;

const SUPERVISOR_SID = 'WKsupervisor';
const startedRequest = {
  requestedBy: SUPERVISOR_SID,
  requestedAt: '2026-11-17T10:00:00.000Z',
  originalReservation: 'WRoriginal',
  originalCounselor: 'WKcounselor',
  status: 'started',
};

let currentAttributes: Record<string, any>;

const newEvent = (
  eventType: EventType,
  overrides: Partial<EventFields> = {},
): EventFields =>
  ({
    EventType: eventType,
    TaskChannelUniqueName: 'voice',
    TaskSid: 'WTcall',
    TaskAttributes: JSON.stringify(currentAttributes),
    WorkerSid: SUPERVISOR_SID,
    ...overrides,
  }) as EventFields;

const handle = (event: EventFields) =>
  handleEvent(event, TEST_ACCOUNT_SID, {} as twilio.Twilio);

beforeEach(() => {
  jest.clearAllMocks();
  currentAttributes = { other: 'kept', takeoverRequest: startedRequest };
  mockPatchTaskAttributes.mockImplementation(async (_accountSid, _taskSid, update) => {
    currentAttributes = update(currentAttributes);
    return newOk(undefined) as any;
  });
});

test('supervisor accepts the take over reservation - request cleared', async () => {
  await handle(newEvent(RESERVATION_ACCEPTED));
  expect(currentAttributes).toStrictEqual({ other: 'kept' });
});

test.each<EventType>([RESERVATION_REJECTED, RESERVATION_TIMEOUT])(
  '%s by the supervisor - request marked failed',
  async eventType => {
    await handle(newEvent(eventType));
    expect(currentAttributes.takeoverRequest).toStrictEqual({
      ...startedRequest,
      status: 'failed',
      reason: eventType,
    });
  },
);

test.each([
  ['a different worker', { WorkerSid: 'WKother' }],
  ['a non voice task', { TaskChannelUniqueName: 'chat' }],
] as const)('event for %s - ignored', async (_, overrides) => {
  await handle(newEvent(RESERVATION_ACCEPTED, overrides));
  expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
});

test('request not started - ignored', async () => {
  currentAttributes = { takeoverRequest: { ...startedRequest, status: 'requested' } };
  await handle(newEvent(RESERVATION_ACCEPTED));
  expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
});

test('request replaced since the event - newer request left alone', async () => {
  const event = newEvent(RESERVATION_ACCEPTED);
  const newerRequest = { ...startedRequest, requestedAt: '2026-11-17T10:05:00.000Z' };
  currentAttributes = { takeoverRequest: newerRequest };
  await handle(event);
  expect(currentAttributes).toStrictEqual({ takeoverRequest: newerRequest });
});

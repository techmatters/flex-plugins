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
import { isErr, isOk, newErr, newOk } from '@tech-matters/result-type';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import {
  requestCallTakeoverHandler,
  TAKEOVER_REQUEST_TTL_MS,
  updateCallTakeoverStatusHandler,
} from '../../../src/transfer/callTakeover';
import { patchTaskAttributes } from '../../../src/task/patchTaskAttributes';
import { FlexValidatedHttpRequest } from '../../../src/validation/flexToken';
import { HttpError } from '../../../src/httpTypes';
import { RecursivePartial } from '../RecursivePartial';
import { TEST_ACCOUNT_SID, TEST_WORKSPACE_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn(),
  getWorkspaceSid: jest.fn(),
  getConversationsTransferWorkflow: jest.fn(),
}));

jest.mock('../../../src/task/patchTaskAttributes', () => ({
  patchTaskAttributes: jest.fn(),
}));

const mockGetTwilioClient = getTwilioClient as jest.MockedFunction<
  typeof getTwilioClient
>;
const mockGetWorkspaceSid = getWorkspaceSid as jest.MockedFunction<
  typeof getWorkspaceSid
>;
const mockPatchTaskAttributes = patchTaskAttributes as jest.MockedFunction<
  typeof patchTaskAttributes
>;

const TASK_SID = 'WTcall';
const COUNSELOR_SID = 'WKcounselor';
const SUPERVISOR_SID = 'WKsupervisor';
const ORIGINAL_RESERVATION_SID = 'WRoriginal';
const NOW = new Date('2026-11-17T10:00:00.000Z');

const newRequest = (
  body: Record<string, unknown>,
  workerSid: string,
  roles: string[] = ['agent'],
): FlexValidatedHttpRequest =>
  ({ body, tokenResult: { worker_sid: workerSid, roles } }) as FlexValidatedHttpRequest;

const pendingRequest = (overrides: Record<string, unknown> = {}) => ({
  requestedBy: SUPERVISOR_SID,
  requestedAt: NOW.toISOString(),
  originalReservation: ORIGINAL_RESERVATION_SID,
  originalCounselor: COUNSELOR_SID,
  status: 'requested',
  ...overrides,
});

const expectHttpError = (result: any, statusCode: number) => {
  expect(isErr(result)).toBe(true);
  expect((result.error as HttpError).statusCode).toBe(statusCode);
};

let currentAttributes: Record<string, any>;
let taskChannelUniqueName: string;
let reservations: { sid: string; reservationStatus: string; workerSid: string }[];
let supervisorAvailable: boolean;

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['performance'] }).setSystemTime(NOW);
  jest.clearAllMocks();
  currentAttributes = {};
  taskChannelUniqueName = 'voice';
  supervisorAvailable = true;
  reservations = [
    {
      sid: ORIGINAL_RESERVATION_SID,
      reservationStatus: 'accepted',
      workerSid: COUNSELOR_SID,
    },
  ];
  const taskContext = {
    fetch: jest.fn(async () => ({
      sid: TASK_SID,
      taskChannelUniqueName,
      attributes: JSON.stringify(currentAttributes),
    })),
    reservations: { list: jest.fn(async () => reservations) },
  };
  const mockClient: RecursivePartial<twilio.Twilio> = {
    taskrouter: {
      v1: {
        workspaces: {
          get: () => ({
            tasks: { get: () => taskContext },
            workers: {
              get: () => ({
                fetch: jest.fn(async () => ({
                  available: supervisorAvailable,
                  attributes: '{}',
                })),
                workerChannels: {
                  get: () => ({
                    fetch: jest.fn(async () => ({
                      availableCapacityPercentage: 100,
                      configuredCapacity: 1,
                    })),
                  }),
                },
              }),
            },
          }),
        },
      },
    },
  };
  mockGetTwilioClient.mockResolvedValue(mockClient as twilio.Twilio);
  mockGetWorkspaceSid.mockResolvedValue(TEST_WORKSPACE_SID);
  mockPatchTaskAttributes.mockImplementation(async (_accountSid, _taskSid, update) => {
    currentAttributes = update(currentAttributes);
    return newOk(undefined) as any;
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('requestCallTakeoverHandler', () => {
  const requestTakeover = () =>
    requestCallTakeoverHandler(
      newRequest({ taskSid: TASK_SID }, SUPERVISOR_SID, ['supervisor']),
      TEST_ACCOUNT_SID,
    );

  test('records a takeover request against the accepted reservation', async () => {
    const result = await requestTakeover();

    expect(isOk(result)).toBe(true);
    expect(mockPatchTaskAttributes).toHaveBeenCalledWith(
      TEST_ACCOUNT_SID,
      TASK_SID,
      expect.any(Function),
      { requireEtag: true },
    );
    expect(currentAttributes.takeoverRequest).toStrictEqual(pendingRequest());
  });

  test('missing taskSid - returns 400', async () => {
    const result = await requestCallTakeoverHandler(
      newRequest({}, SUPERVISOR_SID, ['supervisor']),
      TEST_ACCOUNT_SID,
    );
    expectHttpError(result, 400);
  });

  test('non voice task - returns 400', async () => {
    taskChannelUniqueName = 'chat';
    expectHttpError(await requestTakeover(), 400);
    expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
  });

  test('no accepted reservation - returns 400', async () => {
    reservations = [];
    expectHttpError(await requestTakeover(), 400);
  });

  test('task already assigned to the supervisor - returns 400', async () => {
    reservations[0].workerSid = SUPERVISOR_SID;
    expectHttpError(await requestTakeover(), 400);
  });

  test('supervisor offline - returns 400', async () => {
    supervisorAvailable = false;
    expectHttpError(await requestTakeover(), 400);
    expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
  });

  test('two accepted reservations (warm transfer) - returns 409', async () => {
    reservations.push({
      sid: 'WRtarget',
      reservationStatus: 'accepted',
      workerSid: 'WKtarget',
    });
    expectHttpError(await requestTakeover(), 409);
  });

  test('cold transfer started from the accepted reservation - returns 409', async () => {
    currentAttributes = {
      transferMeta: {
        transferStatus: 'accepted',
        originalReservation: ORIGINAL_RESERVATION_SID,
      },
    };
    expectHttpError(await requestTakeover(), 409);
  });

  test('transfer metadata left by an earlier transfer - records the request', async () => {
    currentAttributes = {
      transferMeta: { transferStatus: 'accepted', originalReservation: 'WRearlier' },
    };
    expect(isOk(await requestTakeover())).toBe(true);
    expect(currentAttributes.takeoverRequest.status).toBe('requested');
  });

  test('fresh pending request - returns 409', async () => {
    currentAttributes = { takeoverRequest: pendingRequest() };
    expectHttpError(await requestTakeover(), 409);
  });

  test('fresh started request - returns 409', async () => {
    currentAttributes = { takeoverRequest: pendingRequest({ status: 'started' }) };
    expectHttpError(await requestTakeover(), 409);
  });

  test('expired started request - replaced with a new one', async () => {
    currentAttributes = {
      takeoverRequest: pendingRequest({
        status: 'started',
        requestedAt: new Date(NOW.getTime() - TAKEOVER_REQUEST_TTL_MS - 1).toISOString(),
      }),
    };
    expect(isOk(await requestTakeover())).toBe(true);
    expect(currentAttributes.takeoverRequest).toStrictEqual(pendingRequest());
  });

  test('expired or failed request - replaced with a new one', async () => {
    currentAttributes = {
      takeoverRequest: pendingRequest({
        requestedBy: 'WKother',
        requestedAt: new Date(NOW.getTime() - TAKEOVER_REQUEST_TTL_MS - 1).toISOString(),
      }),
    };
    expect(isOk(await requestTakeover())).toBe(true);
    expect(currentAttributes.takeoverRequest).toStrictEqual(pendingRequest());

    currentAttributes = { takeoverRequest: pendingRequest({ status: 'failed' }) };
    expect(isOk(await requestTakeover())).toBe(true);
    expect(currentAttributes.takeoverRequest).toStrictEqual(pendingRequest());
  });

  test('patch fails - returns 500', async () => {
    mockPatchTaskAttributes.mockResolvedValue(
      newErr({ message: 'boom', error: new Error('boom') }) as any,
    );
    expectHttpError(await requestTakeover(), 500);
  });
});

describe('updateCallTakeoverStatusHandler', () => {
  const updateStatus = (body: Record<string, unknown>, workerSid = COUNSELOR_SID) =>
    updateCallTakeoverStatusHandler(
      newRequest({ taskSid: TASK_SID, ...body }, workerSid),
      TEST_ACCOUNT_SID,
    );

  beforeEach(() => {
    currentAttributes = { other: 'kept', takeoverRequest: pendingRequest() };
  });

  test('counselor claims a pending request', async () => {
    expect(isOk(await updateStatus({ status: 'started' }))).toBe(true);
    expect(currentAttributes).toStrictEqual({
      other: 'kept',
      takeoverRequest: pendingRequest({ status: 'started' }),
    });
  });

  test('second claim (e.g. another Flex tab) - returns 409', async () => {
    await updateStatus({ status: 'started' });
    expectHttpError(await updateStatus({ status: 'started' }), 409);
  });

  test('claiming an expired request - returns 409', async () => {
    jest.setSystemTime(NOW.getTime() + TAKEOVER_REQUEST_TTL_MS + 1);
    expectHttpError(await updateStatus({ status: 'started' }), 409);
  });

  test('counselor reports a failure with a reason', async () => {
    await updateStatus({ status: 'started' });
    expect(isOk(await updateStatus({ status: 'failed', reason: 'too many' }))).toBe(true);
    expect(currentAttributes.takeoverRequest).toStrictEqual(
      pendingRequest({ status: 'failed', reason: 'too many' }),
    );
  });

  test('requesting supervisor can mark the request failed', async () => {
    expect(isOk(await updateStatus({ status: 'failed' }, SUPERVISOR_SID))).toBe(true);
    expect(currentAttributes.takeoverRequest.status).toBe('failed');
  });

  test('requesting supervisor cannot start the request - returns 403', async () => {
    expectHttpError(await updateStatus({ status: 'started' }, SUPERVISOR_SID), 403);
  });

  test('another worker - returns 403', async () => {
    expectHttpError(await updateStatus({ status: 'failed' }, 'WKother'), 403);
  });

  test('already failed - returns 409', async () => {
    await updateStatus({ status: 'failed' });
    expectHttpError(await updateStatus({ status: 'failed' }), 409);
  });

  test('no request - returns 409', async () => {
    currentAttributes = {};
    expectHttpError(await updateStatus({ status: 'started' }), 409);
  });

  test('invalid status - returns 400', async () => {
    expectHttpError(await updateStatus({ status: 'requested' }), 400);
    expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
  });
});

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

import { AccountSID } from '@tech-matters/twilio-types';
import { isErr } from '@tech-matters/result-type';
import {
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import {
  RESERVATION_ACCEPTED,
  RESERVATION_REJECTED,
  RESERVATION_TIMEOUT,
} from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { patchTaskAttributes } from '../task/patchTaskAttributes';
import { TakeoverRequest } from './callTakeover';

const isSameRequest = (a: TakeoverRequest | undefined, b: TakeoverRequest) =>
  a?.requestedBy === b.requestedBy && a?.requestedAt === b.requestedAt;

/**
 * Once the supervisor's reservation for a started call take over resolves, the request is cleared (accepted)
 * or marked failed (rejected / timed out).
 * Clearing it stops a later, ordinary transfer of the same call to that supervisor from being auto-accepted as a take over.
 */
const callTakeoverHandler: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
) => {
  const {
    EventType: eventType,
    TaskChannelUniqueName: taskChannelUniqueName,
    TaskSid: taskSid,
    TaskAttributes: taskAttributesString,
    WorkerSid: workerSid,
  } = event;
  if (taskChannelUniqueName !== 'voice') return;

  const request: TakeoverRequest | undefined =
    JSON.parse(taskAttributesString).takeoverRequest;
  if (request?.status !== 'started' || request.requestedBy !== workerSid) return;

  console.info(
    `CallTakeoverListener: ${eventType} for take over of task ${taskSid} by ${workerSid}, account ${accountSid}`,
  );
  const result = await patchTaskAttributes(accountSid, taskSid, attributes => {
    // Leave a newer request alone
    if (!isSameRequest(attributes.takeoverRequest, request)) return attributes;
    if (eventType === RESERVATION_ACCEPTED) {
      const { takeoverRequest, ...rest } = attributes;
      return rest;
    }
    return {
      ...attributes,
      takeoverRequest: { ...request, status: 'failed', reason: eventType },
    };
  });
  if (isErr(result)) {
    console.error(
      `CallTakeoverListener: failed to update take over request on task ${taskSid}: ${result.message}`,
    );
  }
};

export { callTakeoverHandler as handleEvent };

registerTaskRouterEventHandler(
  [RESERVATION_ACCEPTED, RESERVATION_REJECTED, RESERVATION_TIMEOUT],
  callTakeoverHandler,
);

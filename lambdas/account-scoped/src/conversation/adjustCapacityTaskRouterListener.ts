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

import {
  registerTaskRouterEventHandler,
  TaskRouterEventHandler,
} from '../taskrouter/taskrouterEventHandler';
import { AccountSID, WorkerSID } from '@tech-matters/twilio-types';
import { Twilio } from 'twilio';
import { RESERVATION_ACCEPTED, RESERVATION_REJECTED } from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { retrieveFeatureFlags } from '../configuration/aseloConfiguration';
import { adjustChatCapacity } from './adjustChatCapacity';

const adjustCapacityHandler: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  const featureFlags = await retrieveFeatureFlags(client);

  if (!featureFlags.use_twilio_lambda_adjust_capacity) {
    console.debug(
      `AdjustCapacityTaskRouterListener skipped for account ${accountSid} - use_twilio_lambda_adjust_capacity flag not enabled`,
    );
    return;
  }

  const {
    WorkerSid: workerSid,
    TaskSid: taskSid,
    TaskChannelUniqueName: taskChannelUniqueName,
    EventType: eventType,
  } = event;

  if (taskChannelUniqueName !== 'chat') return;

  if (!featureFlags.enable_manual_pulling) {
    console.debug(
      `AdjustCapacityListener skipped for account ${accountSid}, task ${taskSid} - enable_manual_pulling flag not enabled`,
    );
    return;
  }

  const { status, message } = await adjustChatCapacity(accountSid, {
    workerSid: workerSid as WorkerSID,
    adjustment: 'setTo1',
  });
  console.info(
    `AdjustCapacityListener completed for account ${accountSid}, task ${taskSid}, worker ${workerSid}, event ${eventType}: status ${status}, '${message}'`,
  );
};

export { adjustCapacityHandler as handleEvent };

registerTaskRouterEventHandler(
  [RESERVATION_ACCEPTED, RESERVATION_REJECTED],
  adjustCapacityHandler,
);

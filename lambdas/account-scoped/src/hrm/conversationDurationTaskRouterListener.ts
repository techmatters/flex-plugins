/**
 * Copyright (C) 2021-2025 Technology Matters
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

import type { EventFields } from '../taskrouter';
import { AccountSID } from '../twilioTypes';
import { registerTaskRouterEventHandler } from '../taskrouter/taskrouterEventHandler';
import { patchOnInternalHrmEndpoint } from './internalHrmRequest';
import { HrmContact } from '@tech-matters/hrm-types';
import { isErr } from '../Result';
import { inferHrmAccountId } from './hrmAccountId';
import { Twilio } from 'twilio';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { TASK_WRAPUP } from '../taskrouter/eventTypes';

const getTimeInputsDescription = (timeOfContactMillis: number, nowMillis: number) =>
  `timeOfContact: ${new Date(timeOfContactMillis).toISOString()} (epoch: ${timeOfContactMillis}), end time (should be now): ${new Date(nowMillis).toISOString()} (epoch: ${nowMillis})`;

export const handleSetDurationEvent = async (
  {
    TaskAttributes: taskAttributesString,
    TaskSid: taskSid,
    WorkerName: workerName,
  }: EventFields,
  accountSid: AccountSID,
  client: Twilio,
): Promise<void> => {
  const {
    hrm_api_version: hrmApiVersion,
    feature_flags: {
      use_twilio_lambda_for_conversation_duration: useTwilioLambdaForConversationDuration,
    },
  } = await retrieveServiceConfigurationAttributes(client);

  if (!useTwilioLambdaForConversationDuration) {
    console.debug(
      `use_twilio_lambda_for_conversation_duration is not set, the contact associated with task ${taskSid} will have the conversationDuration set in Flex.`,
    );
    return;
  }

  const { timeOfContactMillis: timeOfContactMillisString, contactId } =
    JSON.parse(taskAttributesString);

  if (timeOfContactMillisString && contactId) {
    const nowMillis = Date.now();
    const timeOfContactMillis = Number.parseInt(timeOfContactMillisString);
    const conversationDuration = Math.floor((nowMillis - timeOfContactMillis) / 1000);
    if (conversationDuration < 0) {
      console.warn(
        `Negative conversationDuration calculated  on HRM contact ${contactId} for task ${taskSid}: ${conversationDuration} (${getTimeInputsDescription(timeOfContactMillis, nowMillis)}, conversationDuration (seconds))`,
      );
    }
    const responseResult = await patchOnInternalHrmEndpoint<
      { conversationDuration: number },
      HrmContact
    >(inferHrmAccountId(accountSid, workerName), hrmApiVersion, `contacts/${contactId}`, {
      conversationDuration,
    });
    if (isErr(responseResult)) {
      console.error(
        `Failed to set conversationDuration on HRM contact ${contactId} for task ${taskSid} to ${conversationDuration} (${getTimeInputsDescription(timeOfContactMillis, nowMillis)})`,
        responseResult.message,
        responseResult.error,
      );
    } else {
      console.info(
        `Set conversationDuration Task: ${taskSid}, Contact: ${contactId}, conversationDuration: ${conversationDuration} (${getTimeInputsDescription(timeOfContactMillis, nowMillis)})`,
      );
    }
  } else {
    console.debug(
      `timeOfContactMillis and contactId need to be set on task to set hangUpBy on contact. Task: ${taskSid}, Contact: ${contactId}, timeOfContactMillis: ${timeOfContactMillisString}`,
    );
  }
};

registerTaskRouterEventHandler([TASK_WRAPUP], handleSetDurationEvent);

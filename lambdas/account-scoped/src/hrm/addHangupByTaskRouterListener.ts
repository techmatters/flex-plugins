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

import type { EventFields } from '../taskrouter';
import { AccountSID } from '../twilioTypes';
import { registerTaskRouterEventHandler } from '../taskrouter/taskrouterEventHandler';
import { TASK_COMPLETED } from '../taskrouter/eventTypes';
import { patchOnInternalHrmEndpoint } from './internalHrmRequest';
import { HrmContact, HrmContactRawJson } from '@tech-matters/hrm-types';
import { isErr } from '../Result';
import { inferHrmAccountId } from './hrmAccountId';
import { Twilio } from 'twilio';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';

export const handleEvent = async (
  {
    TaskAttributes: taskAttributesString,
    TaskSid: taskSid,
    WorkerName: workerName,
  }: EventFields,
  accountSid: AccountSID,
  client: Twilio,
): Promise<void> => {
  const { conversations, contactId } = JSON.parse(taskAttributesString);
  const hangUpBy = conversations?.hang_up_by;
  const {
    hrm_api_version: hrmApiVersion,
    feature_flags: { enable_hang_up_by_hrm_saving: enableHangUpByHrmSaving },
  } = await retrieveServiceConfigurationAttributes(client);

  if (!enableHangUpByHrmSaving) {
    console.debug(
      `enable_hang_up_by_hrm_saving is not set, the contact associated with task ${taskSid} will not have the hangUpBy property set.`,
    );
    return;
  }

  if (hangUpBy && contactId) {
    const responseResult = await patchOnInternalHrmEndpoint<
      { rawJson: Partial<HrmContactRawJson> },
      HrmContact
    >(inferHrmAccountId(accountSid, workerName), hrmApiVersion, `contacts/${contactId}`, {
      rawJson: {
        hangUpBy,
      },
    });
    if (isErr(responseResult)) {
      console.error(
        `Failed to set HangUpBY to ${hangUpBy} on HRM contact ${contactId} for task ${taskSid}`,
        responseResult.message,
        responseResult.error,
      );
    } else {
      console.info(
        `Set hangUpBy Task: ${taskSid}, Contact: ${contactId}, hangUpBy: ${hangUpBy}`,
      );
    }
  } else {
    console.debug(
      `hang_up_by and contactId need to be set on task to set hangUpBy on contact. Task: ${taskSid}, Contact: ${contactId}, hangUpBy: ${hangUpBy}`,
    );
  }
};

registerTaskRouterEventHandler([TASK_COMPLETED], handleEvent);

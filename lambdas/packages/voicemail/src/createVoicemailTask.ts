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

import { AccountSID, channelTypes } from '@tech-matters/twilio-types';
import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { newErr, newOk } from '@tech-matters/result-type';

export const DEFAULT_MAX_CALLBACK_ATTEMPTS = 3;

export const createVoicemailTask = async ({
  accountSid,
  workflowSid,
  callbackAttempts,
  receivedTime,
  from,
  name,
  callSid,
  maxCallbackAttempts,
  routingAttributes,
}: {
  accountSid: AccountSID;
  receivedTime: string;
  callbackAttempts: [string, string][];
  maxCallbackAttempts?: number;
  callSid: string;
  from: string;
  name: string;
  workflowSid: string;
  routingAttributes?: Record<string, any>;
}) => {
  try {
    const workspaceSid = await getWorkspaceSid(accountSid);
    const twilioClient = await getTwilioClient(accountSid);
    const createdVoicemailTask = await twilioClient.taskrouter.v1
      .workspaces(workspaceSid)
      .tasks.create({
        timeout: 604800, // 7 days
        attributes: JSON.stringify({
          isVoicemail: true,
          routingAttributes: routingAttributes ?? {},
          receivedTime,
          callbackAttempts,
          maxCallbackAttempts: maxCallbackAttempts ?? DEFAULT_MAX_CALLBACK_ATTEMPTS,
          callSid,
          from,
          name,
          channelType: channelTypes.VOICEMAIL,
          customChannelType: channelTypes.VOICEMAIL,
          ignoreAgent: '',
          transferTargetType: '',
        }),
        workflowSid,
        taskChannel: channelTypes.VOICEMAIL,
      });

    return newOk({ createdVoicemailTask });
  } catch (err) {
    return newErr({
      error: err,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};

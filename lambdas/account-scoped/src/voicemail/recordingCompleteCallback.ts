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

import { getTwilioClient, getWorkspaceSid } from '@tech-matters/twilio-configuration';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { newOk, Result } from '../Result';
import {channelTypes} from "@tech-matters/twilio-types/src/channelType";

export type RecordingCompleteCallbackRequestBody = {
  callFrom: string;
};

export const recordingCompleteCallback: AccountScopedHandler = async (
  { body },
  accountSid,
): Promise<Result<HttpError, any>> => {
  console.debug(
    '[SENSITIVE] recordingCompleteCallback body',
    JSON.stringify(body, null, 2),
  );

  const twilioClient = await getTwilioClient(accountSid);

  const workspaceSid = await getWorkspaceSid(accountSid);
  const voicemailTask = await twilioClient.taskrouter.v1
    .workspaces(workspaceSid)
    .tasks.create({
      timeout: 604800, // 7 days
      attributes: JSON.stringify({
        ...(body.routingAttributes ? JSON.parse(body.routingAttributes) : {}),
        isVoicemail: true,
        callSid: body.callSid,
        from: body.from,
        name: body.from,
        channelType: channelTypes.VOICEMAIL,
        customChannelType: channelTypes.VOICEMAIL,
        ignoreAgent: '',
        transferTargetType: '',
      }),
      workflowSid: body.voicemailWorkflowSid,
      // TODO: factor out channel types into an enum
      taskChannel: channelTypes.VOICEMAIL,
    });

  return newOk({ voicemailTask });
};

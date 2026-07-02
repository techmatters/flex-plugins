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

export type RecordingCompleteCallbackRequestBody = {
  callFrom: string;
};

export const recordingCompleteCallback: AccountScopedHandler = async (
  { body },
  accountSid,
): Promise<Result<HttpError, any>> => {
  console.debug('recordingCompleteCallback body', JSON.stringify(body, null, 2));
  // const { callFrom } = body as RecordingCompleteCallbackRequestBody;

  // if (!callFrom) {
  //   return newErr({
  //     message: 'callFrom parameter is missing',
  //     error: { statusCode: 400 },
  //   });
  // }

  const twilioClient = await getTwilioClient(accountSid);

  const workspaceSid = await getWorkspaceSid(accountSid);
  const voicemailTask = await twilioClient.taskrouter.v1
    .workspaces(workspaceSid)
    .tasks.create({
      timeout: 604800, // 7 days
      attributes: JSON.stringify({
        ...(body.routingAttributes ?? {}),
        isVoicemail: true,
        callSid: body.callSid,
      }),
      workflowSid: body.voicemailWorkflowSid,
      // TODO: factor out channel types into an enum
      taskChannel: 'voicemail',
    });

  return newOk({ voicemailTask });
};

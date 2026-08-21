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
import type { CallSid, RecordingSid } from '@tech-matters/twilio-types';
import { channelTypes } from '@tech-matters/twilio-types';
import { AccountScopedHandler, HttpError } from '../httpTypes';
import { newOk, Result } from '../Result';
import { newMissingParameterResult } from '../httpErrors';

const DEFAULT_MAX_CALLBACK_ATTEMPTS = 3;

export type RecordingCompleteCallbackRequestBody = {
  from: string;
  callSid: CallSid;
  recordingSid: RecordingSid;
  voicemailWorkflowSid: string;
  routingAttributes?: string;
  maxCallbackAttempts?: number;
};

export const recordingCompleteCallback: AccountScopedHandler = async (
  { body },
  accountSid,
): Promise<Result<HttpError, any>> => {
  console.debug('recordingCompleteCallback body', JSON.stringify(body, null, 2));
  const { from, callSid, recordingSid, maxCallbackAttempts } =
    body as RecordingCompleteCallbackRequestBody;

  if (!callSid) {
    return newMissingParameterResult('callSid');
  }
  if (!from) {
    return newMissingParameterResult('from');
  }
  if (!recordingSid) {
    console.warn(
      `[${accountSid}] Recording SID not set in voicemail recording callback handler for call: ${callSid}, cannot set an accurate received time for the voicemail`,
    );
  }

  const twilioClient = await getTwilioClient(accountSid);
  let receivedTime: Date;
  try {
    const recordingInstance = await twilioClient.recordings.get(recordingSid).fetch();
    receivedTime = recordingInstance.startTime;
  } catch (recordingError) {
    try {
      console.warn(
        `[${accountSid}] Error finding start time for recordingSid: ${recordingSid}, callSid: ${callSid} to use as received time for voicemail - falling back to call start time`,
        recordingError,
      );
      const callInstance = await twilioClient.calls.get(callSid).fetch();
      receivedTime = callInstance.startTime;
    } catch (callError) {
      console.warn(
        `[${accountSid}] Error finding fallback start time for callSid: ${callSid} to use as received time for voicemail - falling back to current time`,
        recordingError,
      );
      receivedTime = new Date();
    }
  }

  const workspaceSid = await getWorkspaceSid(accountSid);
  const voicemailTask = await twilioClient.taskrouter.v1
    .workspaces(workspaceSid)
    .tasks.create({
      timeout: 604800, // 7 days
      attributes: JSON.stringify({
        ...(body.routingAttributes ? JSON.parse(body.routingAttributes) : {}),
        receivedTime: receivedTime.toISOString(),
        callbackAttemptsMade: 0,
        maxCallbackAttempts: maxCallbackAttempts ?? DEFAULT_MAX_CALLBACK_ATTEMPTS,
        callSid,
        from,
        name: from,
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

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

import { AccountScopedHandler } from '../httpTypes';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { newOk } from '../Result';
import type { CallSid } from '@tech-matters/twilio-types';
import { endActiveStudioFlowExecutionsForCall } from '../studioFlow/endActiveStudioFlowExecutionsForCall';

type CallStatusCallbackEvent = {
  CallSid: CallSid;
  CallStatus: 'completed';
};

export const callStatusCallbackHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { CallSid: callSid, CallStatus: callStatus } = body as CallStatusCallbackEvent;
  const logPrefix = `[Call ${accountSid}/${callSid} status changed to '${callStatus}']`;
  console.debug(`${logPrefix}: Handler invoked`);
  await endActiveStudioFlowExecutionsForCall(await getTwilioClient(accountSid), {
    accountSid,
    callSid,
  });
  return newOk('Ok');
};

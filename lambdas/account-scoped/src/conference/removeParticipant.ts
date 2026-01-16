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
import { newErr, newOk } from '../Result';
import { newMissingParameterResult } from '../httpErrors';
import type RestException from 'twilio/lib/base/RestException';

export type Body = {
  callSid: string;
  conferenceSid: string;
  request: { cookies: {}; headers: {} };
};

export const removeParticipantHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { callSid, conferenceSid } = body;

  if (!callSid) return newMissingParameterResult('callSid');
  if (!conferenceSid) return newMissingParameterResult('conferenceSid');

  const client = await getTwilioClient(accountSid);
  try {
    const participantRemoved = await client
      .conferences(conferenceSid)
      .participants(callSid)
      .remove();
    return newOk({ message: `Participant removed: ${participantRemoved}` });
  } catch (error) {
    const restError = error as RestException;
    if (restError.status === 404) {
      const message = `Participant with call sid ${callSid} not found on ${accountSid}/${conferenceSid}`;
      // Often errors of this type are thrown but the recording appears to pause at the correct point.
      console.warn(message, error);
      return newErr({
        message,
        error: {
          cause: restError,
          statusCode: 404,
        },
      });
    }
    throw error;
  }
};

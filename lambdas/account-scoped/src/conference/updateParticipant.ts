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
import { newMissingParameterResult } from '../httpErrors';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { newErr, newOk } from '../Result';
import type RestException from 'twilio/lib/base/RestException';

const validUpdates = ['endConferenceOnExit', 'hold', 'muted'] as const;

type ParsedUpdates = { [K in (typeof validUpdates)[number]]?: boolean };
const parseUpdates = (updates: string): ParsedUpdates | null => {
  const parsed = JSON.parse(updates);

  if (
    !parsed ||
    !Object.entries(parsed).every(
      ([k, v]) => validUpdates.includes(k as any) && typeof v === 'boolean',
    )
  ) {
    return null;
  }

  return parsed;
};

export const updateParticipantHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { callSid, conferenceSid, updates } = body;

  if (!callSid) return newMissingParameterResult('callSid');
  if (!conferenceSid) return newMissingParameterResult('conferenceSid');

  const parsedUpdates = parseUpdates(updates);
  if (!parsedUpdates) {
    return newMissingParameterResult('updates');
  }

  const client = await getTwilioClient(accountSid);
  const participant = await client
    .conferences(conferenceSid)
    .participants(callSid)
    .fetch();
  try {
    await participant.update(parsedUpdates);
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

  return newOk({ message: `Participant updated: ${updates}` });
};

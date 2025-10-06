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
import { newOk } from '../Result';
import { newMissingParameterResult } from '../httpErrors';
import { getTwilioClient } from '../configuration/twilioConfiguration';

export const addParticipantHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { conferenceSid, from, to, label, callStatusSyncDocumentSid } = body;

  if (!conferenceSid) return newMissingParameterResult('conferenceSid');
  if (!from) return newMissingParameterResult('from');
  if (!to) return newMissingParameterResult('to');
  if (!callStatusSyncDocumentSid)
    return newMissingParameterResult('callStatusSyncDocumentSid');
  const client = await getTwilioClient(accountSid);
  const participant = await client.conferences(conferenceSid).participants.create({
    from,
    to,
    earlyMedia: true,
    endConferenceOnExit: false,
    label: label || 'external party', // Probably want to pass this from the caller
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    statusCallback: `${process.env.INTERNAL_HRM_URL}/lambda/twilio/account-scoped/conference/participantStatusCallback?callStatusSyncDocumentSid=${callStatusSyncDocumentSid}`,
  });

  return newOk({ message: 'New participant successfully added', participant });
};

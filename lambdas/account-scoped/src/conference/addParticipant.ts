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
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';

export const addParticipantHandler: AccountScopedHandler = async (
  { body, query },
  accountSid,
) => {
  const { conferenceSid, from, to, label } = body;
  const { callStatusSyncDocumentSid } = query;

  if (!conferenceSid) return newMissingParameterResult('conferenceSid');
  if (!from) return newMissingParameterResult('from');
  if (!to) return newMissingParameterResult('to');
  if (!callStatusSyncDocumentSid)
    return newMissingParameterResult('callStatusSyncDocumentSid');
  const client = await getTwilioClient(accountSid);
  const { hrm_base_url: hrmBaseUrl } =
    await retrieveServiceConfigurationAttributes(client);
  const statusCallback = `${hrmBaseUrl}/lambda/twilio/account-scoped/${accountSid}/conference/participantStatusCallback?callStatusSyncDocumentSid=${callStatusSyncDocumentSid}`;
  console.debug(
    `Adding participant added to conference ${accountSid} / ${conferenceSid}, from: ${from}, to: ${to}, callback URL: ${statusCallback}`,
  );
  const participant = await client.conferences(conferenceSid).participants.create({
    from,
    to,
    earlyMedia: true,
    endConferenceOnExit: false,
    label: label || 'external party', // Probably want to pass this from the caller
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    statusCallback,
  });
  console.info(
    `Participant added to conference ${accountSid} / ${conferenceSid}, from: ${from}, to: ${to}, callback URL: ${statusCallback}`,
    participant,
  );

  return newOk({ message: 'New participant successfully added', participant });
};

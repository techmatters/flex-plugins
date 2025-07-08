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
import { getSyncServiceSid, getTwilioClient } from '../configuration/twilioConfiguration';
import { newMissingParameterResult } from '../httpErrors';
import { newOk } from '../Result';

export const statusCallbackHandler: AccountScopedHandler = async (
  { body },
  accountSid,
) => {
  const { callStatusSyncDocumentSid, CallStatus } = body;

  const client = await getTwilioClient(accountSid);
  if (!callStatusSyncDocumentSid)
    return newMissingParameterResult('callStatusSyncDocumentSid');

  await client.sync.v1.services
    .get(await getSyncServiceSid(accountSid))
    .documents.get(callStatusSyncDocumentSid)
    .update({ data: { CallStatus } });

  return newOk('Ok');
};

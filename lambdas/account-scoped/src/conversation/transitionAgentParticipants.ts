/**
 * Copyright (C) 2021-2026 Technology Matters
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
import { AccountSID } from '@tech-matters/twilio-types';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { newMissingParameterResult } from '../httpErrors';
import { newErr, newOk } from '../Result';
import { transitionAgentParticipants } from './interactionChannelParticipants';

export const transitionAgentParticipantsHandler: AccountScopedHandler = async (
  { body: event },
  accountSid: AccountSID,
) => {
  const {
    flexInteractionSid,
    flexInteractionChannelSid,
    targetStatus,
    interactionChannelParticipantSid,
  } = event;

  if (!flexInteractionSid) {
    return newMissingParameterResult('flexInteractionSid');
  }
  if (!flexInteractionChannelSid) {
    return newMissingParameterResult('flexInteractionChannelSid');
  }
  if (!targetStatus) {
    return newMissingParameterResult('targetStatus');
  }

  try {
    const client = await getTwilioClient(accountSid);
    await transitionAgentParticipants(
      client,
      { flexInteractionSid, flexInteractionChannelSid },
      targetStatus,
      interactionChannelParticipantSid,
    );
    return newOk({ message: 'Participants transitioned successfully' });
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};

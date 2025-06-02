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

import fetchProtectedApi from './fetchProtectedApi';
import { getAseloFeatureFlags } from '../hrmConfig';

const validUpdates = ['endConferenceOnExit', 'hold', 'muted'] as const;
type ConferenceAddParticipantParams = {
  conferenceSid: string;
  to: string;
  from: string;
  callStatusSyncDocumentSid: string;
  label: string;
};
type ConferenceGetParticipantParams = { conferenceSid: string; callSid: string };
type ConferenceRemoveParticipantParams = { conferenceSid: string; callSid: string };
type ConferenceUpdateParticipantParams = {
  conferenceSid: string;
  callSid: string;
  updates: { [K in typeof validUpdates[number]]?: boolean };
};
export const addParticipant = async ({
  conferenceSid,
  to,
  from,
  callStatusSyncDocumentSid,
  label,
}: ConferenceAddParticipantParams) => {
  const body = {
    conferenceSid,
    to,
    from,
    callStatusSyncDocumentSid,
    label,
  };

  return fetchProtectedApi('/conference/addParticipant', body, {
    useTwilioLambda: getAseloFeatureFlags().use_twilio_lambda_for_conference_functions,
  });
};

export const getParticipant = async ({
  callSid,
  conferenceSid,
}: ConferenceGetParticipantParams): Promise<{ participant: any }> => {
  const body = {
    conferenceSid,
    callSid,
  };

  return fetchProtectedApi('/conference/getParticipant', body, {
    useTwilioLambda: getAseloFeatureFlags().use_twilio_lambda_for_conference_functions,
  });
};

export const removeParticipant = async ({ conferenceSid, callSid }: ConferenceRemoveParticipantParams) => {
  const body = {
    conferenceSid,
    callSid,
  };

  return fetchProtectedApi('/conference/removeParticipant', body, {
    useTwilioLambda: getAseloFeatureFlags().use_twilio_lambda_for_conference_functions,
  });
};

export const updateParticipant = async ({ callSid, conferenceSid, updates }: ConferenceUpdateParticipantParams) => {
  const body = {
    conferenceSid,
    callSid,
    updates: JSON.stringify(updates),
  };

  return fetchProtectedApi('/conference/updateParticipant', body, {
    useTwilioLambda: getAseloFeatureFlags().use_twilio_lambda_for_conference_functions,
  });
};

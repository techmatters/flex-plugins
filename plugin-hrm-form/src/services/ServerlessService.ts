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

/* eslint-disable sonarjs/prefer-immediate-return */
/* eslint-disable camelcase */
import { ITask, Notifications } from '@twilio/flex-ui';
import { DefinitionVersion, DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import fetchProtectedApi from './fetchProtectedApi';
import type { ChildCSAMReportForm, CounselorCSAMReportForm } from '../states/csam-report/types';
import { getHrmConfig } from '../hrmConfig';

type GetTranslationBody = { language: string };

// Returns translations json for Flex in string format
export const getTranslation = async (body: GetTranslationBody): Promise<string> => {
  const translation = await fetchProtectedApi('/getTranslation', body);
  return translation;
};

// Returns translations json for system messages in string format
export const getMessages = async (body: GetTranslationBody): Promise<string> => {
  const messages = await fetchProtectedApi('/getMessages', body);
  return messages;
};

type TransferChatStartBody = {
  taskSid: string;
  targetSid: string;
  ignoreAgent: string;
  mode: string;
};

type TrasferChatStartReturn = { closed: string; kept: string };

export const transferChatStart = async (body: TransferChatStartBody): Promise<TrasferChatStartReturn> => {
  try {
    const result = await fetchProtectedApi('/transferChatStart', body);
    return result;
  } catch (err) {
    Notifications.showNotification('TransferFailed', {
      reason: `Worker ${body.targetSid} is not available.`,
    });

    // propagate the error
    throw err;
  }
};

export const issueSyncToken = async (): Promise<string> => {
  const res = await fetchProtectedApi('/issueSyncToken');
  const syncToken = res.token;
  return syncToken;
};

/**
 * Sends a new message to the channel bounded to the provided taskSid. Optionally you can change the "from" value (defaul is "system").
 */
export const sendSystemMessage = async (body: { taskSid: ITask['taskSid']; message: string; from?: string }) => {
  const response = await fetchProtectedApi('/sendSystemMessage', body);

  return response;
};

export const getDefinitionVersion = async (version: DefinitionVersionId): Promise<DefinitionVersion> => {
  const { getFormDefinitionsBaseUrl } = getHrmConfig();
  return loadDefinition(getFormDefinitionsBaseUrl(version));
};

export const getDefinitionVersionsList = async (missingDefinitionVersions: DefinitionVersionId[]) =>
  Promise.all(
    missingDefinitionVersions.map(async version => {
      const definition = await getDefinitionVersion(version);
      return { version, definition };
    }),
  );

/**
 * Gets a recording s3 information from the corresponding call sid
 */
export const getExternalRecordingS3Location = async (callSid: string) => {
  const body = { callSid };
  const response = await fetchProtectedApi('/getExternalRecordingS3Location', body);
  return response;
};

/**
 * Send a CSAM report to IWF
 */
export const reportToIWF = async (form: CounselorCSAMReportForm) => {
  const body = {
    Reported_URL: form.webAddress,
    Reporter_Description: form.description,
    Reporter_Anonymous: form.anonymous === 'anonymous' ? 'Y' : 'N',
    Reporter_First_Name: form.firstName,
    Reporter_Last_Name: form.lastName,
    Reporter_Email_ID: form.email,
  };

  const response = await fetchProtectedApi('/reportToIWF', body);
  return response;
};

export const saveContactToSaferNet = async (payload: any): Promise<string> => {
  const body = { payload: JSON.stringify(payload) };
  const postSurveyUrl = await fetchProtectedApi('/saveContactToSaferNet', body);
  return postSurveyUrl;
};

export const selfReportToIWF = async (form: ChildCSAMReportForm, caseNumber: string) => {
  const body = {
    user_age_range: form.childAge,
    case_number: caseNumber,
  };

  const response = await fetchProtectedApi('/selfReportToIWF', body);
  return response;
};

export const getMediaUrl = async (serviceSid: string, mediaSid: string) => {
  const body = { serviceSid, mediaSid };

  const response = await fetchProtectedApi('/getMediaUrl', body);
  return response;
};

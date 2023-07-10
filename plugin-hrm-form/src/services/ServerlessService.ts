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
import { DefinitionVersionId, loadDefinition, DefinitionVersion } from 'hrm-form-definitions';

import fetchProtectedApi from './fetchProtectedApi';
import type { ChildCSAMReportForm, CounselorCSAMReportForm } from '../states/csam-report/types';
import { getHrmConfig } from '../hrmConfig';
import { formatFileNameAtAws } from '../utils';

type PopulateCounselorsReturn = { sid: string; fullName: string }[];

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 */
export const populateCounselors = async (): Promise<PopulateCounselorsReturn> => {
  const { helpline, currentWorkspace } = getHrmConfig();
  const body = {
    workspaceSID: currentWorkspace,
    helpline: helpline || '',
  };

  const { workerSummaries } = await fetchProtectedApi('/populateCounselors', body);

  return workerSummaries;
};

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

export const adjustChatCapacity = async (adjustment: 'increase' | 'decrease'): Promise<void> => {
  const { workerSid } = getHrmConfig();

  const body = {
    workerSid,
    adjustment,
  };

  const response = await fetchProtectedApi('/adjustChatCapacity', body);

  return response;
};

/**
 * Sends a new message to the channel bounded to the provided taskSid. Optionally you can change the "from" value (defaul is "system").
 */
export const sendSystemMessage = async (body: { taskSid: ITask['taskSid']; message: string; from?: string }) => {
  const response = await fetchProtectedApi('/sendSystemMessage', body);

  return response;
};

/**
 * Returns the task queues list for a given worker.
 */
export const listWorkerQueues = async (body: {
  workerSid: string;
}): Promise<{ workerQueues: { friendlyName: string }[] }> => {
  const response = await fetchProtectedApi('/listWorkerQueues', body);

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
 * Creates a new task (offline contact) in behalf of targetSid worker with attributes. Other attributes for routing are added to the task in the implementation of assignOfflineContact serverless function
 */
export const assignOfflineContactInit = async (targetSid: string, taskAttributes: ITask['attributes']) => {
  const body = {
    targetSid,
    taskAttributes: JSON.stringify(taskAttributes),
  };

  const response = await fetchProtectedApi('/assignOfflineContactInit', body);
  return response;
};

type OfflineContactComplete = {
  action: 'complete';
  taskSid: string;
  finalTaskAttributes: ITask['attributes'];
};

type OfflineContactRemove = {
  action: 'remove';
  taskSid: string;
};

/**
 * Completes or removes the task (offline contact) in behalf of targetSid worker updating with finalTaskAttributes.
 */
export const assignOfflineContactResolve = async (payload: OfflineContactComplete | OfflineContactRemove) => {
  const body =
    payload.action === 'complete'
      ? {
          ...payload,
          finalTaskAttributes: JSON.stringify(payload.finalTaskAttributes),
        }
      : payload;

  return fetchProtectedApi('/assignOfflineContactResolve', body);
};

/**
 * Gets the attributes of the target worker
 */
export const getWorkerAttributes = async (workerSid: string) => {
  const body = { workerSid };

  const response = await fetchProtectedApi('/getWorkerAttributes', body);
  return response;
};

/**
 * Deletes a file from the corresponding S3 bucket
 */
export const deleteFile = async (fileName: string) => {
  const body = { fileName };
  const response = await fetchProtectedApi('/deleteFile', body);
  return response;
};

/**
 * Gets a file download url from the corresponding S3 bucket
 */
export const getFileDownloadUrl = async (fileNameAtAws: string, fileName?: string) => {
  const getFileName = formatFileNameAtAws(fileNameAtAws);
  const body = { fileNameAtAws, fileName: fileName ? fileName : getFileName };
  const response = await fetchProtectedApi('/getFileDownloadUrl', body);
  return response;
};

/**
 * Gets a file upload url to the corresponding S3 bucket
 */
export const getFileUploadUrl = async (fileName: string, mimeType: string) => {
  const body = { fileName, mimeType };
  const response = await fetchProtectedApi('/getFileUploadUrl', body);
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

export const conferenceApi = {
  addParticipant: async ({
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

    const response = await fetchProtectedApi('/conference/addParticipant', body);
    return response;
  },

  getParticipant: async ({ callSid, conferenceSid }: ConferenceGetParticipantParams): Promise<{ participant: any }> => {
    const body = {
      conferenceSid,
      callSid,
    };

    const response = await fetchProtectedApi('/conference/getParticipant', body);
    return response;
  },

  removeParticipant: async ({ conferenceSid, callSid }: ConferenceRemoveParticipantParams) => {
    const body = {
      conferenceSid,
      callSid,
    };

    const response = await fetchProtectedApi('/conference/removeParticipant', body);
    return response;
  },

  updateParticipant: async ({ callSid, conferenceSid, updates }: ConferenceUpdateParticipantParams) => {
    const body = {
      conferenceSid,
      callSid,
      updates: JSON.stringify(updates),
    };

    const response = await fetchProtectedApi('/conference/updateParticipant', body);
    return response;
  },
};

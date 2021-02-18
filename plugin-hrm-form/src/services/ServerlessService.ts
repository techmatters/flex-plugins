/* eslint-disable sonarjs/prefer-immediate-return */
/* eslint-disable camelcase */
import { ITask, Notifications } from '@twilio/flex-ui';

import fetchProtectedApi from './fetchProtectedApi';
import { getConfig } from '../HrmFormPlugin';
import definitionVersions from '../formDefinitions';
import type { DefinitionVersion } from '../components/common/forms/types';

type PopulateCounselorsReturn = { sid: string; fullName: string }[];

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 */
export const populateCounselors = async (): Promise<PopulateCounselorsReturn> => {
  const { helpline, currentWorkspace } = getConfig();
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
  memberToKick: string;
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
  const { workerSid } = getConfig();

  const body = {
    workerSid,
    adjustment,
  };

  const response = await fetchProtectedApi('/adjustChatCapacity', body);

  return response;
};

export const assignMeContactlessTask = async () => {
  const { workerSid, helpline } = getConfig();

  const body = {
    targetSid: workerSid,
    transferTargetType: 'worker',
    helpline: helpline || '',
  };

  const response = await fetchProtectedApi('/createContactlessTask', body);

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
 * Function that mimics the fetching of a version definition for all the forms used within the app.
 * Later on this will be fetched in async way.
 */
export const getDefinitionVersion = async (version: string): Promise<DefinitionVersion> => definitionVersions[version];

export const getDefinitionVersionsList = async (missingDefinitionVersions: string[]) =>
  Promise.all(
    missingDefinitionVersions.map(async version => {
      const definition = await getDefinitionVersion(version);
      return { version, definition };
    }),
  );

export const assignOfflineContact = async (targetSid: string, finalTaskAttributes: ITask['attributes']) => {

  const body = {
    targetSid,
    finalTaskAttributes: JSON.stringify(finalTaskAttributes),
  };

  const response = await fetchProtectedApi('/assignOfflineContact', body);
  return response;
};

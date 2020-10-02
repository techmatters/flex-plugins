/* eslint-disable camelcase */
import { Notifications } from '@twilio/flex-ui';

import fetchProtectedApi from './fetchProtectedApi';
import { getConfig } from '../HrmFormPlugin';

type PopulateCounselorsReturn = { sid: string; fullName: string }[];

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 */
export const populateCounselors = async (): Promise<PopulateCounselorsReturn> => {
  const { serverlessBaseUrl, helpline, currentWorkspace, token } = getConfig();
  const url = `${serverlessBaseUrl}/populateCounselors`;
  const body = {
    workspaceSID: currentWorkspace,
    helpline: helpline || '',
    Token: token,
  };

  const { workerSummaries } = await fetchProtectedApi(url, body);

  return workerSummaries;
};

type GetTranslationBody = { language: string };

// Returns translations json for Flex in string format
export const getTranslation = async (body: GetTranslationBody): Promise<string> => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/getTranslation`;

  const translation = await fetchProtectedApi(url, { ...body, Token: token });
  return translation;
};

// Returns translations json for system messages in string format
export const getMessages = async (body: GetTranslationBody): Promise<string> => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/getMessages`;

  const messages = await fetchProtectedApi(url, { ...body, Token: token });
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
  const { serverlessBaseUrl, token } = getConfig();

  try {
    const url = `${serverlessBaseUrl}/transferChatStart`;

    const newTask = await fetchProtectedApi(url, { ...body, Token: token });
    return newTask;
  } catch (err) {
    Notifications.showNotification('TransferFailed', {
      reason: `Worker ${body.targetSid} is not available.`,
    });

    // propagate the error
    throw err;
  }
};

export const issueSyncToken = async (): Promise<string> => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/issueSyncToken`;

  const res = await fetchProtectedApi(url, { Token: token });
  const syncToken = res.token;
  return syncToken;
};

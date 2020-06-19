/* eslint-disable camelcase */
import { Notifications } from '@twilio/flex-ui';

import fetchProtectedApi from './fetchProtectedApi';
import { getConfig } from '../HrmFormPlugin';

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 * @returns {Promise< {sid: string, fullName: string}[] >}
 */
export const populateCounselors = async () => {
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

export const getTranslation = async body => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/getTranslation`;

  const translation = await fetchProtectedApi(url, { ...body, Token: token });
  return translation;
};

export const getMessages = async body => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/getMessages`;

  const messages = await fetchProtectedApi(url, { ...body, Token: token });
  return messages;
};

export const transferChatStart = async body => {
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

export const transferChatResolve = async body => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/transferChatResolve`;

  const closedTask = await fetchProtectedApi(url, { ...body, Token: token });
  return closedTask;
};

/**
 * @returns {Promise<string>}
 */
export const issueSyncToken = async () => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}/issueSyncToken`;

  const res = await fetchProtectedApi(url, { Token: token });
  const syncToken = res.token;
  return syncToken;
};

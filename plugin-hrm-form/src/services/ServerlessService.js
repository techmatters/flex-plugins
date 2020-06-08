/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
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

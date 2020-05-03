/* eslint-disable import/prefer-default-export */
import fetchProtectedApi from './fetchProtectedApi';

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 * @param {{serverlessBaseUrl: string,
 *helpline: string,
 *currentWorkspace: string,
 *getSsoToken: () => string }} configuration
 * @returns {Promise< {sid: string, fullName: string}[] >}
 */
export const populateCounselors = async configuration => {
  const { serverlessBaseUrl, helpline, currentWorkspace, getSsoToken } = configuration;
  const url = `${serverlessBaseUrl}/populateCounselors`;
  const body = {
    workspaceSID: currentWorkspace,
    helpline: helpline || '',
    Token: getSsoToken(),
  };

  const { workerSummaries } = await fetchProtectedApi(url, body);

  return workerSummaries;
};

export const getTranslation = async (configuration, body) => {
  const { serverlessBaseUrl, getSsoToken } = configuration;
  const url = `${serverlessBaseUrl}/getTranslation`;

  const translation = await fetchProtectedApi(url, { ...body, Token: getSsoToken() });
  return translation;
};

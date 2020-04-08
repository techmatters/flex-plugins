/* eslint-disable import/prefer-default-export */
import fetchProtectedApi from './fetchProtectedApi';

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 * @param {{serverlessBaseUrl: string,
 *helpline: string,
 *currentWorkspace: string,
 *getSsoToken: () => ({ token: string })}} configuration
 * @returns {{sid: string, fullName: string}[]}
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

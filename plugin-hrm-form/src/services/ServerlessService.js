/* eslint-disable import/prefer-default-export */
import fetchProtectedApi from './fetchProtectedApi';

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 * @param {{serverlessBaseUrl: string,
 *helpline: string,
 *currentWorkspace: string,
 *getSsoToken: () => ({ token: string })}} context
 * @returns {{sid: string, fullName: string}[]}
 */
export const populateCounselors = async context => {
  const { serverlessBaseUrl, helpline, currentWorkspace, getSsoToken } = context;
  const url = `${serverlessBaseUrl}/populateCounselors`;
  const body = {
    workspaceSID: currentWorkspace,
    helpline,
    Token: getSsoToken(),
  };

  const { workerSummaries } = await fetchProtectedApi(url, body);

  return workerSummaries;
};

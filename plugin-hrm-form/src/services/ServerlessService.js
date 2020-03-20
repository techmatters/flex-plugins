/* eslint-disable import/prefer-default-export */
import fetchProtectedApi from './fetchProtectedApi';
import { serverlessUrl } from '../private/secret';

/**
 * [Protected] Fetches the workers within a workspace and helpline.
 * @param {string} workspaceSID The sid of the workspace
 * @param {string} helpline The helpline of the current worker
 * @returns {{sid: string, fullName: string}[]}
 */
export const populateCounselors = async (workspaceSID, helpline) => {
  const url = `${serverlessUrl}/populateCounselors`;
  const body = {
    workspaceSID,
    helpline,
  };

  const { workerSummaries } = await fetchProtectedApi(url, body);

  return workerSummaries;
};

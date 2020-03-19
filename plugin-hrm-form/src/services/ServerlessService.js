/* eslint-disable import/prefer-default-export */
import fetchProtectedApi from './fetchProtectedApi';
import { serverlessUrl } from '../private/secret';

/**
 * [Protected] Fetches the workers within a workspace
 * @param {string} workspaceSID The sid of the workspace
 * @returns {{sid: string, friendlyName: string}[]}
 */
// export const fetchCounselors = async (workspaceSID, token) => {
export const populateCounselors = async workspaceSID => {
  const url = `${serverlessUrl}/populateCounselors`;
  const body = {
    workspaceSID,
  };

  const { prettyWorkers } = await fetchProtectedApi(url, body);

  return prettyWorkers;
};

/* eslint-disable import/prefer-default-export */
import secret, { serverlessUrl } from '../private/secret';

/**
 * @param {string} workspaceSID The sid of the workspace
 * @returns {{sid: string, friendlyName: string}[]}
 */
export const fetchCounselors = async workspaceSID => {
  const url = `${serverlessUrl}/populateCounselors?workspaceSID=${workspaceSID}`;

  const response = await fetch(url);
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message);
  }

  return responseJson.prettyWorkers;
};

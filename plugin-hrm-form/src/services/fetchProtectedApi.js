import { getConfig } from '../HrmFormPlugin';

/**
 * Factored out function that handles a protected api call hosted in serverless toolkit.
 * Will throw Error if server responses with and http error code.
 * @param {string} endPoint endpoint to fetch from (withouth the host part of url, e.g. "/cases/contacts").
 * @param {{ [k: string]: any }} body Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchProtectedApi = async (endPoint, body = {}) => {
  const { serverlessBaseUrl, token } = getConfig();
  const url = `${serverlessBaseUrl}${endPoint}`;

  const options = {
    method: 'POST',
    body: new URLSearchParams({ ...body, Token: token }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  };

  const response = await fetch(url, options);

  if (response.status === 403) {
    throw new Error('Server responded with 403 status (Forbidden)');
  }

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message);
  }

  return responseJson;
};

export default fetchProtectedApi;

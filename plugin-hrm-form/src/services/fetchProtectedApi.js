import { getConfig } from '../HrmFormPlugin';

class ProtectedApiError extends Error {
  constructor(message, options) {
    super(message, options);
    this.response = options.response;
  }
}

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
    throw new ProtectedApiError('Server responded with 403 status (Forbidden)', { response });
  }

  const responseJson = await response.json();

  if (!response.ok) {
    const cause = responseJson?.stack || null;
    throw new ProtectedApiError(responseJson.message, { cause, response });
  }

  return responseJson;
};

export default fetchProtectedApi;

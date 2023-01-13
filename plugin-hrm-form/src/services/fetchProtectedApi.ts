import { getConfig } from '../HrmFormPlugin';
import { ApiError, fetchApi } from './fetchApi';

export class ProtectedApiError extends ApiError {
  constructor(message, options: Pick<ApiError, 'body' | 'response'>, cause?: Error) {
    super(message, options, cause);

    this.name = 'ProtectedApiError';
  }
}

/**
 * Factored out function that handles a protected api call hosted in serverless toolkit.
 * Will throw Error if server responses with and http error code.
 * @param {string} endPoint endpoint to fetch from (withouth the host part of url, e.g. "/cases/contacts").
 * @param {{ [k: string]: any }} body Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchProtectedApi = async (endPoint, body: Record<string, string> = {}) => {
  const { serverlessBaseUrl, token } = getConfig();
  const options: RequestInit = {
    method: 'POST',
    body: new URLSearchParams({ ...body, Token: token }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  };
  try {
    return await fetchApi(new URL(serverlessBaseUrl), endPoint, options);
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.response?.status === 403 ? 'Server responded with 403 status (Forbidden)' : error.message;
      throw new ProtectedApiError(message, { response: error.response, body: error.body }, error);
    } else throw error;
  }
};

export default fetchProtectedApi;

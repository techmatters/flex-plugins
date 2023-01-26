import { getConfig } from '../HrmFormPlugin';
import { fetchApi } from './fetchApi';

/**
 * Factored out function that handles api calls hosted in HRM backend.
 * Will throw Error if server responses with http error code.
 * @param endPoint endpoint to fetch from (withouth the host part of url, e.g. "/cases/contacts").
 * @param {Partial<RequestInit>} options Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchHrmApi = (endPoint: string, options: Partial<RequestInit> = {}): Promise<any> => {
  const { hrmBaseUrl, token } = getConfig();

  return fetchApi(new URL(hrmBaseUrl), endPoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export default fetchHrmApi;

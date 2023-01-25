import * as path from 'path';

import { getConfig } from '../hrmConfig';
import { fetchApi } from './fetchApi';

/**
 * Factored out function that handles api calls hosted in the resources service.
 * Will throw Error if server responses with http error code.
 * @param endPoint resources endpoint to fetch from (without the host part of url, e.g. "/resource/MY_RESOURCE_ID").
 * @param {Partial<RequestInit>} options Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchResourcesApi = (endPoint: string, options: Partial<RequestInit> = {}): Promise<any> => {
  const { resourcesBaseUrl, token } = getConfig();

  return fetchApi(new URL(resourcesBaseUrl), path.join('resources', endPoint), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export default fetchResourcesApi;

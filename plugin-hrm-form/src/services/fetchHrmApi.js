import secret from '../private/secret';
import { getConfig } from '../HrmFormPlugin';

/**
 * Factored out function that handles api calls hosted in HRM backend.
 * Will throw Error if server responses with http error code.
 * @param {string} endPoint endpoint to fetch from (withouth the host part of url, e.g. "/cases/contacts").
 * @param {RequestInit} options Same options object that will be passed to the fetch function (here you can include the BODY of the request)
 * @returns {Promise<any>} the api response (if not error)
 */
const fetchHrmApi = async (endPoint, options = {}) => {
  const { hrmBaseUrl } = getConfig();
  const url = `${hrmBaseUrl}${endPoint}`;

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(secret)}`,
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, finalOptions);

  if (!response.ok) {
    const error = response.error();
    throw error;
  }

  let result;

  try {
    result = await response.json();
  } finally {
    return result;
  }
};

export default fetchHrmApi;

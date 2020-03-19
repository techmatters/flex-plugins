import { Manager } from '@twilio/flex-ui';

/**
 * Factored out function that handles a protected api call hosted in serverless toolkit.
 * Will throw Error if server responses with and http error code.
 * @param {string} url Url to fetch from.
 * @param {{}} body The body to send via fetch api (expected parameters for the route).
 * @returns {any}
 */
const fetchProtectedApi = async (url, body) => {
  const { token } = Manager.getInstance().store.getState().flex.session.ssoTokenPayload;
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

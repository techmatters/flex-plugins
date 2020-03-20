/**
 * Factored out function that handles a protected api call hosted in serverless toolkit.
 * Will throw Error if server responses with and http error code.
 * @param {string} url Url to fetch from.
 * @param {{Token: string}} body The body to send via fetch api plus the api token.
 * @returns {any} the api response (if not error)
 */
const fetchProtectedApi = async (url, body) => {
  if (!body.Token) {
    throw new Error("You can't acces a protected api without a token");
  }

  const options = {
    method: 'POST',
    body: new URLSearchParams(body),
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

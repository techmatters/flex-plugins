const fetch = require('node-fetch');

/**
 * Function that retrieves SuperSecure Token (SST). Returns an "userLogin" object with the user's
 * profile, state, and token. SuperSecure Tokens are valid for two weeks.
 * @param {string} baseUrl url from which to fetch the sst
 * @param {string} username username of user who's requesting token
 * @param {string} password password of user who's requestion token
 * @returns {Promise<any>} the api response (if not error)
 */

const fetchSST = async (baseUrl, username, password) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postUserLogin: {
        login: username,
        password,
        remember: 0,
        verify_level: 2,
      },
    }),
  };

  const url = `${baseUrl}/gdc/account/login`;
  const response = await fetch(url, options);
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status} - ${responseJson.message}`);
  }
  return responseJson;
};

/**
 * Retrieves Temporary Token (TT). Returns a "userToken" object containing user's temporary token.
 * Temporary tokens last 10 minutes.
 * @param {string} baseUrl url from which to fetch the sst
 * @param {string} superSecureToken user's SuperSecure token
 * @returns {Promise<any>} the api response (if not error)
 */

const getTT = async (baseUrl, superSecureToken) => {
  const options = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-GDC-AuthSST': superSecureToken,
    },
  };

  const url = `${baseUrl}/gdc/account/token`;
  const response = await fetch(url, options);
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`);
  }
  return responseJson;
};

/**
 * Logs user out and invalidates user's SST. Returns nothing if successful.
 *
 * @param {string} baseUrl url from which to fetch the sst
 * @param {object} sst user's SuperSecure token object
 * @param {string} tempToken user's temporary token
 * @returns {Promise<any>} the api response (if not error)
 */
const logOut = async (baseUrl, sst, tempToken) => {
  const { state } = sst.userLogin;
  const options = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-GDC-AuthSST': sst.userLogin.token,
      Cookie: `GDCAuthTT=${tempToken}`,
    },
  };

  const url = `${baseUrl}${state}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`);
  }
  return response;
};

module.exports = { fetchSST, getTT, logOut };

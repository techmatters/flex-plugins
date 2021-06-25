/**
 * Script for downloading Insight Reports. To use, naviagate to plugin-hrm-form/src/services/downloadInsights.js, and
 * run node downloadInsights.js {username} {password} {workspace ID} {object ID}.
 */

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
    throw new Error(responseJson.message);
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
    throw new Error(responseJson.message);
  }
  return responseJson;
};

/**
 * Exports the requested raw report. Returns an object containing the requested report's URI.
 *
 * @param {string} baseUrl url from which to fetch the sst
 * @param {string} tempToken user's temporary token
 * @param {string} workspaceID ID of user's workspace which contains the report
 * @param {string} objectID ID of requested report
 * @returns {Promise<any>} the api response (if not error)
 */
const rawReport = async (baseUrl, tempToken, workspaceId, objectId) => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: `GDCAuthTT=${tempToken}`,
    },
    body: JSON.stringify({
      report_req: {
        report: `/gdc/md/${workspaceId}/obj/${objectId}`,
      },
    }),
  };

  const url = `${baseUrl}/gdc/app/projects/${workspaceId}/execute/raw`;
  const response = await fetch(url, options);
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message);
  }
  return responseJson;
};

/**
 * Downloads requested report. Returns the requested report formatted as CSV.
 *
 * @param {string} baseUrl url from which to fetch the sst
 * @param {string} URI report's URI
 * @param {string} tempToken user's temporary token
 * @returns {Promise<any>} the api response (if not error)
 */

const downloadReport = async (baseUrl, URI, tempToken) => {
  const options = {
    headers: {
      Cookie: `GDCAuthTT=${tempToken}`,
    },
  };

  const url = `${baseUrl}/${URI}`;
  const response = await fetch(url, options);
  const responseJson = await response.text();

  if (!response.ok) {
    throw new Error(responseJson.message);
  }
  return responseJson;
};

/**
 * Logs user out and invalidates user's SST. Returns nothing if successful.
 *
 * @param {string} baseUrl url from which to fetch the sst
 * @param {string} sst user's SuperSecure token object
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
    throw new Error("Can't log out");
  }
  return response;
};

/**
 * Function that processes user's inputs and completes entire download process.
 * @returns {Promise<any>} the data from the requested report
 */

const main = async () => {
  try {
    const username = process.argv[2];
    const password = process.argv[3];
    const workerId = process.argv[4];
    const objectId = process.argv[5];
    const baseUrl = 'https://analytics.ytica.com';

    const sst = await fetchSST(baseUrl, username, password);
    const superSecureToken = sst.userLogin.token;
    const tt = await getTT(baseUrl, superSecureToken);
    const tempToken = tt.userToken.token;

    const rawReportObject = await rawReport(baseUrl, tempToken, workerId, objectId);
    const URI = rawReportObject.uri;
    const report = await downloadReport(baseUrl, URI, tempToken);

    await logOut(baseUrl, sst, tempToken);
    console.log(report);
    return report;
  } catch (error) {
    console.error(error);
    return error;
  }
};
main();

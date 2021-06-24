/**
 * Script for downloading Insight reports
 *
 * TODO:
 * - Figure out where script will be used, then figure out way to move from node to TS,
 * - Modify so user can provide workspace id and object id
 * - More robust error handling
 */


/**
 * Retrieves Super Secured Token -- which lasts for two weeks
 */
const fetch = require('node-fetch');


const fetchSST = async (baseUrl, username, password) => {
  const options = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      postUserLogin: {
        login: username,
        password: password,
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
 * Retrieves Temporary Token, which is valid for 10 minutes.
 */

const getTT = async (baseUrl,superSecureToken) => {
  const options = {
    headers: {
      'Accept': 'application/json',
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

/*
 * Gets raw report
 */
const rawReport = async (baseUrl, tempToken)=> {
  const workspaceId = 'fkg14xmswsy78us3gotb67cucw2e8s58';
  const objectId = '1414482';
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
 * Downloads report
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

const logOut = async (baseUrl, sst, tempToken) => {
  const state  = sst.userLogin.state;
  const options = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-GDC-AuthSST': sst.userLogin.token,
      Cookie: `GDCAuthTT=${tempToken}`,
    },
  };
  const url = `${baseUrl}${state}`
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Can't log out");
  }
  return response;
};

/**
 *
 * main
 */

const main = async () => {
  try {
    const username = process.argv[2]
    const password = process.argv[3]
    const baseUrl = 'https://analytics.ytica.com';

    const sst = await fetchSST(baseUrl, username, password);
    const superSecureToken = sst.userLogin.token;
    const tt = await getTT(baseUrl, superSecureToken);
    const tempToken = tt.userToken.token;

    const rawReportObject = await rawReport(baseUrl, tempToken);
    const URI = rawReportObject.uri;
    const report = await downloadReport(baseUrl, URI, tempToken);
    await logOut(baseUrl, sst, tempToken);
    console.log(report)
    return report;
  } catch (error) {
    console.error(error);
    return error;
    // handle your error in here the way you want, for example wait for 10 seconds, try again, unsuscribe, or whatever retry/cleanup your logic needs
  }
};
main();


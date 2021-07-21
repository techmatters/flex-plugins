/**
 * Script for downloading Insight Reports. To use, navigate to scripts/downloadInsights.js, and
 * run node downloadInsights.js --username {username} --password {password} -- workspaceID {workspace ID} --objectID {object ID}.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const { argv } = require('yargs')
  .usage(
    'node downloadInsights.js --username {username} --password {password} --workspaceID  {workspace ID} --objectID {object ID}',
  )
  .alias('u', 'username')
  .alias('p', 'password')
  .alias('w', 'workspaceID')
  .alias('o', 'objectID')
  .describe('u', 'Your Twilio Insights username.')
  .describe('p', 'Your Twilio Insights password.')
  .describe('w', 'The workspace ID of the Flex Insights Workspace you are working with.')
  .describe('o', 'The ID of the report that you are trying to download.');
const { fetchSST, getTT, logOut } = require('./insightsLogin');

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
    throw new Error(`${response.status} - ${response.statusText}`);
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
  const reportCSV = await response.text();

  if (!response.ok) {
    throw new Error(`${response.status} - ${response.statusText}`);
  }
  return reportCSV;
};

/**
 * Function that processes user's inputs and completes entire download process, writing a
 * CSV file.
 * @returns {Promise<any>} the data from the requested report
 */

const main = async (username, password, workspaceId, objectId) => {
  try {
    const baseUrl = 'https://analytics.ytica.com';
    const sst = await fetchSST(baseUrl, username, password);
    const superSecureToken = sst.userLogin.token;
    const tt = await getTT(baseUrl, superSecureToken);
    const tempToken = tt.userToken.token;
    const rawReportObject = await rawReport(baseUrl, tempToken, workspaceId, objectId);
    const report = await downloadReport(baseUrl, rawReportObject.uri, tempToken);
    fs.writeFile(`${objectId}_report.csv`, report, (err) => {
      if (err) throw err;
    });
    await logOut(baseUrl, sst, tempToken);
    return report;
  } catch (error) {
    console.error(error);
    return error;
  }
};
main(argv.username, argv.password, argv.workspaceID, argv.objectID);

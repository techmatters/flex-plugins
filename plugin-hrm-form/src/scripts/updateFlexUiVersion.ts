/* eslint-disable camelcase */
import { setFailed, info, error } from '@actions/core';
import fetch from 'node-fetch';

import packageLock from '../../package-lock.json';

const { TWILIO_ACCOUNT_SID } = process.env;
const { TWILIO_AUTH_TOKEN } = process.env;

const url = 'https://flex-api.twilio.com/v1/Configuration';

function toBase64(text) {
  return Buffer.from(text).toString('base64');
}

async function setUiVersion(uiVersion) {
  const payload = {
    account_sid: TWILIO_ACCOUNT_SID, // Required field
    ui_version: `~${uiVersion}`, // Twilio Flex sets the UI version using the '~' modifier
  };

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${toBase64(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  const response = await fetch(url, options);
  const responseJson = await response.json();

  if (response.status !== 200) throw responseJson;

  return responseJson.ui_version;
}

async function main() {
  const uiVersion = packageLock.dependencies['@twilio/flex-ui'].version;
  info(`Flex UI Version from lock: ${uiVersion}`);

  if (!uiVersion) {
    error('Flex UI Version not found');
    return setFailed('Flex UI Version not found');
  }

  return setUiVersion(uiVersion);
}

main()
  .then(uiVersion => info(`Flex UI Version set: ${uiVersion}`))
  .catch(err => {
    error(err);
    setFailed('Could not set Flex UI Version');
  });

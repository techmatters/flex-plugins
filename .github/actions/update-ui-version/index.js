/**
 * If changes are made to this file, it needs to be recompiled using @vercel/ncc (https://github.com/vercel/ncc).
 * 1) Install vercel/ncc by running this command in your terminal: npm i -g @vercel/ncc
 * 2) Compile your index.js file: ncc build index.js --license licenses.txt
 * For details see https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github 
 */ 

import { setFailed, info, error } from '@actions/core';
import fetch from 'node-fetch';

import packageLock from '../../../plugin-hrm-form/package-lock.json';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const url = 'https://flex-api.twilio.com/v1/Configuration';

function toBase64(text) {
  return Buffer.from(text).toString('base64');
}

async function setUiVersion(uiVersion) {
  const payload = {
    'account_sid': TWILIO_ACCOUNT_SID, // Required field
    'ui_version': `~${uiVersion}`, // Twilio Flex sets the UI version using the '~' modifier
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
  const data = await response.json();

  return data['ui_version'];
}

async function main() {
  const uiVersion = packageLock.dependencies['@twilio/flex-ui'].version;
  info(`>> UI Version from lock: ${uiVersion}`);

  if (!uiVersion) {
    error('>> Flex UI Version not found');
    return setFailed('>> Flex UI Version not found');
  }

  const result = await setUiVersion(uiVersion);
  return result;
}

main()
  .then(uiVersion => info(`>> Flex UI Version set: ${uiVersion}`))
  .catch(err => {
    error(err);
    setFailed('>> Could not set Flex UI Version');
  });
 
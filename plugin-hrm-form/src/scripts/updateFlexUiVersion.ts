/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

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
  // package-lock.json version 3 prefixes the packages name with node_modules/
  const uiVersion = (packageLock.packages['node_modules/@twilio/flex-ui'] || packageLock.packages['@twilio/flex-ui'])
    ?.version;
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

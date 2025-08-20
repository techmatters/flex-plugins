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

// eslint-disable-next-line import/no-unresolved
import { config } from '../config';

type Token = string;
type ChannelSid = string;
type Language = string;

export const finishChatTask = async (channelSid: ChannelSid, token: Token, language?: Language): Promise<Token> => {
  const body = { channelSid, Token: token, language };

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  // eslint-disable-next-line global-require
  const { SERVERLESS_URL } = require('../../private/secret');
  const response = await fetch(`${config.twilioServicesUrl ?? SERVERLESS_URL}/endChat`, options);
  const responseJson = await response.json();

  if (response.status === 403) {
    throw new Error('Server responded with 403 status (Forbidden)');
  }

  if (!response.ok) {
    const option = responseJson.stack ? { cause: responseJson.stack } : null;
    console.log('Error:', option);
    throw new Error(responseJson.message);
  }

  return responseJson;
};

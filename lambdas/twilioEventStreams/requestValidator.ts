/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { validateRequest } from 'twilio'; // Ensure twilio module is installed and imported
import { ALBEvent } from 'aws-lambda';

export const isValidTwilioRequest = (
  authToken: string | undefined,
  event: ALBEvent,
): boolean => {
  if (!authToken) {
    console.error('Missing authToken');
    return false;
  }

  const host = event.headers?.host;
  const queryStringParameters = event.queryStringParameters;

  if (!host) {
    console.error('Missing host in event headers');
    return false;
  }

  const buildQueryString = (
    params: { [key: string]: string | undefined } | undefined | null,
  ) => {
    if (!params) return ''; // Handle undefined or null case

    return Object.keys(params)
      .filter(key => params[key] !== undefined) // Filter out undefined values
      .map(
        key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key] as string),
      )
      .join('&');
  };

  const queryString = buildQueryString(queryStringParameters);
  const path = event.path;
  const webhookUrl = `https://${host}${path}${queryString ? `?${queryString}` : ''}`;

  //console.log('Webhook URL:', webhookUrl);
  const twilioSignature = event.headers?.['x-twilio-signature'];

  if (!twilioSignature) {
    console.error('Missing Twilio signature in event headers');
    return false;
  }

  //console.log('authToken:', authToken);
  //console.log('twilioSignature:', twilioSignature);
  //console.log('webhookUrl:', webhookUrl);
  //console.log('params:', {});
  const isValidRequest = validateRequest(authToken, twilioSignature, webhookUrl, {});

  if (!isValidRequest) {
    console.error('Twilio signature validation failed');
  } else {
    // console.log('Twilio signature validation succeeded');
  }

  return isValidRequest;
};

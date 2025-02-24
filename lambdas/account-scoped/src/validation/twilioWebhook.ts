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

import twilio from 'twilio';
import { newErr, newOk } from '../Result';
import { HttpRequestPipelineStep } from '../httpTypes';
import { getAccountAuthToken } from '../configuration/twilioConfiguration';

export const validateWebhookRequest: HttpRequestPipelineStep = async (
  request,
  { accountSid },
) => {
  const { headers, body, path } = request;
  const authToken = await getAccountAuthToken(accountSid);
  const {
    'x-twilio-signature': twiloSignature,
    'x-original-webhook-url': originalWebhookUrl,
    host,
  } = headers;
  if (!twiloSignature) {
    return newErr({ message: 'Missing Twilio signature', error: { statusCode: 400 } });
  }
  // Use the original webhook URL if it exists, otherwise assume the webhook is pointing directly to this lambda
  const isValid = twilio.validateRequest(
    authToken,
    twiloSignature,
    originalWebhookUrl || `https://${host}${path}`,
    body,
  );
  if (!isValid) {
    return newErr({ message: 'Request validation failed', error: { statusCode: 403 } });
  }
  return newOk(request);
};

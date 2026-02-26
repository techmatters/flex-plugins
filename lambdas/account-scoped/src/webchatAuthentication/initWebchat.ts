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

import { getTwilioClient } from '@tech-matters/twilio-configuration';
import type { AccountScopedHandler, HttpError } from '../httpTypes';
import type { AccountSID, ConversationSID } from '@tech-matters/twilio-types';
import { isErr, newErr, newOk, Result } from '../Result';

import { createToken, TOKEN_TTL_IN_SECONDS } from './createToken';

const contactWebchatOrchestrator = async ({
  addressSid,
  accountSid,
  formData,
  customerFriendlyName,
}: {
  accountSid: AccountSID;
  addressSid: string;
  formData: any;
  customerFriendlyName: string;
}): Promise<
  Result<HttpError, { conversationSid: ConversationSID; identity: string }>
> => {
  console.info('Calling Webchat Orchestrator');
  console.info(
    JSON.stringify(
      {
        addressSid,
        accountSid,
        formData,
        customerFriendlyName,
      },
      null,
      2,
    ),
  );
  try {
    const client = await getTwilioClient(accountSid);
    const orchestratorResponse = await client.flexApi.v2.webChannels.create({
      customerFriendlyName,
      addressSid,
      preEngagementData: JSON.stringify(formData),
      uiVersion: process.env.WEBCHAT_VERSION || '1.0.0',
      chatFriendlyName: 'Webchat widget',
    });
    console.info('Webchat Orchestrator successfully called', orchestratorResponse);

    const { conversationSid, identity } = orchestratorResponse;

    return newOk({
      conversationSid: conversationSid as ConversationSID,
      identity,
    });
  } catch (err) {
    const bodyError = err instanceof Error ? err.message : String(err);
    console.error('Error creating web channel', accountSid, bodyError);
    return newErr({
      message: bodyError,
      error: {
        statusCode: 500,
        cause: new Error(bodyError),
      },
    });
  }
};

const sendUserMessage = async (
  accountSid: AccountSID,
  conversationSid: ConversationSID,
  identity: string,
  messageBody: string,
) => {
  console.debug('Sending user message');
  const client = await getTwilioClient(accountSid);
  await client.conversations.v1.conversations(conversationSid).messages.create({
    body: messageBody,
    author: identity,
    xTwilioWebhookEnabled: 'true', // trigger webhook
  });
  console.info('(async) User message sent');
};

const sendWelcomeMessage = async (
  accountSid: AccountSID,
  conversationSid: ConversationSID,
  customerFriendlyName: string,
) => {
  console.debug(
    'Sending welcome message',
    accountSid,
    conversationSid,
    customerFriendlyName,
  );
  const client = await getTwilioClient(accountSid);
  await client.conversations.v1.conversations(conversationSid).messages.create({
    body: `Welcome ${customerFriendlyName}! An agent will be with you in just a moment.`,
    author: 'Concierge',
  });
  console.info('Welcome message sent', accountSid, conversationSid, customerFriendlyName);
};

export const initWebchatHandler: AccountScopedHandler = async (request, accountSid) => {
  console.info('Initiating webchat', accountSid);

  const customerFriendlyName = request.body?.formData?.friendlyName || 'Customer';

  let conversationSid: ConversationSID;
  let identity;

  // Hit Webchat Orchestration endpoint to generate conversation and get customer participant sid
  const result = await contactWebchatOrchestrator({
    accountSid,
    addressSid: 'IG1ba46f2d6828b42ddd363f5045138044', // Obvs needs to be SSM parameter
    formData: request.body?.formData,
    customerFriendlyName,
  });
  if (isErr(result)) {
    return result;
  }
  ({ identity, conversationSid } = result.data);

  // Generate token for customer
  const token = await createToken(accountSid, identity);

  // OPTIONAL — if user query is defined
  if (request.body?.formData?.query) {
    // use it to send a message in behalf of the user with the query as body
    sendUserMessage(
      accountSid,
      conversationSid,
      identity,
      request.body.formData.query,
    ).then(() =>
      // and then send another message from Concierge, letting the user know that an agent will help them soon
      sendWelcomeMessage(accountSid, conversationSid, customerFriendlyName),
    );
  }

  console.info('Webchat successfully initiated', accountSid);
  return newOk({
    token,
    conversationSid,
    expiration: Date.now() + TOKEN_TTL_IN_SECONDS * 1000,
  });
};

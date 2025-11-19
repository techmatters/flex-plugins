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

import { WebhookReceiverSession } from './webhookReceiver/client';
import { getS3Object } from '@tech-matters/s3';
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { InstagramMessageEvent } from '@tech-matters/twilio-types';
import crypto from 'crypto';

const INSTAGRAM_WEBHOOK_URL = `https://microservices.tl.techmatters.org:443/lambda/instagramWebhook`;
const { NODE_ENV, HRM_URL } = process.env;

let webhookReverseMap: Record<string, string>;

export type Body = InstagramMessageEvent & {
  xHubSignature?: string; // x-hub-signature header sent from Facebook
  bodyAsString?: string; // entire payload as string (preserves the ordering to decode and compare with xHubSignature)
};

export const sendInstagramMessage = async (
  helplineCode: string,
  { sessionId }: WebhookReceiverSession,
  messageText: string,
) => {
  if (!webhookReverseMap) {
    const webhookMap = JSON.parse(
      await getS3Object('aselo-webhooks', 'instagram-webhook-map.json'),
    );
    const webhookReverseMapEntries = Object.entries(webhookMap).map(([k, v]) => [v, k]);
    webhookReverseMap = Object.fromEntries(webhookReverseMapEntries);
  }
  const accountSid = await getSsmParameter(
    `/${NODE_ENV}/twilio/${helplineCode.toUpperCase()}/account_sid`,
  );
  const instagramId =
    webhookReverseMap[
      `${HRM_URL}/lambda/twilio/account-scoped/${accountSid}/customChannels/instagram/instagramToFlex`
    ];
  const currentTimestamp = Date.now();
  const body: InstagramMessageEvent = {
    object: 'instagram',
    entry: [
      {
        id: instagramId,
        messaging: [
          {
            sender: {
              id: `integration-test-sender-${sessionId}`,
            },
            recipient: {
              id: `integration-test-recipient-${sessionId}`,
            },
            timestamp: currentTimestamp,
            message: {
              mid: sessionId,
              text: messageText,
            },
          },
        ],
        time: currentTimestamp,
      },
    ],
    testSessionId: sessionId,
  };
  const bodyJson = JSON.stringify(body);
  const appSecret = await getSsmParameter(`FACEBOOK_APP_SECRET`);
  const signature = crypto.createHmac('sha1', appSecret).update(bodyJson).digest('hex');

  const response = await fetch(INSTAGRAM_WEBHOOK_URL, {
    method: 'POST',
    body: bodyJson,
    headers: {
      'x-hub-signature': `sha1=${signature}`,
    },
  });
  if (!response.ok) {
    console.warn(
      `Error sending Instagram message to API`,
      response.status,
      await response.text(),
    );
  }
  expect(response.ok).toBe(true);
};

export const expectInstagramMessageReceived = async (
  webhookReceiverSession: WebhookReceiverSession,
  messageText: string,
) =>
  webhookReceiverSession.expectRequestToBeReceived(
    record => {
      const parsedBody = JSON.parse(record.body);
      expect(parsedBody).toMatchObject({
        recipient: {
          id: `integration-test-recipient/${webhookReceiverSession.sessionId}`,
        },
        message: {
          text: messageText,
        },
      });
      return true;
    },
    { timeoutMilliseconds: 30 * 1000 },
  );

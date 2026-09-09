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
import { getSsmParameter } from '@tech-matters/ssm-cache';
import { verifyMessageExchange } from './verify';

const { NODE_ENV, HRM_URL } = process.env;

/**
 * Derives a unique test phone number from a session ID.
 * The number starts with '111' to comply with NZ staging's allowed test number regex:
 * modica:111\d{1,20}
 * Session IDs include a timestamp (e.g. 2024-01-01T12:00:00.000Z) which always
 * provides sufficient digits after filtering.
 */
const deriveSenderNumber = (sessionId: string): string => {
  const digits = sessionId.replace(/[^0-9]/g, '').slice(0, 15);
  if (digits.length === 0) {
    throw new Error(
      `Cannot derive a valid modica test sender number from session ID '${sessionId}': no digits found`,
    );
  }
  return `111${digits}`;
};

/**
 * Adds a '+' prefix if missing (mirrors Modica's sanitizeRecipientId function in flexToModica.ts)
 */
const sanitizeSenderNumber = (senderNumber: string): string =>
  senderNumber.charAt(0) !== '+' ? `+${senderNumber}` : senderNumber;

export const sendModicaMessage =
  (helplineCode: string, { sessionId }: WebhookReceiverSession) =>
  async (messageText: string) => {
    console.debug(`[${sessionId}] Sending Modica message: '${messageText}'`);
    const accountSidSsmKey = `/${NODE_ENV}/twilio/${helplineCode.toUpperCase()}/account_sid`;
    console.debug(
      `[${sessionId}] Looking up account sid via '${accountSidSsmKey}' to send: '${messageText}'`,
    );
    const accountSid = await getSsmParameter(accountSidSsmKey);
    const destination = await getSsmParameter(
      `/${NODE_ENV}/modica/${accountSid}/app_name`,
    );
    const webhookUrl = `${HRM_URL}/lambda/twilio/account-scoped/${accountSid}/customChannels/modica/modicaToFlex`;
    const senderNumber = deriveSenderNumber(sessionId);

    const body = {
      source: senderNumber,
      destination,
      content: messageText,
      testSessionId: sessionId,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(
        `[${sessionId}] Error sending Modica message to API: '${messageText}'`,
        response.status,
        await response.text(),
      );
    }
    expect(response.ok).toBe(true);
    console.debug(`[${sessionId}] Successfully Sent Modica message: '${messageText}'`);
  };

export const expectModicaMessageReceived =
  ({ sessionId, expectRequestToBeReceived }: WebhookReceiverSession) =>
  async (messageText: string) => {
    console.debug(`[${sessionId}] Expecting to receive Modica message: '${messageText}'`);
    const sanitizedSender = sanitizeSenderNumber(deriveSenderNumber(sessionId));
    return expectRequestToBeReceived(
      record => {
        const { destination, content } = JSON.parse(record.body);
        return destination === sanitizedSender && content === messageText;
      },
      { timeoutMilliseconds: 30 * 1000 },
    );
  };

export const verifyModicaMessageExchange = (
  session: WebhookReceiverSession,
  helplineCode: string,
) =>
  verifyMessageExchange(
    sendModicaMessage(helplineCode, session),
    expectModicaMessageReceived(session),
  );

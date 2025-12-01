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

import { WebhookRecord } from './types';
import { addMilliseconds } from 'date-fns/addMilliseconds';
import { isAfter } from 'date-fns/isAfter';
import { AssertionError } from 'node:assert';

const { HRM_URL, NODE_ENV } = process.env;
const WEBHOOK_RECEIVER_URL = `${HRM_URL}/lambda/integrationTestRunner`;

const getSessionRequests = async (sessionId: string): Promise<WebhookRecord[]> => {
  if (!HRM_URL) throw new Error('Configuration error: HRM_URL env var is required');
  const response = await fetch(WEBHOOK_RECEIVER_URL, {
    method: 'GET',
    headers: {
      'x-webhook-receiver-operation': 'RETRIEVE',
      'x-webhook-receiver-session-id': sessionId,
    },
  });
  if (response.ok) {
    return (await response.json()) as WebhookRecord[];
  } else {
    const text = await response.text();
    console.error('Unable to get webhook record', response, text);
    throw new Error(`Unable to get webhook record, status: ${response.status}, ${text}`);
  }
};

const delay = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

export const startWebhookReceiverSession = (helplineCode: string) => {
  const sessionId = `${helplineCode}-${NODE_ENV}-${new Date().toISOString().replaceAll(/[: \/]/g, '_')}`;
  let sessionActive = true;
  return {
    sessionId,
    getSessionRequests: () => {
      if (sessionActive) {
        return getSessionRequests(sessionId);
      } else {
        throw new Error('webhook receiver session ended');
      }
    },
    expectRequestToBeReceived: async (
      verifier: (record: WebhookRecord) => boolean,
      { timeoutMilliseconds }: { timeoutMilliseconds: number },
    ): Promise<void> => {
      const timeout = addMilliseconds(new Date(), timeoutMilliseconds);
      const delayMilliseconds = Math.min(timeoutMilliseconds / 5, 1000); // Try to check 5 times at least, but also never delay longer than a second
      let sessionRequests: WebhookRecord[] = [];
      while (isAfter(timeout, new Date())) {
        if (sessionActive) {
          sessionRequests = await getSessionRequests(sessionId);
          if (sessionRequests.some(verifier)) {
            console.debug(`[${sessionId}] Request found`);
            return;
          }
        } else {
          throw new Error('webhook receiver session ended');
        }
        await delay(delayMilliseconds);
      }
      const err = new AssertionError({
        message: 'Expected message not seen',
        actual: sessionRequests,
        expected: [],
      });
      console.error(err);
      throw err;
    },
    end: () => {
      sessionActive = false;
      // return deleteSessionRequests(sessionId);
    },
  };
};

export type WebhookReceiverSession = ReturnType<typeof startWebhookReceiverSession>;

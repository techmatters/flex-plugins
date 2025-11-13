import { WebhookDeleteResponse, WebhookRecord } from './types';
import { addMilliseconds } from 'date-fns/addMilliseconds';
import { isAfter } from 'date-fns/isAfter';
import { AssertionError } from 'node:assert';

const { WEBHOOK_RECEIVER_URL, NODE_ENV } = process.env;

const getSessionRequests = async (sessionId: string): Promise<WebhookRecord[]> => {
  if (!WEBHOOK_RECEIVER_URL)
    throw new Error('Configuration error: WEBHOOK_RECEIVER_URL env var is required');
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
    console.error('Unable to get webhook record', response, await response.text());
    throw new Error(`Unable to get webhook record, status: ${response.status}, ${text}`);
  }
};

const deleteSessionRequests = async (sessionId: string): Promise<number> => {
  if (!WEBHOOK_RECEIVER_URL)
    throw new Error('Configuration error: WEBHOOK_RECEIVER_URL env var is required');
  const response = await fetch(WEBHOOK_RECEIVER_URL, {
    method: 'DELETE',
    headers: {
      'x-webhook-receiver-operation': 'DELETE',
      'x-webhook-receiver-session-id': sessionId,
    },
  });

  if (response.ok) {
    return ((await response.json()) as WebhookDeleteResponse).deletedCount as number;
  } else {
    const text = await response.text();
    console.error('Unable to get webhook record', response, await response.text());
    throw new Error(`Unable to get webhook record, status: ${response.status}, ${text}`);
  }
};

const delay = (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));

export const startWebhookReceiverSession = (helplineCode: string) => {
  const sessionId = `${helplineCode}/${NODE_ENV}/${new Date().toISOString()}}`;
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
            return;
          }
        } else {
          throw new Error('webhook receiver session ended');
        }
        await delay(delayMilliseconds);
      }
      throw new AssertionError({
        message: 'Expected message not seen',
        actual: sessionRequests,
      });
    },
    end: () => {
      sessionActive = false;
      return deleteSessionRequests(sessionId);
    },
  };
};

export type WebhookReceiverSession = ReturnType<typeof startWebhookReceiverSession>;
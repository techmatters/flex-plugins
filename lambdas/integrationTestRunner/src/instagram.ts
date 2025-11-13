import { WebhookReceiverSession } from './webhookReceiver/client';
import { getS3Object } from '@tech-matters/s3';
import { getSsmParameter } from '@tech-matters/ssm-cache';

const INSTAGRAM_WEBHOOK_URL = `https://${process.env.HRM_URL}/lambda/instagramWebhook`;
const { NODE_ENV, HRM_URL } = process.env;

let webhookReverseMap: Record<string, string>;

// Types copied from account-scoped/customChannels/instagram
type InstagramMessageObject = {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number; // message timestamp
  message: {
    mid: string;
    text?: string; // the body of the message
    attachments?: { type: string; payload: { url: string } }[];
    is_deleted?: boolean;
  };
};

type InstagramMessageEntry = {
  time: number; // event timestamp
  id: string; // IGSID of the subscribed Instagram account
  messaging: [InstagramMessageObject];
};

type InstagramMessageEvent = {
  object: 'instagram';
  entry: [InstagramMessageEntry];
};

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
    const webhookMap = await getS3Object('aselo-webhooks', 'instagram-webhook-map.json');
    const webhookReverseMapEntries = Object.entries(webhookMap).map(([k, v]) => [v, k]);
    webhookReverseMap = Object.fromEntries(webhookReverseMapEntries);
  }
  const accountSid = await getSsmParameter(
    `${NODE_ENV}/twilio/${helplineCode.toUpperCase()}/account_sid`,
  );
  const instagramId =
    webhookReverseMap[
      `${HRM_URL}/lambda/account-scoped/${accountSid}/customChannels/instagram/instagramToFlex`
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
              id: `integration-test-sender/${sessionId}`,
            },
            recipient: {
              id: `integration-test-recipient/${sessionId}`,
            },
            timestamp: currentTimestamp,
            message: {
              mid: `${sessionId}`,
              text: messageText,
            },
          },
        ],
        time: currentTimestamp,
      },
    ],
  };

  await fetch(INSTAGRAM_WEBHOOK_URL, {
    body: JSON.stringify(body),
  });
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

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
import { startWebhookReceiverSession } from '../../webhookReceiver/client';
import { verifyInstagramMessageExchange } from '../../instagram';
import { verifyMessageExchange } from '../../verify';

const HELPLINE_CODE = 'NZ';
const TEST_TIMEOUT_MILLISECONDS = 5 * 60 * 1000;

let webhookReceiverSession: ReturnType<typeof startWebhookReceiverSession>;
let verifyExchange: ReturnType<typeof verifyMessageExchange>;

beforeEach(async () => {
  webhookReceiverSession = startWebhookReceiverSession(HELPLINE_CODE);
  verifyExchange = verifyInstagramMessageExchange(webhookReceiverSession, HELPLINE_CODE);
  jest.setTimeout(TEST_TIMEOUT_MILLISECONDS);
});

afterEach(async () => {
  await webhookReceiverSession.end();
});

test('NZ/staging instagram custom channel chatbot integration test', async () => {
  await verifyExchange([
    {
      sender: 'service-user',
      text: `Hello from integration test ${webhookReceiverSession.sessionId}`,
    },
    {
      sender: 'flex',
      text: `Kia ora, you've reached Youthline.`,
    },
    { sender: 'flex', 
    text: `If you'd like to talk to the Helpline, please respond 'Yes'. To contact the Fundraising and Marketing team, please respond 'No'.`},
    {
      sender: 'service-user',
      text: `Yes`,
    },
    {
      sender: 'flex',
      text: `Thank you, the next message will be from one of our counsellors. Your conversation will be recorded and may be monitored for quality purposes. For more information, here's a link to our privacy statement: https://youthline.co.nz/privacy-statements/"`,
    },
    {
      sender: 'flex',
      text: `You have selected to speak to the Helpline.`,
    },
    {
      sender: 'flex',
      text: `Your conversation is confidential, but if we feel that you or someone else is at serious risk of harm, we may have to link in with other services. We will let you know if that becomes necessary. \nDo you need urgent support? \n1. Yes \n2. No`,
    },
    {
      sender: 'service-user',
      text: `2`,
    },
    {
      sender: 'flex',
      text: `We will connect you with someone soon. Your conversation will be recorded and may be monitored for quality purposes. For more information, here is a link to our privacy statement: https://youthline.co.nz/privacy-statements/`,
    },
    {
      sender: 'flex',
      text: `You're now talking with Youthline.`,
    },
    {
      sender: 'flex',
      text: `Integration test run completed successfully. 🚀`,
    },
  ]);
});

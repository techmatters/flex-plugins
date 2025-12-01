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

const HELPLINE_CODE = 'JM';
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

test('JM/staging instagram custom channel chatbot integration test', async () => {
  await verifyExchange([
    {
      sender: 'service-user',
      text: `Hello from integration test ${webhookReceiverSession.sessionId}`,
    },
    {
      sender: 'flex',
      text: `Welcome to the helpline. To help us better serve you, please answer the following questions. You can say -prefer not to answer- (or type X) to any question.`,
    },
    { sender: 'flex', text: `Are you calling about yourself? Please answer Yes or No.` },
    {
      sender: 'service-user',
      text: `Y`,
    },
    {
      sender: 'flex',
      text: `How old are you?`,
    },
    {
      sender: 'service-user',
      text: `17`,
    },
    {
      sender: 'flex',
      text: `What is your gender?`,
    },
    {
      sender: 'service-user',
      text: `F`,
    },
    {
      sender: 'flex',
      text: `What parish are you located in?`,
    },
    {
      sender: 'service-user',
      text: `Kingston`,
    },
    {
      sender: 'flex',
      text: `How did you hear about us? Please select one: 1: Advertisement 2: Social Media 3: SMS/Text Message 4: Traditional Media 5: Word of Mouth`,
    },
    {
      sender: 'service-user',
      text: `1`,
    },
    {
      sender: 'flex',
      text: `We will transfer you now. Please hold for a counsellor.`,
    },
    {
      sender: 'flex',
      text: `Integration test run completed successfully. 🚀`,
    },
  ]);
});

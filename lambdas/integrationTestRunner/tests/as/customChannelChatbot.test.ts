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
import { startWebhookReceiverSession } from '../../src/webhookReceiver/client';
import {
  expectInstagramMessageReceived,
  sendInstagramMessage,
} from '../../src/instagram';

const HELPLINE_CODE = 'AS';

let webhookReceiverSession: ReturnType<typeof startWebhookReceiverSession>;

beforeEach(async () => {
  webhookReceiverSession = startWebhookReceiverSession(HELPLINE_CODE);
});

afterEach(async () => {
  await webhookReceiverSession.end();
});

test('JM_STG instagram custom channel chatbot integration test', async () => {
  await sendInstagramMessage(
    HELPLINE_CODE,
    webhookReceiverSession,
    `Hello from integration test ${webhookReceiverSession.sessionId}`,
  );
  await expectInstagramMessageReceived(webhookReceiverSession, 'Welcome to SafeSpot');
});

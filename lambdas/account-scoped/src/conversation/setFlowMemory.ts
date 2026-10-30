/**
 * Copyright (C) 2021-2026 Technology Matters
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

import type { AccountSID, ConversationSID } from '@tech-matters/twilio-types';
import { getTwilioClient } from '@tech-matters/twilio-configuration';
import { newErr, newOk } from '@tech-matters/result-type';
import type { AccountScopedHandler, HttpRequest } from '../httpTypes';
import { patchConversationAttributes } from './patchConversationAttributes';

// The conversation attribute holding the values a Studio flow keeps
export const FLOW_MEMORY_ATTRIBUTE = 'flowMemory';

// Keys Studio's Liquid can read as {{trigger.conversation.ChannelAttributes.flowMemory.<key>}}
const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

type FlowMemory = Record<string, unknown>;

/**
 * The values to keep: an object (a JSON body from Studio) or a JSON string (form-encoded
 * parameters, or as additionControlTaskAttributes is sent to captureChannelWithBot)
 */
const parseFlowMemory = (value: unknown): FlowMemory | string => {
  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return 'flowMemory is not valid JSON.';
    }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return 'flowMemory must be an object of the values to keep, e.g. {"entryPoint": "sms"}.';
  }
  const keys = Object.keys(parsed);
  if (keys.length === 0) return 'flowMemory has no values to keep.';
  const invalid = keys.filter(key => !KEY_PATTERN.test(key));
  if (invalid.length > 0) {
    return `flowMemory keys must be letters, numbers and underscores, not starting with a number: ${invalid.join(', ')}`;
  }
  return parsed as FlowMemory;
};

/**
 * Keeps values for the rest of a conversation's Studio executions: merges them into its
 * flowMemory attribute, which outlives the execution (e.g. a chatbot handing the conversation back
 * starts a new one, and keeps the conversation's attributes). Values with the same key are
 * replaced; others are kept. Only flowMemory is written: the capture and release attributes, the
 * bots' memories and release flags are left alone.
 *
 * Read in the flow as {{trigger.conversation.ChannelAttributes.flowMemory.<key>}}, or in the same
 * execution as {{widgets.<this widget>.parsed.flowMemory.<key>}}.
 */
export const setFlowMemoryHandler: AccountScopedHandler = async (
  { body }: HttpRequest,
  accountSid: AccountSID,
) => {
  const { conversationSid } = body ?? {};
  if (typeof conversationSid !== 'string' || !conversationSid.startsWith('CH')) {
    return newErr({
      message: 'conversationSid (CH...) is required: setFlowMemory is for Conversations.',
      error: { statusCode: 400 },
    });
  }
  const values = parseFlowMemory(body.flowMemory);
  if (typeof values === 'string') {
    return newErr({ message: values, error: { statusCode: 400 } });
  }

  try {
    const client = await getTwilioClient(accountSid);
    const conversation = await client.conversations.v1.conversations
      .get(conversationSid)
      .fetch();
    const attributes = JSON.parse(conversation.attributes || '{}');
    const current = attributes[FLOW_MEMORY_ATTRIBUTE];
    const flowMemory = {
      ...(typeof current === 'object' && current !== null && !Array.isArray(current)
        ? current
        : {}),
      ...values,
    };
    await patchConversationAttributes(client, conversation, {
      [FLOW_MEMORY_ATTRIBUTE]: flowMemory,
    });
    console.info(
      `[${accountSid}] flowMemory set on ${conversationSid as ConversationSID}: ${Object.keys(values).join(', ')}`,
    );
    return newOk({ flowMemory });
  } catch (err: any) {
    console.error('setFlowMemory failed', err);
    return newErr({ message: err.message, error: { statusCode: 500, cause: err } });
  }
};

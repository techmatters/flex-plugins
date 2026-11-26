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

import { filterSensitiveData, maskText } from '../../attributeFilterer';
import type { JsonValue } from '../../attributeFilterer';

// Shapes copied from real events in Datadog, with made-up numbers, IPs and emails
const HELPSEEKER_NUMBER = '+15550001234';
const HELPLINE_NUMBER = '+15559876543';

type StreamEvent = { type?: string; data: Record<string, any> };

const filter = (event: StreamEvent): StreamEvent =>
  filterSensitiveData(event as JsonValue) as StreamEvent;

const taskRouterEvent = (taskAttributes: Record<string, unknown>): StreamEvent => ({
  type: 'com.twilio.taskrouter.task.created',
  data: {
    account_sid: 'ACxxx',
    name: 'TasksCreated',
    payload: {
      task_sid: 'WTxxx',
      task_attributes: JSON.stringify(taskAttributes),
      worker_name: 'counselor@helpline.org',
    },
  },
});

const filteredTaskAttributes = (taskAttributes: Record<string, unknown>) =>
  JSON.parse(filter(taskRouterEvent(taskAttributes)).data.payload.task_attributes);

const errorLogEvent = (payload: JsonValue): StreamEvent => ({
  type: 'com.twilio.error-logs.error.logged',
  data: { account_sid: 'ACxxx', level: 'INFO', product_name: 'Functions', payload },
});

// Anything that still looks like a phone number, IP address or email
const UNMASKED_DATA =
  /(\+|%2B)\d{7,15}|\b(\d{1,3}\.){3}\d{1,3}\b|jane@mail\.com|64211234567|26300000000001/i;

describe('filterSensitiveData', () => {
  describe('TaskRouter task attributes', () => {
    test('masks the helpseeker attributes, nested ones included', () => {
      expect(
        filteredTaskAttributes({
          from: HELPSEEKER_NUMBER,
          caller: HELPSEEKER_NUMBER,
          name: HELPSEEKER_NUMBER,
          name_old: 'sip:+260000000001@10.20.30.40',
          customerAddress: `whatsapp:${HELPSEEKER_NUMBER}`,
          customerName: 'Jane Smith',
          outbound_to: HELPSEEKER_NUMBER,
          friendlyName: 'Jane',
          ip: '10.20.30.40',
          contactIdentifier: '10.20.30.41',
          conversations: { external_contact: HELPSEEKER_NUMBER, hang_up_by: 'Customer' },
        }),
      ).toStrictEqual({
        from: 'XXXXX1234',
        caller: 'XXXXX1234',
        name: 'XXXXX1234',
        name_old: 'XXXXX0.40',
        customerAddress: 'XXXXX1234',
        customerName: 'XXXXXmith',
        outbound_to: 'XXXXX1234',
        friendlyName: 'XXXXX',
        ip: 'XXXXX0.40',
        contactIdentifier: 'XXXXX0.41',
        conversations: { external_contact: 'XXXXX1234', hang_up_by: 'Customer' },
      });
    });

    test('removes customers (keeping external_id), memory and preEngagementData', () => {
      expect(
        filteredTaskAttributes({
          customers: {
            external_id: 'ext-1',
            phone: HELPSEEKER_NUMBER,
            email: 'jane@mail.com',
          },
          memory: { ip: '10.20.30.40' },
          preEngagementData: { ip: '10.20.30.40', email: 'jane@mail.com' },
          channelType: 'sms',
        }),
      ).toStrictEqual({ customers: { external_id: 'ext-1' }, channelType: 'sms' });
    });

    test('drops customers entirely when it has no external_id', () => {
      expect(
        filteredTaskAttributes({
          customers: { phone: HELPSEEKER_NUMBER },
          channelType: 'sms',
        }),
      ).toStrictEqual({ channelType: 'sms' });
    });

    test('masks phone numbers, IPs and emails under any other attribute, helpline number included', () => {
      expect(
        filteredTaskAttributes({
          to: HELPLINE_NUMBER,
          called: HELPLINE_NUMBER,
          ivr: { phone: HELPSEEKER_NUMBER },
          conversations: { conversation_attribute_1: `call me on ${HELPSEEKER_NUMBER}` },
          notes: ['jane@mail.com', 'from 10.20.30.40'],
          channelType: 'voice',
          language: 'en-US',
        }),
      ).toStrictEqual({
        to: 'XXXXX6543',
        called: 'XXXXX6543',
        ivr: { phone: 'XXXXX1234' },
        conversations: { conversation_attribute_1: 'call me on XXXXX1234' },
        notes: ['XXXXX.com', 'from XXXXX0.40'],
        channelType: 'voice',
        language: 'en-US',
      });
    });

    test('keeps empty and non-text values as they are', () => {
      expect(
        filteredTaskAttributes({ from: '', name: null, caller: 42, ignoreAgent: '' }),
      ).toStrictEqual({ from: '', name: null, caller: 42, ignoreAgent: '' });
    });

    test('leaves the event envelope alone', () => {
      const event = filter(taskRouterEvent({ from: HELPSEEKER_NUMBER }));

      expect(event.type).toBe('com.twilio.taskrouter.task.created');
      expect(event.data.name).toBe('TasksCreated');
      expect(event.data.payload.task_sid).toBe('WTxxx');
      expect(event.data.payload.worker_name).toBe('counselor@helpline.org');
    });

    test('masks task attributes that are not valid JSON as free text', () => {
      const event = taskRouterEvent({});
      event.data.payload.task_attributes = `{"from":"${HELPSEEKER_NUMBER}"`;

      expect(filter(event).data.payload.task_attributes).toBe('{"from":"XXXXX1234"');
    });
  });

  test('masks the contact address of Studio executions', () => {
    const event = filter({
      type: 'com.twilio.studio.flow.execution.started',
      data: {
        contact_channel_address: 'sip:+260000000001@10.20.30.40',
        flow_sid: 'FWxxx',
      },
    });

    expect(event.data).toStrictEqual({
      contact_channel_address: 'XXXXX0.40',
      flow_sid: 'FWxxx',
    });
  });

  test('masks the numbers and the text of Messaging events', () => {
    const event = filter({
      type: 'com.twilio.messaging.inbound-message.received',
      data: {
        from: HELPSEEKER_NUMBER,
        to: HELPLINE_NUMBER,
        body: 'I need help',
        messageSid: 'SMxxx',
      },
    });

    expect(event.data).toStrictEqual({
      from: 'XXXXX1234',
      to: 'XXXXX6543',
      body: 'XXXXX',
      messageSid: 'SMxxx',
    });
  });

  test('masks the author and text of Conversations events', () => {
    const event = filter({
      type: 'com.twilio.conversations.message.added',
      data: {
        Author: 'modica:+64211234567',
        Body: 'I need help',
        ConversationSid: 'CHxxx',
      },
    });

    expect(event.data).toStrictEqual({
      Author: 'XXXXX4567',
      Body: 'XXXXX',
      ConversationSid: 'CHxxx',
    });
  });

  test('masks phone numbers in any other event type', () => {
    const event = filter({
      type: 'com.twilio.voice.insights.call-summary.complete',
      data: {
        from: { caller: HELPSEEKER_NUMBER, country_code: 'US' },
        to: { callee: HELPLINE_NUMBER },
        call_sid: 'CAxxx',
      },
    });

    expect(event.data).toStrictEqual({
      from: { caller: 'XXXXX1234', country_code: 'US' },
      to: { callee: 'XXXXX6543' },
      call_sid: 'CAxxx',
    });
  });

  describe('error logs', () => {
    test.each([
      ['a Functions task attribute log', `Task attribute: from ${HELPSEEKER_NUMBER}`],
      [
        'a SIP address with an IP',
        'Task attribute: caller sip:+260000000001@10.20.30.40',
      ],
      [
        'a SIP address without a +',
        'Task attribute: name_old sip:26300000000001@10.20.30.40',
      ],
      [
        'a webchat IP and email',
        "preEngagementData {\n  ip: '10.20.30.40',\n  email: 'jane@mail.com' }",
      ],
      [
        'a full TaskRouter event dump',
        `event: {\\"TaskAttributes\\":\\"{\\\\\\"caller\\\\\\":\\\\\\"${HELPSEEKER_NUMBER}\\\\\\"}\\"}`,
      ],
      [
        'a Studio Send to Flex log',
        `Task attributes: { \\"name\\":\\"${HELPSEEKER_NUMBER}\\", \\"ip\\":\\"10.20.30.40\\"}`,
      ],
      [
        'an error message',
        `Participant address: ${HELPSEEKER_NUMBER}\nParticipant proxy address: 62640`,
      ],
      ['a URL-encoded number', 'POST /studio?From=%2B15550001234&To=%2b15559876543'],
      ['a Modica number', 'Task attribute: from modica:64211234567'],
      ['a Modica conversation name', 'uniqueName: modica/64211234567/1763550080822'],
      ['a URL-encoded Modica number', 'From=modica%3A64211234567'],
      [
        'a ZW Send to Flex log without +',
        'Task attributes: { \\"name_old\\": \\"sip:26300000000001@10.20.30.40\\",\\"name\\":\\"26300000000001\\"}',
      ],
      ['a URL-encoded SIP address', 'From=sip%3A26300000000001%4010.20.30.40'],
      ['a Functions task attribute without +', 'Task attribute: caller 26300000000001'],
      [
        'a 17-digit Messenger ID after a contact key',
        '\\"name\\":\\"26300000000001234\\"',
      ],
      ['a webhook parameter without +', 'From=26300000000001&To=62640'],
    ])('masks %s', (_description, message) => {
      const payload = filter(
        errorLogEvent(JSON.stringify({ service_sid: 'ZSxxx', message })),
      ).data.payload;

      expect(payload).not.toMatch(UNMASKED_DATA);
      expect(payload).toContain('ZSxxx');
    });

    test('masks payloads that arrive as objects, and the other fields of the event', () => {
      const errorLog = errorLogEvent({
        request_url: `https://hook?From=%2B15550001234&ip=10.20.30.40`,
      });
      errorLog.data.message = 'Failed to reach jane@mail.com';
      const event = filter(errorLog);

      expect(JSON.stringify(event)).not.toMatch(UNMASKED_DATA);
      expect(event.data.account_sid).toBe('ACxxx');
    });

    test('keeps short codes, SIDs, timestamps and dates', () => {
      const text =
        'proxy address: 62640, task WT0123456789abcdef, at 1763550080822 (2026-11-19T12:01:20.822Z)';

      expect(maskText(text)).toBe(text);
    });

    test('keeps stack trace locations', () => {
      const text = 'Error on line:handlerName at index.js:120:15 (Line/Number)';

      expect(maskText(text)).toBe(text);
    });

    test('handles long text without an @ quickly', () => {
      const longText = `${'a'.repeat(50000)} ${'1.'.repeat(25000)}`;
      const start = Date.now();

      maskText(longText);

      expect(Date.now() - start).toBeLessThan(500);
    });
  });

  test('masks phone numbers in values that are not events', () => {
    expect(filterSensitiveData({ type: 'unknown' })).toStrictEqual({ type: 'unknown' });
    expect(filterSensitiveData(`call ${HELPSEEKER_NUMBER}`)).toBe('call XXXXX1234');
  });
});

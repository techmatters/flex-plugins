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

import { filterSensitiveData, isJsonObject, maskText } from '../../sensitiveDataFilter';
import type { JsonObject, JsonValue } from '../../sensitiveDataFilter';

// Shapes copied from real events in Datadog, with made-up numbers, IPs and emails
const HELPSEEKER_NUMBER = '+15550001234';
const HELPLINE_NUMBER = '+15559876543';

// Reads a nested field of a masked event
const field = (value: JsonValue | undefined, ...path: string[]): JsonValue | undefined =>
  path.reduce<JsonValue | undefined>(
    (current, key) => (isJsonObject(current) ? current[key] : undefined),
    value,
  );

const maskedData = (event: JsonObject) => field(filterSensitiveData(event), 'data');

const taskRouterEvent = (taskAttributesJson: string): JsonObject => ({
  type: 'com.twilio.taskrouter.task.created',
  data: {
    account_sid: 'ACxxx',
    name: 'TasksCreated',
    payload: {
      task_sid: 'WTxxx',
      task_attributes: taskAttributesJson,
      worker_name: 'counselor@helpline.org',
    },
  },
});

const maskedTaskAttributes = (taskAttributesJson: string) =>
  field(maskedData(taskRouterEvent(taskAttributesJson)), 'payload', 'task_attributes');

const filteredTaskAttributes = (taskAttributes: JsonObject) =>
  JSON.parse(String(maskedTaskAttributes(JSON.stringify(taskAttributes))));

const errorLogEvent = (payload: JsonValue, otherFields: JsonObject = {}): JsonObject => ({
  type: 'com.twilio.error-logs.error.logged',
  data: {
    account_sid: 'ACxxx',
    level: 'INFO',
    product_name: 'Functions',
    payload,
    ...otherFields,
  },
});

const maskedErrorLogPayload = (payload: JsonValue) =>
  String(field(maskedData(errorLogEvent(payload)), 'payload'));

// Anything that still looks like a phone number, IP address or email
const UNMASKED_DATA =
  /(\+|%2B)\d{7,15}|\b(\d{1,3}\.){3}\d{1,3}\b|jane@mail\.com|64211234567|26300000000001|U4af498/i;

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
        customerName: 'XXXXX',
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
          ivr: { phone: HELPSEEKER_NUMBER, address: '26300000000001' },
          conversations: { conversation_attribute_1: `call me on ${HELPSEEKER_NUMBER}` },
          notes: ['jane@mail.com', 'from 10.20.30.40'],
          channelType: 'voice',
          language: 'en-US',
        }),
      ).toStrictEqual({
        to: 'XXXXX6543',
        called: 'XXXXX6543',
        ivr: { phone: 'XXXXX1234', address: 'XXXXX0001' },
        conversations: { conversation_attribute_1: 'call me on XXXXX1234' },
        notes: ['XXXXX', 'from XXXXX0.40'],
        channelType: 'voice',
        language: 'en-US',
      });
    });

    test('masks numbers under keys that look like phone numbers, keeping small counts', () => {
      expect(
        filteredTaskAttributes({
          phoneNumber: 15550001234,
          callerNumber: '15550001234',
          attemptNumber: 2,
        }),
      ).toStrictEqual({
        phoneNumber: 'XXXXX1234',
        callerNumber: 'XXXXX1234',
        attemptNumber: 2,
      });
    });

    test('masks names entirely, surnames and digits included', () => {
      expect(
        filteredTaskAttributes({
          customerName: 'Jane Doe 1990',
          name_old: 'Jane 2',
        }),
      ).toStrictEqual({ customerName: 'XXXXX', name_old: 'XXXXX' });
    });

    test('masks names entirely, surnames included', () => {
      expect(
        filteredTaskAttributes({
          customerName: 'Maria Lopez',
          firstName: 'Maria',
          friendlyName: 'Jane Doe',
          name: 'Jane Doe',
        }),
      ).toStrictEqual({
        customerName: 'XXXXX',
        firstName: 'XXXXX',
        friendlyName: 'XXXXX',
        name: 'XXXXX',
      });
    });

    test('masks numbers under helpseeker attributes and keeps the JSON valid', () => {
      expect(
        filteredTaskAttributes({ caller: 15550001234, from: 42, name: null }),
      ).toStrictEqual({
        caller: 'XXXXX1234',
        from: 'XXXXX',
        name: null,
      });
    });

    test('keeps empty and other non-text values as they are', () => {
      expect(
        filteredTaskAttributes({ from: '', name: null, ignoreAgent: '', priority: 42 }),
      ).toStrictEqual({ from: '', name: null, ignoreAgent: '', priority: 42 });
    });

    test('leaves the event envelope alone', () => {
      const event = filterSensitiveData(
        taskRouterEvent(JSON.stringify({ from: HELPSEEKER_NUMBER })),
      );

      expect(field(event, 'type')).toBe('com.twilio.taskrouter.task.created');
      expect(field(event, 'data', 'name')).toBe('TasksCreated');
      expect(field(event, 'data', 'payload', 'task_sid')).toBe('WTxxx');
      expect(field(event, 'data', 'payload', 'worker_name')).toBe(
        'counselor@helpline.org',
      );
    });

    test('masks task attributes that are not valid JSON as free text', () => {
      expect(maskedTaskAttributes(`{"from":"${HELPSEEKER_NUMBER}"`)).toBe(
        '{"from":"XXXXX1234"',
      );
    });
  });

  test('masks the contact address of Studio executions', () => {
    const data = maskedData({
      type: 'com.twilio.studio.flow.execution.started',
      data: {
        contact_channel_address: 'sip:+260000000001@10.20.30.40',
        flow_sid: 'FWxxx',
      },
    });

    expect(data).toStrictEqual({
      contact_channel_address: 'XXXXX0.40',
      flow_sid: 'FWxxx',
    });
  });

  test('masks the numbers and the text of Messaging events', () => {
    const data = maskedData({
      type: 'com.twilio.messaging.inbound-message.received',
      data: {
        from: HELPSEEKER_NUMBER,
        to: HELPLINE_NUMBER,
        body: 'I need help',
        messageSid: 'SMxxx',
      },
    });

    expect(data).toStrictEqual({
      from: 'XXXXX1234',
      to: 'XXXXX6543',
      body: 'XXXXX',
      messageSid: 'SMxxx',
    });
  });

  test('masks the author and text of Conversations events', () => {
    const data = maskedData({
      type: 'com.twilio.conversations.message.added',
      data: {
        Author: 'modica:+64211234567',
        Body: 'I need help',
        ConversationSid: 'CHxxx',
      },
    });

    expect(data).toStrictEqual({
      Author: 'XXXXX4567',
      Body: 'XXXXX',
      ConversationSid: 'CHxxx',
    });
  });

  test('masks the addresses, emails and attributes of Conversations participant events', () => {
    const data = maskedData({
      type: 'com.twilio.conversations.participant.added',
      data: {
        MessagingBinding: {
          Address: `whatsapp:${HELPSEEKER_NUMBER}`,
          ProxyAddress: `whatsapp:${HELPLINE_NUMBER}`,
        },
        Identity: 'jane@mail.com',
        Attributes: JSON.stringify({ friendlyName: 'Jane Doe', email: 'jane@mail.com' }),
        ParticipantSid: 'MBxxx',
      },
    });

    expect(data).toStrictEqual({
      MessagingBinding: { Address: 'XXXXX1234', ProxyAddress: 'whatsapp:XXXXX6543' },
      Identity: 'XXXXX',
      Attributes: JSON.stringify({ friendlyName: 'XXXXX', email: 'XXXXX' }),
      ParticipantSid: 'MBxxx',
    });
  });

  test('masks phone numbers, IPs and emails in any other event type', () => {
    const data = maskedData({
      type: 'com.twilio.voice.insights.call-summary.complete',
      data: {
        from: { caller: HELPSEEKER_NUMBER, country_code: 'US' },
        to: { callee: HELPLINE_NUMBER },
        client_edge: { ip: '10.20.30.40', identity: 'jane@mail.com' },
        call_sid: 'CAxxx',
      },
    });

    expect(data).toStrictEqual({
      from: { caller: 'XXXXX1234', country_code: 'US' },
      to: { callee: 'XXXXX6543' },
      client_edge: { ip: 'XXXXX0.40', identity: 'XXXXX' },
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
      ['a phone attribute without +', 'ivr: { \\"phone\\":\\"26300000000001\\" }'],
      ['an address without +', 'address: 26300000000001'],
      ['a friendlyName without +', 'friendlyName=26300000000001'],
      ['a LINE user ID', 'From=line:U4af4980629a1b2c3d4e5f60718293a4b'],
    ])('masks %s', (_description, message) => {
      const payload = maskedErrorLogPayload(
        JSON.stringify({ service_sid: 'ZSxxx', message }),
      );

      expect(payload).not.toMatch(UNMASKED_DATA);
      expect(payload).toContain('ZSxxx');
    });

    test('masks the message text and profile name of a logged webhook request', () => {
      const payload = maskedErrorLogPayload(
        JSON.stringify({
          error_code: '11200',
          webhook: {
            request: {
              url: 'https://hook.example.org/webhook',
              parameters: {
                Body: 'my name is Jane and I live at 5 Main St',
                From: `whatsapp:${HELPSEEKER_NUMBER}`,
                ProfileName: 'Jane Doe',
                MessageSid: 'SMxxx',
              },
            },
            response: { status_code: 502, body: 'Bad gateway' },
          },
        }),
      );

      expect(JSON.parse(payload)).toStrictEqual({
        error_code: '11200',
        webhook: {
          request: {
            url: 'https://hook.example.org/webhook',
            parameters: {
              Body: 'XXXXX',
              From: 'XXXXX1234',
              ProfileName: 'XXXXX',
              MessageSid: 'SMxxx',
            },
          },
          response: { status_code: 502, body: 'Bad gateway' },
        },
      });
    });

    test('masks WhatsApp webhook parameters: number, name and location', () => {
      const payload = maskedErrorLogPayload(
        JSON.stringify({
          webhook: {
            request: {
              parameters: {
                WaId: '15550001234',
                ProfileName: 'Jane Doe',
                Latitude: '-33.4489',
                Longitude: -70.6693,
                Address: '5 Main St',
                CallerName: 'JANE SMITH',
                FromCity: 'SANTIAGO',
                ForwardedFrom: '15550001234',
                NumMedia: '0',
              },
            },
          },
        }),
      );

      expect(JSON.parse(payload).webhook.request.parameters).toStrictEqual({
        WaId: 'XXXXX1234',
        ProfileName: 'XXXXX',
        Latitude: 'XXXXX',
        Longitude: 'XXXXX',
        Address: 'XXXXX',
        CallerName: 'XXXXX',
        FromCity: 'XXXXX',
        ForwardedFrom: 'XXXXX1234',
        NumMedia: '0',
      });
    });

    test('keeps error log payloads that need no masking exactly as they are', () => {
      const payload = '{ "id": 12345678901234567890, "error_code": "11200" }';

      expect(maskedErrorLogPayload(payload)).toBe(payload);
    });

    test.each([
      [
        'URL-encoded',
        'Body=I+want+to+kill+myself&From=whatsapp%3A%2B15550001234&ProfileName=Jane+Doe',
        'Body=XXXXX&From=whatsapp%3AXXXXX1234&ProfileName=XXXXX',
      ],
      [
        'logged as JSON',
        'parameters: {"Body":"I need help","ProfileName":"Jane Doe"}',
        'parameters: {"Body":"XXXXX","ProfileName":"XXXXX"}',
      ],
      [
        'logged as escaped JSON',
        'parameters: {\\"Body\\":\\"I need help\\"}',
        'parameters: {\\"Body\\":\\"XXXXX\\"}',
      ],
      [
        'with line breaks, quotes and accents',
        'parameters: {"Body":"hello\\nmy address is 5 Main St \\"quoted\\" \\u00e1","To":"62640"}',
        'parameters: {"Body":"XXXXX","To":"62640"}',
      ],
      [
        'escaped, with line breaks, quotes and accents',
        'parameters: {\\"Body\\":\\"hello\\\\nmy address \\\\\\"quoted\\\\\\" \\\\u00e1\\",\\"To\\":\\"62640\\"}',
        'parameters: {\\"Body\\":\\"XXXXX\\",\\"To\\":\\"62640\\"}',
      ],
      [
        'lowercase body',
        'Message: {"body":"I want to die","status":"sent"}',
        'Message: {"body":"XXXXX","status":"sent"}',
      ],
      [
        'cut short',
        'parameters: {"To":"62640","Body":"I need help with my ad',
        'parameters: {"To":"62640","Body":"XXXXX',
      ],
      [
        'a WhatsApp ID parameter',
        'WaId=15550001234&NumMedia=0',
        'WaId=XXXXX1234&NumMedia=0',
      ],
    ])('masks message text and profile names in free text, %s', (_d, text, expected) => {
      expect(maskText(text)).toBe(expected);
    });

    test('masks payloads that arrive as objects, and the other fields of the event', () => {
      const event = filterSensitiveData(
        errorLogEvent(
          { request_url: `https://hook?From=%2B15550001234&ip=10.20.30.40` },
          { message: 'Failed to reach jane@mail.com' },
        ),
      );

      expect(JSON.stringify(event)).not.toMatch(UNMASKED_DATA);
      expect(field(event, 'data', 'account_sid')).toBe('ACxxx');
    });

    test('masks every digit of numbers longer than 15 digits but the last 4', () => {
      expect(maskText('address: +12345678901234567890')).toBe('address: XXXXX7890');
    });

    test('keeps timestamps after "from" and "to" in sentences', () => {
      const text = 'updated from 1763550080822 to 1763550099999';

      expect(maskText(text)).toBe(text);
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
      const longText = `${'a'.repeat(50000)} ${'1.'.repeat(25000)} ${'"Body":"'.repeat(20000)}`;
      const start = Date.now();

      maskText(longText);

      // Takes a few ms; a backtracking regex takes seconds. The margin covers slow CI runners.
      expect(Date.now() - start).toBeLessThan(2000);
    });
  });

  test('masks values that are not events', () => {
    expect(filterSensitiveData({ type: 'unknown' })).toStrictEqual({ type: 'unknown' });
    expect(filterSensitiveData(`call ${HELPSEEKER_NUMBER}`)).toBe('call XXXXX1234');
  });
});

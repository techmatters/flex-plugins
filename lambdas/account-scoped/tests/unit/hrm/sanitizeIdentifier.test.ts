/**
 * Copyright (C) 2021-2023 Technology Matters
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

import each from 'jest-each';
import {
  sanitizeIdentifierFromTask,
  sanitizeIdentifierFromTrigger,
  TriggerEvent,
} from '../../../src/hrm/sanitizeIdentifier';
import 'jest';
import { isErr } from '../../../src/Result';

describe('sanitizeIdentifierFromTask', () => {
  const testCases: {
    channelType: string;
    description: string;
    taskAttributes: {
      name?: string;
      from?: string;
      preEngagementData?: { contactIdentifier?: string };
    };
    expected?: string;
    expectErr?: boolean;
  }[] = [
    {
      channelType: 'invalid',
      description: 'returns error if channelType is invalid',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'default',
      description: 'returns empty',
      taskAttributes: { name: undefined, from: undefined },
      expected: '',
    },
    {
      channelType: 'voice',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'voice',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: '+123 456-789', from: 'not this!' },
      expected: '+123456789',
    },
    {
      channelType: 'voice',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: '+123 456-789' },
      expected: '+123456789',
    },
    {
      channelType: 'voice',
      description: 'sanitizes sip calls',
      taskAttributes: { name: 'sip:+123 456-789@example.com', from: 'not this!' },
      expected: '+123456789',
    },
    {
      channelType: 'sms',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'sms',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: '+123 456-789', from: 'not this!' },
      expected: '+123456789',
    },
    {
      channelType: 'sms',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: '+123 456-789' },
      expected: '+123456789',
    },
    {
      channelType: 'whatsapp',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'whatsapp',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: 'whatsapp:+123456789', from: 'not this!' },
      expected: '+123456789',
    },
    {
      channelType: 'whatsapp',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: 'whatsapp:+123456789' },
      expected: '+123456789',
    },
    {
      channelType: 'modica',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'modica',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: 'modica:+123456789', from: 'not this!' },
      expected: '+123456789',
    },
    {
      channelType: 'modica',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: 'modica:+123456789' },
      expected: '+123456789',
    },
    {
      channelType: 'messenger',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'messenger',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: 'messenger:123456789', from: 'not this!' },
      expected: '123456789',
    },
    {
      channelType: 'messenger',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: 'messenger:123456789' },
      expected: '123456789',
    },
    {
      channelType: 'instagram',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'instagram',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: 'instagram:123456789', from: 'not this!' },
      expected: '123456789',
    },
    {
      channelType: 'instagram',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: 'instagram:123456789' },
      expected: '123456789',
    },
    {
      channelType: 'line',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'line',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: 'line:123456789', from: 'not this!' },
      expected: 'line:123456789',
    },
    {
      channelType: 'line',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: 'line:123456789' },
      expected: 'line:123456789',
    },
    {
      channelType: 'telegram',
      description:
        'returns error taskAttributes.name and taskAttributes.from are missing',
      taskAttributes: { name: undefined, from: undefined },
      expectErr: true,
    },
    {
      channelType: 'telegram',
      description: 'sanitizes taskAttributes.name if present',
      taskAttributes: { name: 'telegram:123456789', from: 'not this!' },
      expected: '123456789',
    },
    {
      channelType: 'telegram',
      description: 'sanitizes taskAttributes.from if taskAttributes.name is missing',
      taskAttributes: { name: undefined, from: 'telegram:123456789' },
      expected: '123456789',
    },
    {
      channelType: 'web',
      description: 'returns empty if no preEngagementData.contactIdentifier',
      taskAttributes: { name: undefined, from: undefined, preEngagementData: {} },
      expected: '',
    },
    {
      channelType: 'web',
      description: 'sanitizes ip',
      taskAttributes: {
        name: 'not this!',
        from: 'not this!',
        preEngagementData: {
          contactIdentifier: '1.2.3.4',
        },
      },
      expected: '1.2.3.4',
    },
    {
      channelType: 'web',
      description: 'sanitizes taskAttributes.name if present - email',
      taskAttributes: {
        name: 'not this!',
        from: 'not this!',
        preEngagementData: {
          contactIdentifier: 'example@example.com',
        },
      },
      expected: 'example@example.com',
    },
    {
      channelType: 'web',
      description: 'sanitizes taskAttributes.name if present - number',
      taskAttributes: {
        name: 'not this!',
        from: 'not this!',
        preEngagementData: {
          contactIdentifier: '+1 234 56789',
        },
      },
      expected: '+1 234 56789',
    },
  ];
  each(testCases).test(
    '$channelType - $description',
    async ({ channelType, taskAttributes, expected, expectErr }) => {
      const result = sanitizeIdentifierFromTask({ channelType, taskAttributes });

      if (expectErr) {
        expect(isErr(result)).toBeTruthy();
      } else {
        expect(result.unwrap()).toBe(expected);
      }
    },
  );
});

describe('sanitizeIdentifierFromTrigger', () => {
  const testCases: {
    channelType: string;
    description: string;
    trigger: TriggerEvent['trigger'];
    expected?: string;
    expectErr?: boolean;
  }[] = [
    {
      channelType: 'invalid',
      description: 'returns error if trigger is not supported',
      trigger: {} as any,
      expectErr: true,
    },
    {
      channelType: 'voice',
      description: 'sanitizes From',
      trigger: { call: { From: '+123 456-789', Caller: 'not this!' } },
      expected: '+123456789',
    },
    {
      channelType: 'voice',
      description: 'sanitizes sip calls',
      trigger: { call: { From: 'sip:+123 456-789@example.com', Caller: 'not this!' } },
      expected: '+123456789',
    },
    {
      channelType: 'sms',
      description: 'chat - sanitizes channel attributes "from"',
      trigger: {
        message: { ChannelAttributes: { channel_type: 'sms', from: '+123 456-789' } },
      },
      expected: '+123456789',
    },
    {
      channelType: 'sms',
      description: 'conversation - sanitizes conversation "Author"',
      trigger: {
        conversation: { Author: '+123 456-789' },
      },
      expected: '+123456789',
    },
    {
      channelType: 'whatsapp',
      description: 'chat - sanitizes channel attributes "from"',
      trigger: {
        message: {
          ChannelAttributes: { channel_type: 'whatsapp', from: 'whatsapp:+123456789' },
        },
      },
      expected: '+123456789',
    },
    {
      channelType: 'whatsapp',
      description: 'conversation - sanitizes conversation "Author"',
      trigger: {
        conversation: { Author: 'whatsapp:+123456789' },
      },
      expected: '+123456789',
    },
    {
      channelType: 'modica',
      description: 'chat - sanitizes channel attributes "from"',
      trigger: {
        message: {
          ChannelAttributes: { channel_type: 'modica', from: 'modica:+123456789' },
        },
      },
      expected: '+123456789',
    },
    {
      channelType: 'modica',
      description: 'conversation - sanitizes conversation "Author"',
      trigger: {
        conversation: { Author: 'modica:+123456789' },
      },
      expected: '+123456789',
    },
    {
      channelType: 'messenger',
      description: 'chat - sanitizes channel attributes "from"',
      trigger: {
        message: {
          ChannelAttributes: { channel_type: 'messenger', from: 'messenger:123456789' },
        },
      },
      expected: '123456789',
    },
    {
      channelType: 'messenger',
      description: 'conversation - sanitizes conversation "Author"',
      trigger: {
        conversation: { Author: 'messenger:123456789' },
      },
      expected: '123456789',
    },
    {
      channelType: 'instagram',
      description: 'chat - sanitizes channel attributes "from"',
      trigger: {
        message: {
          ChannelAttributes: { channel_type: 'instagram', from: 'instagram:123456789' },
        },
      },
      expected: '123456789',
    },
    {
      channelType: 'instagram',
      description: 'conversation - sanitizes conversation "Author"',
      trigger: {
        conversation: { Author: 'instagram:123456789' },
      },
      expected: '123456789',
    },
    {
      channelType: 'line',
      description: 'chat - sanitizes channel attributes "from"',
      trigger: {
        message: {
          ChannelAttributes: { channel_type: 'line', from: 'line:123456789' },
        },
      },
      expected: 'line:123456789',
    },
    {
      channelType: 'line',
      description: 'conversation - sanitizes conversation "Author"',
      trigger: {
        conversation: { Author: 'line:123456789' },
      },
      expected: 'line:123456789',
    },
    {
      channelType: 'telegram',
      description: 'chat - sanitizes channel attributes "from"',
      trigger: {
        message: {
          ChannelAttributes: { channel_type: 'telegram', from: 'telegram:123456789' },
        },
      },
      expected: '123456789',
    },
    {
      channelType: 'telegram',
      description: 'conversation - sanitizes conversation "Author"',
      trigger: {
        conversation: { Author: 'telegram:123456789' },
      },
      expected: '123456789',
    },
    {
      channelType: 'web',
      description: 'chat - sanitizes ip',
      trigger: {
        message: {
          ChannelAttributes: {
            channel_type: 'web',
            from: 'not this!',
            pre_engagement_data: { contactIdentifier: '1.2.3.4' },
          },
        },
      },
      expected: '1.2.3.4',
    },
    {
      channelType: 'web',
      description: 'chat - sanitizes email',
      trigger: {
        message: {
          ChannelAttributes: {
            channel_type: 'web',
            from: 'not this!',
            pre_engagement_data: { contactIdentifier: 'example@example.com' },
          },
        },
      },
      expected: 'example@example.com',
    },
    {
      channelType: 'web',
      description: 'chat - sanitizes number',
      trigger: {
        message: {
          ChannelAttributes: {
            channel_type: 'web',
            from: 'not this!',
            pre_engagement_data: { contactIdentifier: '+1 234 56789' },
          },
        },
      },
      expected: '+1 234 56789',
    },
    {
      channelType: 'web',
      description: 'conversation - returns error (not supported)',
      trigger: {
        conversation: { Author: 'not this!' },
      },
      expectErr: true,
    },
  ];
  each(testCases).test(
    '$channelType - $description',
    async ({ channelType, trigger, expected, expectErr }) => {
      const result = sanitizeIdentifierFromTrigger({ channelType, trigger });

      if (expectErr) {
        expect(isErr(result)).toBeTruthy();
      } else {
        expect(result.unwrap()).toBe(expected);
      }
    },
  );
});

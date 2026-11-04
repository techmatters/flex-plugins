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

import { describe, expect, test } from 'vitest';
import { formatTemplateJson } from './jsonFormat';
import { taskAttributesProblem } from '@tech-matters/form-builder-shared/flows/taskAttributes';

describe('formatTemplateJson', () => {
  test('lays out plain JSON as Studio writes it', () => {
    expect(formatTemplateJson('{"a":1,"b":[true,null,{"c":"x"}],"d":{},"e":[]}')).toBe(
      [
        '{',
        '  "a": 1,',
        '  "b": [',
        '    true,',
        '    null,',
        '    {',
        '      "c": "x"',
        '    }',
        '  ],',
        '  "d": {},',
        '  "e": []',
        '}',
      ].join('\n'),
    );
  });

  test('keeps Liquid and Terraform placeholders, strings and key order exactly as written', () => {
    const attributes =
      '{ "channelType":"{{trigger.conversation.ChannelAttributes.channel_type}}" ,"helpline": "${helpline}",' +
      ' "memory": {{trigger.conversation.ChannelAttributes.memory | to_json}}, "2": "a \\"quoted\\" \\u00e9", "1": ${jsonencode({a = 1})} }';
    const formatted = formatTemplateJson(attributes)!;
    expect(formatted).toBe(
      [
        '{',
        '  "channelType": "{{trigger.conversation.ChannelAttributes.channel_type}}",',
        '  "helpline": "${helpline}",',
        '  "memory": {{trigger.conversation.ChannelAttributes.memory | to_json}},',
        '  "2": "a \\"quoted\\" \\u00e9",',
        '  "1": ${jsonencode({a = 1})}',
        '}',
      ].join('\n'),
    );
    // Formatting again changes nothing
    expect(formatTemplateJson(formatted)).toBe(formatted);
  });

  test('valid task attributes stay valid', () => {
    const formatted = formatTemplateJson(
      '{"language":"${task_language}","memory":{{trigger.memory | to_json}},"ignoreAgent":""}',
    )!;
    expect(formatted.split('\n')).toHaveLength(5);
    expect(taskAttributesProblem(formatted)).toBeUndefined();
  });

  test("leaves what it can't lay out", () => {
    expect(formatTemplateJson('{"a": "unclosed}')).toBeUndefined();
    expect(formatTemplateJson('{"a": {{trigger.x}')).toBeUndefined();
    expect(formatTemplateJson('   ')).toBeUndefined();
  });
});

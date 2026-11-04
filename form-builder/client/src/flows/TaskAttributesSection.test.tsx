// @vitest-environment jsdom

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

import { useState } from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { TaskAttributes } from '@tech-matters/form-builder-shared/flows/model';
import { TaskAttributesSection } from './TaskAttributesSection';

afterEach(cleanup);

const imported = '{"channelType": "voice","memory": {{trigger.memory | to_json}}}';

const Harness = () => {
  const [attributes, setAttributes] = useState<TaskAttributes | undefined>({
    json: imported,
    imported,
    source: { kind: 'inline' },
  });
  return (
    <TaskAttributesSection attributes={attributes} readOnly={false} onChange={setAttributes} />
  );
};

const box = () =>
  screen.getByRole('textbox', { name: 'Task attributes JSON' }) as HTMLTextAreaElement;

describe('task attributes JSON', () => {
  test('is laid out when you leave it after an edit, and only if it is valid', () => {
    render(<Harness />);

    // Just clicking in and out of imported attributes changes nothing
    fireEvent.focus(box());
    fireEvent.blur(box());
    expect(box().value).toBe(imported);
    expect(screen.queryByText(/Changed on the board/)).toBeNull();

    // Not valid: left as typed
    fireEvent.change(box(), { target: { value: '{"channelType": "voice",' } });
    fireEvent.blur(box());
    expect(box().value).toBe('{"channelType": "voice",');

    fireEvent.change(box(), {
      target: {
        value:
          '{"channelType":"voice","memory":{{trigger.memory | to_json}},"helpline":"${helpline}"}',
      },
    });
    fireEvent.blur(box());
    expect(box().value).toBe(
      [
        '{',
        '  "channelType": "voice",',
        '  "memory": {{trigger.memory | to_json}},',
        '  "helpline": "${helpline}"',
        '}',
      ].join('\n'),
    );
  });
});

describe("the channel's task attributes or the widget's own", () => {
  const channelJson = '{"service": "{{flow.variables.service}}"}';
  const Shared = () => {
    const [attributes, setAttributes] = useState<TaskAttributes | undefined>({
      json: channelJson,
      imported: channelJson,
      source: {
        kind: 'channelAttributes',
        template: 'channel-attributes/chat-conversations.tftpl',
        channels: ['webchat'],
      },
    });
    return <TaskAttributesSection attributes={attributes} readOnly={false} onChange={setAttributes} />;
  };
  const useChannel = () =>
    screen.getByRole('checkbox', { name: "Use the channel's task attributes" }) as HTMLInputElement;

  test('ticked, the channel’s are shown and not editable; unticked, the ones entered are the widget’s', () => {
    render(<Shared />);
    expect(useChannel().checked).toBe(true);
    expect(box().disabled).toBe(true);
    expect(screen.getByText(/the same for every Send to queue in the flow/)).toBeTruthy();

    fireEvent.click(useChannel());
    expect(useChannel().checked).toBe(false);
    expect(box().disabled).toBe(false);
    expect(screen.getByText(/its task gets exactly these/)).toBeTruthy();
    fireEvent.change(box(), { target: { value: '{"service": "AdvocateLine"}' } });
    expect(box().value).toBe('{"service": "AdvocateLine"}');

    // Ticked again: the channel's, as they are
    fireEvent.click(useChannel());
    expect(useChannel().checked).toBe(true);
    expect(box().value).toBe(channelJson);
  });
});

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

/**
 * A "Check operating hours" step's channel and office, chosen from the helpline's operating hours
 * file. They're read from and written to its request body (the JSON below them), which keeps its
 * other keys (language, from...).
 */
import { useState } from 'react';
import type { OperatingHoursChoices } from '@tech-matters/form-builder-shared';
import type { FlowObject } from '@tech-matters/form-builder-shared/flows/model';
import {
  operatingHoursBodyOf,
  operatingHoursKeysOf,
  withOperatingHoursValue,
} from '@tech-matters/form-builder-shared/flows/operatingHoursRequest';

const OTHER = '__other';

const textOf = (value: unknown) => (typeof value === 'string' ? value : '');

const Options = ({ values }: { values: string[] }) => (
  <>
    {values.map(value => (
      <option key={value} value={value}>
        {value}
      </option>
    ))}
  </>
);

// The main schedule unless another is chosen: an office changes what the check answers
const OfficeField = ({
  office,
  offices,
  disabled,
  onChange,
}: {
  office: string;
  offices: string[];
  disabled: boolean;
  onChange: (office: string) => void;
}) => (
  <label className="field">
    <span className="field-label">Office</span>
    <select value={office} disabled={disabled} onChange={e => onChange(e.target.value)}>
      <option value="">Main schedule (no office)</option>
      <Options values={offices} />
      {/* Set before (or worked out when the flow runs), and not one of its offices */}
      {office && !offices.includes(office) && <option value={office}>{office} (not in its operating hours)</option>}
    </select>
    <span className="field-hint">
      {offices.length > 0
        ? 'Another of its schedules, e.g. one that closes earlier. The main schedule unless chosen.'
        : 'Its operating hours have no other schedules (offices): it uses the main one.'}
    </span>
  </label>
);

type Props = {
  object: Pick<FlowObject, 'settings' | 'studio'>;
  // The helpline's channels and offices (undefined on the templates board: no helpline)
  choices?: OperatingHoursChoices;
  // The flow's channel: what an empty body sends
  flowChannel?: string;
  readOnly: boolean;
  onBodyChange: (body: string) => void;
};

export const OperatingHoursFields = ({ object, choices, flowChannel, readOnly, onBodyChange }: Props) => {
  // An imported step's body is the live one until it's changed here
  const body = operatingHoursBodyOf(object);
  const keys = operatingHoursKeysOf(body);
  const channel = textOf(keys?.channel);
  const channels = choices?.channels ?? [];
  const [typing, setTyping] = useState(channel !== '' && !channels.includes(channel));
  if (!choices) return null;
  if (!choices.hasOperatingHours) {
    return (
      <p className="field-hint">
        This helpline has no operating hours file, so the check always answers “open”. Set what it sends in its request
        body below.
      </p>
    );
  }
  const write = (key: 'channel' | 'office', value: string) => {
    const next = withOperatingHoursValue(body, key, value, flowChannel);
    if (next !== undefined && next !== body) onBodyChange(next);
  };
  // Nothing in the body: it sends the flow's channel
  const notSet = !body.trim() && flowChannel ? `The flow’s channel (${flowChannel})` : 'Not set';
  const disabled = readOnly || !keys;
  return (
    <>
      <label className="field">
        <span className="field-label">Channel</span>
        <select
          value={typing ? OTHER : channel}
          disabled={disabled}
          onChange={e => {
            const picked = e.target.value;
            setTyping(picked === OTHER);
            if (picked !== OTHER) write('channel', picked);
            else if (channels.includes(channel)) write('channel', '');
          }}
        >
          {!typing && channel === '' && (
            <option value="" disabled>
              {notSet}
            </option>
          )}
          <Options values={channels} />
          <option value={OTHER}>Other…</option>
        </select>
        {typing && (
          <input
            type="text"
            value={channels.includes(channel) ? '' : channel}
            placeholder="e.g. whatsapp or {{flow.variables.channel}}"
            aria-label="Channel (other)"
            disabled={disabled}
            onChange={e => write('channel', e.target.value.trim())}
          />
        )}
        <span className="field-hint">
          One of the channels in the helpline&apos;s operating hours ({channels.join(', ') || 'none'}): another one
          makes the check fail.
        </span>
      </label>
      <OfficeField
        office={textOf(keys?.office)}
        offices={choices.offices}
        disabled={disabled}
        onChange={value => write('office', value)}
      />
      {!keys && (
        <p className="field-hint">Its request body isn&apos;t plain JSON: change its channel and office there.</p>
      )}
    </>
  );
};

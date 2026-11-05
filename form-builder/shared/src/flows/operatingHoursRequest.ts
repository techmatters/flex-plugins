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
 * What a "Check operating hours" step asks the account-scoped Lambda's operatingHours route: a
 * JSON body whose channel must be one of the helpline's operating hours file's channels (or the
 * check fails), and whose office (optional) is one of its offices (otherwise the main schedule).
 */
import type { FlowObject } from './model';

// The body sent when the step's is left empty: the flow's channel, en-US and who it's from
export const defaultOperatingHoursRequest = (channel: string) => ({
  channel,
  includeMessageTextInResponse: 'true',
  language: 'en-US',
  from: channel === 'voice' ? '{{trigger.call.From}}' : '{{trigger.conversation.From}}',
});

// The body it sends: its own, or an imported one's as it is live. Empty: the default above
export const operatingHoursBodyOf = (object: Pick<FlowObject, 'settings' | 'studio'>): string => {
  if (object.settings?.body?.trim()) return object.settings.body;
  const live = object.studio?.properties?.body;
  return typeof live === 'string' ? live : '';
};

// The body's keys ({} when it's empty); undefined when it isn't a JSON object, so only the JSON
// box can change it
export const operatingHoursKeysOf = (body: string): Record<string, unknown> | undefined => {
  if (!body.trim()) return {};
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The body with its channel or office set (an empty value takes it out), keeping its other keys.
 * An empty body starts from the default, so it still says the language and who it's from.
 * Undefined when the body isn't a JSON object.
 */
export const withOperatingHoursValue = (
  body: string,
  key: 'channel' | 'office',
  value: string,
  // The flow's channel, for an empty body's default
  flowChannel?: string,
): string | undefined => {
  const keys = operatingHoursKeysOf(body);
  if (!keys) return undefined;
  let base: Record<string, unknown> = keys;
  if (!body.trim()) {
    // With no flow channel, the channel stays for the person to choose
    const { channel, ...rest } = defaultOperatingHoursRequest(flowChannel ?? '');
    base = flowChannel ? { channel, ...rest } : rest;
  }
  const { [key]: _removed, ...others } = base;
  if (!value) return JSON.stringify(others, null, 2);
  // The channel first, as the helplines write it
  return JSON.stringify(key === 'channel' ? { channel: value, ...others } : { ...base, [key]: value }, null, 2);
};

// Worked out when the flow runs ({{...}}) or when it's deployed (${...}): can't be checked here
export const isWorkedOutLater = (value: string) => value.includes('{{') || value.includes('${');

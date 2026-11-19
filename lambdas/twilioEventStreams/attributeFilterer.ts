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

// Masks helpseeker data in Twilio Event Streams events before they are sent to Datadog.
// Every event goes through filterSensitiveData, in this order:
// 1. Contact addresses and message text, by field name (Studio executions, Messaging and
//    Conversations events)
// 2. TaskRouter task attributes: removed or masked by name at any depth, then phone numbers,
//    IP addresses and emails left in any attribute
// 3. Error logs (Functions and Studio console output, error messages): free text, so phone
//    numbers, IP addresses and emails are masked by pattern in every field
// 4. Phone numbers anywhere else in the event, whatever the event type
// Masked values keep their last 4 characters (XXXXX1234) so they can still be told apart.

export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

const ERROR_LOG_EVENT_TYPE = 'com.twilio.error-logs.error.logged';

// Task attributes removed entirely, keeping only the nested attributes listed for each
const ATTRIBUTES_TO_REMOVE = new Map<string, string[]>([
  ['customers', ['external_id']],
  ['memory', []],
  ['preEngagementData', []],
]);

// Task attributes masked wherever they appear in the task attributes
const SENSITIVE_ATTRIBUTES = new Set([
  'customerAddress',
  'customerName',
  'from',
  'name',
  'name_old',
  'firstName',
  'friendlyName',
  'ip',
  'contactIdentifier',
  'caller',
  'outbound_to',
  'external_contact',
]);

// Fields of the event's data masked by name
const SENSITIVE_EVENT_FIELDS = ['contact_channel_address', 'from', 'to', 'Author'];
const MESSAGE_TEXT_FIELDS = ['body', 'Body'];

// Phone numbers and channel IDs, masked everywhere in every event
const PHONE_PATTERNS = [
  /(?:\+|%2B)\d{7,15}/gi, // +15551234567, whatsapp:+..., sip:+...@..., URL-encoded %2B15551234567
  /(?<=sip(?::|%3A))\d{7,15}/gi, // SIP addresses without a +, e.g. sip:26300000000@...
  // Custom channel IDs without a +, e.g. modica:64211234567, messenger:1234567890123456
  // (lowercase only: channel prefixes are lowercase, and "Line:" or "line:" in stack traces is
  // only matched with a colon, not a slash)
  /(?<=\b(?:modica|messenger|instagram|telegram)(?::|%3A|\/))[\w.-]{5,}/g,
  /(?<=\b(?:line|tel)(?::|%3A))\+?\d[\w.-]{4,}/g,
  // Numbers or IDs (Messenger/Instagram IDs are 16-17 digits) without a + right after a contact
  // attribute name, also in logged or escaped JSON and webhook parameters, e.g. Studio's Send to
  // Flex log: \"name\":\"26300000000\"; Task attribute: from 26300000000; From=26300000000
  /(?<=\b(?:name|name_old|from|caller|customerAddress|customerName|external_contact|outbound_to)[\s\\"':=]{1,10})\d{7,20}\b/gi,
];

// Also masked in free text and task attributes, after the phone numbers (a SIP address is a
// phone number and an IP address). Four-part version numbers (e.g. 10.2.3.4) are masked as
// IPs too: safe, and rare in these logs.
const OTHER_SENSITIVE_PATTERNS = [
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IPv4 addresses
  // Email addresses. Anchored and bounded so long text without an @ can't make it backtrack
  // for seconds (it runs before anything else limits the size of the payload).
  /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}/g,
];

const maskValue = (value: string): string => {
  if (!value) return value;
  return value.length > 4 ? `XXXXX${value.slice(-4)}` : 'XXXXX';
};

const maskPatterns = (text: string, patterns: RegExp[]): string =>
  patterns.reduce(
    (masked, pattern) => masked.replace(pattern, match => maskValue(match)),
    text,
  );

export const maskPhoneNumbers = (text: string): string =>
  maskPatterns(text, PHONE_PATTERNS);

export const maskText = (text: string): string =>
  maskPatterns(text, [...PHONE_PATTERNS, ...OTHER_SENSITIVE_PATTERNS]);

export const isJsonObject = (value: JsonValue | undefined): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Applies mask to every string in the value, at any depth
const maskStrings = (value: JsonValue, mask: (text: string) => string): JsonValue => {
  if (typeof value === 'string') return mask(value);
  if (Array.isArray(value)) return value.map(item => maskStrings(item, mask));
  if (!isJsonObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, maskStrings(item, mask)]),
  );
};

const keepNestedAttributes = (
  value: JsonValue,
  toKeep: string[],
): JsonObject | undefined => {
  if (!isJsonObject(value)) return undefined;
  const kept = Object.fromEntries(
    Object.entries(value).filter(([key]) => toKeep.includes(key)),
  );
  return Object.keys(kept).length ? kept : undefined;
};

const filterAttributes = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(filterAttributes);
  if (!isJsonObject(value)) return value;
  const filtered: JsonObject = {};
  Object.entries(value).forEach(([key, item]) => {
    const toKeep = ATTRIBUTES_TO_REMOVE.get(key);
    if (toKeep) {
      const kept = keepNestedAttributes(item, toKeep);
      if (kept) filtered[key] = kept;
    } else if (SENSITIVE_ATTRIBUTES.has(key) && typeof item === 'string') {
      filtered[key] = maskValue(item);
    } else {
      filtered[key] = filterAttributes(item);
    }
  });
  return filtered;
};

// Task attributes arrive as a JSON string. If it can't be parsed, it is masked as free text.
const filterAttributesJson = (attributesJson: string): string => {
  let attributes: JsonValue;
  try {
    attributes = JSON.parse(attributesJson);
  } catch {
    return maskText(attributesJson);
  }
  return JSON.stringify(maskStrings(filterAttributes(attributes), maskText));
};

export const filterSensitiveData = (event: JsonValue): JsonValue => {
  if (!isJsonObject(event) || !isJsonObject(event.data)) {
    return maskStrings(event, maskPhoneNumbers);
  }
  const data: JsonObject = { ...event.data };
  SENSITIVE_EVENT_FIELDS.forEach(field => {
    const value = data[field];
    if (typeof value === 'string') data[field] = maskValue(value);
  });
  MESSAGE_TEXT_FIELDS.forEach(field => {
    if (typeof data[field] === 'string' && data[field]) data[field] = 'XXXXX';
  });
  const { payload } = data;
  if (isJsonObject(payload) && typeof payload.task_attributes === 'string') {
    data.payload = {
      ...payload,
      task_attributes: filterAttributesJson(payload.task_attributes),
    };
  }
  if (event.type === ERROR_LOG_EVENT_TYPE) {
    Object.entries(data).forEach(([field, value]) => {
      data[field] = maskStrings(value, maskText);
    });
  }
  return maskStrings({ ...event, data }, maskPhoneNumbers);
};

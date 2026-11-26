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
// filterSensitiveData walks every field of the event, whatever the event type:
// 1. Fields known to hold helpseeker data are masked by name, at any depth: message text,
//    names and locations entirely, contact addresses keeping their last 4 characters
// 2. Attributes JSON (TaskRouter task attributes, Conversations attributes): removed or masked
//    by name at any depth, then masked like any other field
// 3. Other strings holding JSON (error log payloads, logged webhook requests) are parsed and
//    masked field by field, so masking can't break the JSON. They are only rewritten when
//    something was masked: rewriting drops their formatting and the precision of numbers over
//    15 digits.
// 4. Any other text (Functions and Studio console output, error messages): message text,
//    phone numbers, channel IDs, IP addresses and emails are masked by pattern
// Masked numbers and addresses keep their last 4 characters (XXXXX1234, XXXXX0.40) so they can
// still be told apart, unless those contain letters; names and text are masked entirely (XXXXX).

export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export type JsonObject = { [key: string]: JsonValue };

const FULLY_MASKED = 'XXXXX';

// Attributes removed entirely, keeping only the nested attributes listed for each
const ATTRIBUTES_TO_REMOVE = new Map<string, string[]>([
  ['customers', ['external_id']],
  ['memory', []],
  ['preEngagementData', []],
]);

// Attributes masked wherever they appear in task or Conversations attributes
const NAME_ATTRIBUTES = new Set(['customerName', 'firstName', 'friendlyName']);
const SENSITIVE_ATTRIBUTES = new Set([
  'customerAddress',
  'from',
  'name',
  'name_old',
  'ip',
  'contactIdentifier',
  'caller',
  'outbound_to',
  'external_contact',
  'phone',
  'address',
  'to',
]);

// Event fields masked by name at any depth, whatever their case. Not "name": it is the event
// name in TaskRouter events.
const CONTACT_FIELDS = new Set([
  'contact_channel_address',
  'from',
  'to',
  'author',
  'address',
  'phone',
  'caller',
  'customeraddress',
  'external_contact',
  'outbound_to',
  'waid', // WhatsApp number without a +
  'forwardedfrom',
]);

// Message text, names and locations, masked entirely at any depth, whatever their case
// (Messaging and Conversations events, webhook parameters in error logs)
const FULLY_MASKED_FIELDS = new Set([
  'body',
  'profilename',
  'callername',
  'latitude',
  'longitude',
  'fromcity',
  'fromstate',
  'fromzip',
  'callercity',
  'callerstate',
  'callerzip',
]);

// Other fields that may hold a phone number, masked when they hold 7 digits or more
const PHONE_LIKE_KEY = /phone|number|caller|msisdn|wa_?id/i;

// A webhook response body is the helpline's own server answering: kept for debugging
const RESPONSE_FIELD = 'response';

// JSON strings of attributes, filtered like task attributes
const ATTRIBUTES_JSON_FIELDS = new Set(['task_attributes', 'Attributes', 'attributes']);

// Counsellor identity, kept readable to debug routing
const STAFF_FIELDS = new Set(['worker_name']);

// Message text and profile names in free text, masked entirely: webhook parameters
// (Body=I+need+help) and logged JSON ("Body":"I need help"), also escaped once or more
// (\"Body\":\"I need help\"). The JSON value ends at an unescaped quote with as many
// backslashes as the opening one, followed by , } or ], so escaped quotes, line breaks and
// accents in the message don't end it early. Without that end (e.g. a log cut short), the
// rest of the text is masked: safer, and it keeps the masking linear on large payloads.
const MESSAGE_TEXT_KEYS = '(?:Body|ProfileName|CallerName)';
const MESSAGE_TEXT_PARAMETER = new RegExp(`(?<=\\b${MESSAGE_TEXT_KEYS}=)[^&\\s"]+`, 'gi');
const MESSAGE_TEXT_JSON = new RegExp(
  `(\\b${MESSAGE_TEXT_KEYS}(\\\\*)"\\s*:\\s*\\2")([\\s\\S]*?)(?:(?<!\\\\)(?=\\2"\\s*[,}\\]])|$)`,
  'gi',
);

// Phone numbers and channel IDs in free text
const PHONE_PATTERNS = [
  /(?:\+|%2B)\d{7,}/gi, // +15551234567, whatsapp:+..., sip:+...@..., URL-encoded %2B15551234567
  /(?<=sip(?::|%3A))\d{7,}/gi, // SIP addresses without a +, e.g. sip:26300000000@...
  // Custom channel IDs without a +, e.g. modica:64211234567, messenger:1234567890123456
  // (lowercase only: channel prefixes are lowercase, and "Line:" or "line:" in stack traces is
  // only matched with a colon, not a slash)
  /(?<=\b(?:modica|messenger|instagram|telegram)(?::|%3A|\/))[\w.-]{5,}/g,
  /(?<=\b(?:line|tel)(?::|%3A))\+?\d[\w.-]{4,}/g,
  /(?<=\bline(?::|%3A))U[0-9a-f]{32}/g, // LINE user IDs, e.g. line:U4af4980629...
  // Numbers or IDs (Messenger/Instagram IDs are 16-17 digits) without a + right after a contact
  // attribute name, also in logged or escaped JSON and webhook parameters, e.g. Studio's Send to
  // Flex log: \"name\":\"26300000000\"; Task attribute: caller 26300000000; From=26300000000
  /(?<=\b(?:name|name_old|friendlyName|profileName|caller|phone|address|customerAddress|customerName|contact_channel_address|external_contact|outbound_to|author|waid|forwardedFrom)[\s\\"':=]{1,10})\d{7,}/gi,
  // "from" and "to" only as keys (from: / from= / "from"), so timestamps in sentences like
  // "updated from 1763550080822 to 1763550099999" are kept
  /(?<=\b(?:from|to)[\s\\"]{0,3}[:='"][\s\\"':=]{0,9})\d{7,}/gi,
];

// Also masked in free text, after the phone numbers (a SIP address is a phone number and an IP
// address). Four-part version numbers (e.g. 10.2.3.4) and dotted times (e.g. 12.01.20.822) are
// masked as IPs too: safe, and rare in these logs (timestamps are ISO, e.g. 12:01:20.822).
const OTHER_SENSITIVE_PATTERNS = [
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IPv4 addresses
  // Email addresses. Anchored and bounded so long text without an @ can't make it backtrack
  // for seconds (it runs before anything else limits the size of the payload).
  /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,}/g,
];

// Numbers and addresses keep their last 4 characters, unless those contain letters (names,
// street addresses, emails): then they are masked entirely
const maskValue = (value: string): string => {
  if (!value) return value;
  const lastFour = value.slice(-4);
  return value.length > 4 && !/[A-Za-z]/.test(lastFour)
    ? `XXXXX${lastFour}`
    : FULLY_MASKED;
};

const hasPhoneNumberDigits = (value: string): boolean =>
  value.replace(/\D/g, '').length >= 7;

const maskPatterns = (
  text: string,
  patterns: RegExp[],
  mask: (match: string) => string,
): string => patterns.reduce((masked, pattern) => masked.replace(pattern, mask), text);

export const maskText = (text: string): string =>
  maskPatterns(
    text
      .replace(MESSAGE_TEXT_PARAMETER, FULLY_MASKED)
      .replace(MESSAGE_TEXT_JSON, (_match, key: string, _quote, messageText: string) =>
        messageText ? `${key}${FULLY_MASKED}` : key,
      ),
    [...PHONE_PATTERNS, ...OTHER_SENSITIVE_PATTERNS],
    maskValue,
  );

export const isJsonObject = (value: JsonValue | undefined): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJson = (text: string): JsonValue | undefined => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const isMaskable = (value: JsonValue): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

const isPhoneLike = (key: string, value: JsonValue): value is string | number =>
  PHONE_LIKE_KEY.test(key) && isMaskable(value) && hasPhoneNumberDigits(String(value));

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
    } else if (NAME_ATTRIBUTES.has(key) && isMaskable(item)) {
      filtered[key] = item === '' ? item : FULLY_MASKED;
    } else if (
      (SENSITIVE_ATTRIBUTES.has(key) && isMaskable(item)) ||
      isPhoneLike(key, item)
    ) {
      filtered[key] = maskValue(String(item));
    } else {
      filtered[key] = filterAttributes(item);
    }
  });
  return filtered;
};

const parseJsonObjectOrArray = (text: string): JsonValue | undefined => {
  const trimmed = text.trimStart();
  return trimmed.startsWith('{') || trimmed.startsWith('[') ? parseJson(text) : undefined;
};

// Rewrites a JSON string only when masking changed it
const stringifyIfMasked = (
  original: string,
  parsed: JsonValue,
  masked: JsonValue,
): string => {
  const maskedJson = JSON.stringify(masked);
  return maskedJson === JSON.stringify(parsed) ? original : maskedJson;
};

const maskEventValue = (value: JsonValue): JsonValue => {
  if (typeof value === 'string') {
    const parsed = parseJsonObjectOrArray(value);
    return parsed === undefined
      ? maskText(value)
      : stringifyIfMasked(value, parsed, maskEventValue(parsed));
  }
  if (Array.isArray(value)) return value.map(maskEventValue);
  if (!isJsonObject(value)) return value;
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    Object.entries(value).map(([key, item]) => [key, maskEventField(key, item)]),
  );
};

// Attributes arrive as a JSON string. If it can't be parsed, it is masked as free text.
const filterAttributesJson = (attributesJson: string): string => {
  const attributes = parseJson(attributesJson);
  return attributes === undefined
    ? maskText(attributesJson)
    : stringifyIfMasked(
        attributesJson,
        attributes,
        maskEventValue(filterAttributes(attributes)),
      );
};

// The body of a webhook response gets pattern masking only, the rest is masked as usual
const maskResponse = (response: JsonObject): JsonObject =>
  Object.fromEntries(
    Object.entries(response).map(([key, item]) => [
      key,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      key.toLowerCase() === 'body' ? maskEventValue(item) : maskEventField(key, item),
    ]),
  );

const maskEventField = (key: string, value: JsonValue): JsonValue => {
  const lowerCaseKey = key.toLowerCase();
  if (STAFF_FIELDS.has(key)) return value;
  if (FULLY_MASKED_FIELDS.has(lowerCaseKey) && isMaskable(value)) {
    return value === '' ? value : FULLY_MASKED;
  }
  if (
    (CONTACT_FIELDS.has(lowerCaseKey) && isMaskable(value)) ||
    isPhoneLike(key, value)
  ) {
    return maskValue(String(value));
  }
  if (ATTRIBUTES_JSON_FIELDS.has(key) && typeof value === 'string') {
    return filterAttributesJson(value);
  }
  if (lowerCaseKey === RESPONSE_FIELD && isJsonObject(value)) return maskResponse(value);
  return maskEventValue(value);
};

export const filterSensitiveData = (event: JsonValue): JsonValue => maskEventValue(event);

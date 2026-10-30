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
 * sendMessageAndRunJanitor's values (conversationSid or channelSid, message, from), wherever the
 * widget keeps them: a Serverless function's parameters ([{ key, value }]), or the JSON body of an
 * HTTP request to the account-scoped lambda. Shared by the import and the Studio template, so no
 * browser or server code here.
 */

type Parameter = { key: string; value: string };

const parametersOf = (properties: Record<string, unknown>): Parameter[] | undefined =>
  Array.isArray(properties.parameters)
    ? properties.parameters.filter(
        (parameter): parameter is Parameter =>
          typeof parameter === 'object' &&
          parameter !== null &&
          typeof (parameter as Parameter).key === 'string' &&
          typeof (parameter as Parameter).value === 'string',
      )
    : undefined;

const bodyOf = (properties: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (typeof properties.body !== 'string') return undefined;
  try {
    const body = JSON.parse(properties.body);
    return typeof body === 'object' && body !== null ? body : undefined;
  } catch {
    return undefined;
  }
};

export const janitorValuesOf = (properties: Record<string, unknown>): Record<string, string> => {
  const parameters = parametersOf(properties);
  if (parameters && parameters.length > 0) return Object.fromEntries(parameters.map(({ key, value }) => [key, value]));
  const body = bodyOf(properties) ?? {};
  return Object.fromEntries(
    Object.entries(body).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
};

/**
 * The widget's properties with these values changed (undefined: taken out), where it keeps them.
 * The same properties when nothing changes.
 */
export const withJanitorValues = (
  properties: Record<string, unknown>,
  changes: Record<string, string | undefined>,
): Record<string, unknown> => {
  const current = janitorValuesOf(properties);
  if (Object.entries(changes).every(([key, value]) => current[key] === value)) return properties;
  const parameters = parametersOf(properties);
  if (parameters && parameters.length > 0) {
    const kept = parameters
      .filter(({ key }) => !(key in changes) || changes[key] !== undefined)
      .map((parameter) => (parameter.key in changes ? { ...parameter, value: changes[parameter.key]! } : parameter));
    const added = Object.entries(changes)
      .filter(([key, value]) => value !== undefined && !parameters.some((parameter) => parameter.key === key))
      .map(([key, value]) => ({ key, value: value! }));
    return { ...properties, parameters: [...kept, ...added] };
  }
  const body = { ...(bodyOf(properties) ?? {}) };
  Object.entries(changes).forEach(([key, value]) => {
    if (value === undefined) delete body[key];
    else body[key] = value;
  });
  return { ...properties, body: JSON.stringify(body, null, 2) };
};

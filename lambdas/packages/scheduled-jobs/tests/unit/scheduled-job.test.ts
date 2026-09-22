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

import { isValidVoicemailTask } from '../../src/scheduled-job';

const validVoicemailTask = {
  accountSid: 'AC123456',
  workflowSid: 'WW123456',
  attributes: {
    callSid: 'CA123456',
    from: '+12025550123',
    name: 'Pat Doe',
    callbackAttempts: [],
    routingAttributes: { queue: 'support' },
    maxCallbackAttempts: 3,
  },
};

describe('isValidVoicemailTask', () => {
  test('returns true for a valid voicemail task payload', () => {
    expect(isValidVoicemailTask(validVoicemailTask)).toBe(true);
  });

  test.each([
    {},
    { ...validVoicemailTask, accountSid: 123 },
    { ...validVoicemailTask, workflowSid: 123 },
    { ...validVoicemailTask, attributes: null },
    {
      ...validVoicemailTask,
      attributes: { ...validVoicemailTask.attributes, callSid: 123 },
    },
    {
      ...validVoicemailTask,
      attributes: { ...validVoicemailTask.attributes, from: 123 },
    },
    {
      ...validVoicemailTask,
      attributes: { ...validVoicemailTask.attributes, name: 123 },
    },
    {
      ...validVoicemailTask,
      attributes: { ...validVoicemailTask.attributes, callbackAttempts: 'not-an-array' },
    },
    {
      ...validVoicemailTask,
      attributes: { ...validVoicemailTask.attributes, maxCallbackAttempts: 'three' },
    },
    {
      ...validVoicemailTask,
      attributes: { ...validVoicemailTask.attributes, routingAttributes: 'routing' },
    },
  ])('returns false for invalid payload %p', input => {
    expect(isValidVoicemailTask(input)).toBe(false);
  });
});

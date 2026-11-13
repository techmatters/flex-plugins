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

import { InsightsObject } from '@tech-matters/hrm-form-definitions';
import { isErr, isOk, newErr, newOk } from '@tech-matters/result-type';
import {
  recordPostSurveyAnswers,
  recordPostSurveyAnswersHandler,
} from '../../../src/postSurvey/recordPostSurveyAnswers';
import { patchTaskAttributes } from '../../../src/task/patchTaskAttributes';
import { patchOnInternalHrmEndpoint } from '../../../src/hrm/internalHrmRequest';
import { getCurrentDefinitionVersion } from '../../../src/hrm/formDefinitionsCache';
import { cancelPostSurveyControlTask } from '../../../src/postSurvey/postSurveyControlTask';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../../src/configuration/aseloConfiguration', () => ({
  retrieveServiceConfigurationAttributes: jest
    .fn()
    .mockResolvedValue({ hrm_api_version: 'v0' }),
}));
jest.mock('../../../src/hrm/formDefinitionsCache', () => ({
  getCurrentDefinitionVersion: jest.fn(),
}));
jest.mock('../../../src/task/patchTaskAttributes', () => ({
  patchTaskAttributes: jest.fn(),
}));
jest.mock('../../../src/hrm/internalHrmRequest', () => ({
  patchOnInternalHrmEndpoint: jest.fn(),
}));
jest.mock('../../../src/postSurvey/postSurveyControlTask', () => ({
  cancelPostSurveyControlTask: jest.fn(),
}));

const mockGetCurrentDefinitionVersion = getCurrentDefinitionVersion as jest.Mock;
const mockPatchTaskAttributes = patchTaskAttributes as jest.Mock;
const mockPatchOnInternalHrmEndpoint = patchOnInternalHrmEndpoint as jest.Mock;
const mockCancelPostSurveyControlTask = cancelPostSurveyControlTask as jest.Mock;

const CONTROL_TASK_SID = 'WTcontrol';
const POST_SURVEY_SPECS = [
  {
    insightsObject: InsightsObject.Conversations,
    attributeName: 'conversation_attribute_5',
    questions: ['q1', 'q2'],
  },
];

let controlTaskAttributes: Record<string, any>;

beforeEach(() => {
  jest.clearAllMocks();
  controlTaskAttributes = {
    isSurveyTask: true,
    contactTaskId: 'WTcontact',
    conversations: { conversation_id: 'WTcontact' },
  };
  mockGetCurrentDefinitionVersion.mockResolvedValue({
    insights: { postSurveySpecs: POST_SURVEY_SPECS },
  });
  // Apply the attributes update to the in-memory control task, like patchTaskAttributes does to the real one
  mockPatchTaskAttributes.mockImplementation(async (accountSid, taskSid, generator) => {
    controlTaskAttributes = generator(controlTaskAttributes);
    return newOk(undefined);
  });
  mockPatchOnInternalHrmEndpoint.mockResolvedValue(newOk({}));
});

describe('recordPostSurveyAnswers', () => {
  const record = (answers: Record<string, string>) =>
    recordPostSurveyAnswers({
      accountSid: TEST_ACCOUNT_SID,
      controlTaskSid: CONTROL_TASK_SID,
      answers,
    });

  test('no answered questions - records nothing', async () => {
    const result = await record({ q1: '', q2: '' });

    expect(isOk(result) && result.data).toStrictEqual({ recorded: false });
    expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
    expect(mockPatchOnInternalHrmEndpoint).not.toHaveBeenCalled();
  });

  test('answered question - records it on the control task and in HRM', async () => {
    const result = await record({ q1: 'yes', q2: '' });

    expect(isOk(result) && result.data).toStrictEqual({ recorded: true });
    expect(mockPatchTaskAttributes).toHaveBeenCalledWith(
      TEST_ACCOUNT_SID,
      CONTROL_TASK_SID,
      expect.any(Function),
    );
    expect(controlTaskAttributes.postSurveyAnswers).toStrictEqual({ q1: 'yes' });
    expect(controlTaskAttributes.conversations.conversation_attribute_5).toBe('yes;');
    expect(mockPatchOnInternalHrmEndpoint).toHaveBeenCalledWith(
      TEST_ACCOUNT_SID,
      'v0',
      `postSurveys/${CONTROL_TASK_SID}`,
      { contactTaskId: 'WTcontact', data: { q1: 'yes', q2: '' } },
    );
  });

  test('answers recorded one at a time - HRM gets all the answers so far each time', async () => {
    await record({ q1: 'yes' });
    await record({ q2: 'no' });

    expect(controlTaskAttributes.postSurveyAnswers).toStrictEqual({
      q1: 'yes',
      q2: 'no',
    });
    expect(mockPatchOnInternalHrmEndpoint).toHaveBeenLastCalledWith(
      TEST_ACCOUNT_SID,
      'v0',
      `postSurveys/${CONTROL_TASK_SID}`,
      { contactTaskId: 'WTcontact', data: { q1: 'yes', q2: 'no' } },
    );
  });

  test('no post survey specs - returns an error without recording', async () => {
    mockGetCurrentDefinitionVersion.mockResolvedValue({
      insights: { postSurveySpecs: [] },
    });

    const result = await record({ q1: 'yes' });

    expect(isErr(result)).toBe(true);
    expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
    expect(mockPatchOnInternalHrmEndpoint).not.toHaveBeenCalled();
  });

  test('control task update fails - returns an error without patching HRM', async () => {
    mockPatchTaskAttributes.mockResolvedValue(
      newErr({ message: 'boom', error: { errorInstance: new Error('boom') } }),
    );

    const result = await record({ q1: 'yes' });

    expect(isErr(result)).toBe(true);
    expect(mockPatchOnInternalHrmEndpoint).not.toHaveBeenCalled();
  });

  test('HRM patch fails - returns an error', async () => {
    mockPatchOnInternalHrmEndpoint.mockResolvedValue(
      newErr({ message: 'boom', error: new Error('boom') }),
    );

    const result = await record({ q1: 'yes' });

    expect(isErr(result)).toBe(true);
  });
});

describe('recordPostSurveyAnswersHandler', () => {
  const callHandler = (body: Record<string, any>) =>
    recordPostSurveyAnswersHandler({ body } as any, TEST_ACCOUNT_SID);

  test('missing controlTaskSid - returns 400', async () => {
    const result = await callHandler({ answers: { q1: 'yes' } });

    expect(isErr(result) && result.error.statusCode).toBe(400);
    expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
  });

  test('answers without surveyComplete - records them and leaves the control task open', async () => {
    const result = await callHandler({
      controlTaskSid: CONTROL_TASK_SID,
      answers: { q1: 'yes' },
    });

    expect(isOk(result)).toBe(true);
    expect(controlTaskAttributes.postSurveyAnswers).toStrictEqual({ q1: 'yes' });
    expect(mockCancelPostSurveyControlTask).not.toHaveBeenCalled();
  });

  test.each([true, 'true'])(
    'surveyComplete %p - records the answers, then cancels the control task',
    async surveyComplete => {
      const result = await callHandler({
        controlTaskSid: CONTROL_TASK_SID,
        answers: { q2: 'no' },
        surveyComplete,
      });

      expect(isOk(result)).toBe(true);
      expect(controlTaskAttributes.postSurveyAnswers).toStrictEqual({ q2: 'no' });
      expect(mockCancelPostSurveyControlTask).toHaveBeenCalledWith(
        {},
        TEST_ACCOUNT_SID,
        CONTROL_TASK_SID,
      );
    },
  );

  test('surveyComplete without answers - only cancels the control task', async () => {
    const result = await callHandler({
      controlTaskSid: CONTROL_TASK_SID,
      surveyComplete: true,
    });

    expect(isOk(result)).toBe(true);
    expect(mockPatchTaskAttributes).not.toHaveBeenCalled();
    expect(mockCancelPostSurveyControlTask).toHaveBeenCalled();
  });

  test('recording fails - returns the error and leaves the control task open', async () => {
    mockPatchOnInternalHrmEndpoint.mockResolvedValue(
      newErr({ message: 'boom', error: new Error('boom') }),
    );

    const result = await callHandler({
      controlTaskSid: CONTROL_TASK_SID,
      answers: { q1: 'yes' },
      surveyComplete: true,
    });

    expect(isErr(result)).toBe(true);
    expect(mockCancelPostSurveyControlTask).not.toHaveBeenCalled();
  });
});

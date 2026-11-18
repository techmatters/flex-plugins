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

import { isErr, isOk } from '@tech-matters/result-type';
import {
  buildPostSurveyControlTaskAttributes,
  createPostSurveyControlTaskHandler,
  POST_SURVEY_CONTROL_TASK_TTL_SECONDS,
} from '../../../src/postSurvey/postSurveyControlTask';
import { TEST_ACCOUNT_SID } from '../../testTwilioValues';

const mockCreateTask = jest.fn();
jest.mock('@tech-matters/twilio-configuration', () => ({
  getTwilioClient: jest.fn().mockImplementation(async () => ({
    taskrouter: { v1: { workspaces: () => ({ tasks: { create: mockCreateTask } }) } },
  })),
  getWorkspaceSid: jest.fn().mockResolvedValue('WSworkspace'),
  getSurveyWorkflowSid: jest.fn().mockResolvedValue('WWsurvey'),
}));

describe('buildPostSurveyControlTaskAttributes', () => {
  test('links the survey task to the contact task and the contact', () => {
    expect(
      buildPostSurveyControlTaskAttributes({
        contactTaskSid: 'WTcontact',
        contactId: '1234',
        language: 'en-US',
      }),
    ).toStrictEqual({
      isSurveyTask: true,
      contactTaskId: 'WTcontact',
      conversations: { conversation_id: 'WTcontact' },
      language: 'en-US',
      contactId: '1234',
    });
  });
});

describe('createPostSurveyControlTaskHandler', () => {
  beforeEach(() => {
    mockCreateTask.mockReset();
  });

  test('creates a survey task linked to the contact and returns its SID', async () => {
    mockCreateTask.mockResolvedValue({ sid: 'WTcontrol' });

    const result = await createPostSurveyControlTaskHandler(
      {
        body: { contactTaskSid: 'WTcontact', contactId: '1234', language: 'fr-CA' },
      } as any,
      TEST_ACCOUNT_SID,
    );

    expect(isOk(result) && result.unwrap()).toStrictEqual({
      controlTaskSid: 'WTcontrol',
    });
    expect(mockCreateTask).toHaveBeenCalledWith({
      workflowSid: 'WWsurvey',
      taskChannel: 'survey',
      attributes: JSON.stringify(
        buildPostSurveyControlTaskAttributes({
          contactTaskSid: 'WTcontact',
          contactId: '1234',
          language: 'fr-CA',
        }),
      ),
      timeout: POST_SURVEY_CONTROL_TASK_TTL_SECONDS,
    });
  });

  test('missing contactTaskSid - returns 400 without creating a task', async () => {
    const result = await createPostSurveyControlTaskHandler(
      { body: { contactId: '1234' } } as any,
      TEST_ACCOUNT_SID,
    );

    expect(isErr(result) && result.error.statusCode).toBe(400);
    expect(mockCreateTask).not.toHaveBeenCalled();
  });
});

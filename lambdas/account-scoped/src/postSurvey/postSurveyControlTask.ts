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

import { Twilio } from 'twilio';
import { AccountSID } from '@tech-matters/twilio-types';
import {
  getSurveyWorkflowSid,
  getWorkspaceSid,
} from '@tech-matters/twilio-configuration';

// How long a post survey control task lives before TaskRouter cancels it
export const POST_SURVEY_CONTROL_TASK_TTL_SECONDS = 900;

/**
 * Attributes for the 'survey' channel task that tracks a post survey.
 * The task is never assigned to a worker: it exists to carry the survey answers to Flex Insights.
 */
export const buildPostSurveyControlTaskAttributes = ({
  contactTaskSid,
  contactId,
  language,
}: {
  contactTaskSid: string;
  contactId: string;
  language?: string;
}) => ({
  isSurveyTask: true,
  contactTaskId: contactTaskSid,
  conversations: { conversation_id: contactTaskSid },
  language, // if there's a task language, attach it to the post survey task
  contactId,
});

type PostSurveyContact = Parameters<typeof buildPostSurveyControlTaskAttributes>[0];

export const createPostSurveyControlTask = async (
  client: Twilio,
  accountSid: AccountSID,
  contact: PostSurveyContact,
) =>
  client.taskrouter.v1.workspaces(await getWorkspaceSid(accountSid)).tasks.create({
    workflowSid: await getSurveyWorkflowSid(accountSid),
    taskChannel: 'survey',
    attributes: JSON.stringify(buildPostSurveyControlTaskAttributes(contact)),
    timeout: POST_SURVEY_CONTROL_TASK_TTL_SECONDS,
  });

/**
 * Survey tasks are never assigned to a worker, so they stay pending. A pending task can't be completed,
 * so we cancel it, which also makes the answers in its attributes final for Flex Insights.
 */
export const cancelPostSurveyControlTask = async (
  client: Twilio,
  accountSid: AccountSID,
  controlTaskSid: string,
) =>
  client.taskrouter.v1
    .workspaces(await getWorkspaceSid(accountSid))
    .tasks(controlTaskSid)
    .update({ assignmentStatus: 'canceled' });

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

import { mockttpServer } from './mockingProxy';
import 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { TaskSID, WorkspaceSID } from '../../../src/twilioTypes';
import { TaskResource } from '../../testTwilioTypes';

//const twilioTaskEndpointAnyTaskPattern: RegExp =
// https://taskrouter.twilio.com/v1/Workspaces/WSaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/Tasks/WTaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
///https:\/\/taskrouter.twilio.com\/v1\/Workspaces\/WS.+\/Tasks\/WT.+/;

let priority = 0;

const mockTasks: Record<WorkspaceSID, Record<TaskSID, TaskResource>> = {};

export async function mockTaskApi(mockTaskResource: TaskResource): Promise<void> {
  const taskSid = mockTaskResource.sid as TaskSID;
  const workspaceSid = mockTaskResource.workspace_sid as WorkspaceSID;
  mockTasks[workspaceSid] = mockTasks[workspaceSid] || {};
  mockTasks[workspaceSid][taskSid] = mockTaskResource;
  const server = await mockttpServer();
  await server
    .forGet(
      `https://taskrouter.twilio.com/v1/Workspaces/${workspaceSid}/Tasks/${taskSid}`,
    )
    .always()
    .asPriority(++priority) // This is to ensure the latest mock is the one that is used
    .thenJson(200, mockTasks[workspaceSid][taskSid]);
  await server
    .forPost(
      `https://taskrouter.twilio.com/v1/Workspaces/${workspaceSid}/Tasks/${taskSid}`,
    )
    .always()
    .asPriority(++priority) // This is to ensure the latest mock is the one that is used
    .thenCallback(async req => {
      const body = await req.body.getJson();
      const task = mockTasks[workspaceSid][taskSid];
      Object.assign(task, body);
      return {
        status: 200,
        json: task,
      };
    });
}

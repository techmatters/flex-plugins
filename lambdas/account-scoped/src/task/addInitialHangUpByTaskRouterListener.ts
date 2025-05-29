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

// eslint-disable-next-line prettier/prettier
import {registerTaskRouterEventHandler, TaskRouterEventHandler} from '../taskrouter/taskrouterEventHandler';
import { AccountSID, TaskSID } from '../twilioTypes';
import { Twilio } from 'twilio';
import { TASK_CREATED } from '../taskrouter/eventTypes';
import { EventFields } from '../taskrouter';
import { patchTaskAttributes } from './patchTaskAttributes';

const addInitialHangUpBy: TaskRouterEventHandler = async (
  event: EventFields,
  accountSid: AccountSID,
  client: Twilio,
) => {
  const { TaskSid } = event;
  const taskSid = TaskSid as TaskSID;
  await patchTaskAttributes(client, accountSid, taskSid, originalAttributes => ({
    ...originalAttributes,
    conversations: {
      ...originalAttributes.conversations,
      hang_up_by: 'Customer',
    },
  }));
};

registerTaskRouterEventHandler([TASK_CREATED], addInitialHangUpBy);

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

import { subHours } from 'date-fns';
import context from '../flex-in-a-box/global-context';
import { updateLiveQueryData } from '../flex-in-a-box/twilsock-live-query';

// type TaskSid = `WT${string}`;
// type ChannelSid = `CH${string}`;

enum ChannelType {
  Chat = 'chat',
}

let taskCounter = 0;

const taskForLoggedInWorker = (channelType: ChannelType) => {
  const hourAgo = subHours(new Date(), 1);
  return {
    date_updated: hourAgo.toISOString(),
    channel_unique_name: channelType,
    task_sid: `WT_${++taskCounter}`,
    workspace_sid: context.WORKSPACE_SID,
    worker_name: 'bob@bug.com',
    accepted_reservation_sid: 'WR1469a483043dc0eaad37cc8a832f215c',
    date_created: hourAgo.toISOString(),
    priority: 0,
    worker_sid: context.LOGGED_IN_WORKER_SID,
    queue_name: 'Fake Queue',
    attributes: {
      channelSid: `CH_${channelType.toUpperCase()}`,
      helpline: 'Smoke Mirror',
      memory: {
        at: 'counselor_handoff',
        twilio: {
          chat: {
            ChannelSid: `CH_${channelType.toUpperCase()}`,
            AssistantName: '',
            Attributes: {},
            ServiceSid: 'IS_CHAT_SERVICE',
            To: 'Bot',
            From: 'FROM',
            MessageSid: 'IM_MESSAGE',
          },
          collected_data: {
            collect_survey: {
              answers: {
                about_self: {
                  confirm_attempts: 0,
                  answer: 'Yes',
                  filled: true,
                  type: 'Twilio.YES_NO',
                  confirmed: false,
                  validate_attempts: 1,
                  attempts: 1,
                },
                age: {
                  confirm_attempts: 0,
                  filled: false,
                  error: { message: 'Invalid Value', value: 'U' },
                  type: 'Age',
                  confirmed: false,
                  validate_attempts: 2,
                  attempts: 2,
                },
              },
              date_completed: hourAgo,
              date_started: hourAgo,
              status: 'validation-max-attempts',
            },
          },
        },
        sendToAgent: true,
      },
      transferTargetType: '',
      ip: '1.1.1.1',
      name: 'Anonymous',
      channelType: 'web',
      preEngagementData: {
        contactIdentifier: 'dev@dev.dev',
        helpline: '',
        ip: '1.1.1.1',
        location: 'https://a.b.com/c.html',
        contactType: 'email',
        friendlyName: 'Anonymous',
      },
      ignoreAgent: '',
      customers: { external_id: 'WT_EXTERNAL' },
    },
    channel_type: 'chat',
    age: 3,
    status: 'pending',
  };
};

/**
 * Fakes the Twilio Sync websocket exchange required to add the fake task above to the worker's task list.
 */
export const addTaskToWorker = () => {
  const task = taskForLoggedInWorker(ChannelType.Chat);
  updateLiveQueryData('/v3/Insights/tr-task/Items', '', { [task.task_sid]: task });
};

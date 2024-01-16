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

import type { QueuesStatus } from '../../states/queuesStatus/types';
import { CoreChannelTypes } from '../../states/DomainConstants';
import { isSmsChannelType } from '../../utils/smsChannels';

type QueueEntry = { [K in CoreChannelTypes]: number } & { longestWaitingDate: string; isChatPending: boolean };

export const newQueueEntry: QueueEntry = {
  facebook: 0,
  sms: 0,
  voice: 0,
  web: 0,
  whatsapp: 0,
  twitter: 0,
  instagram: 0,
  line: 0,
  longestWaitingDate: null,
  isChatPending: false,
};

// Initializes a new QueuesStatus with a newQueueEntry for each queue the counselor is suscribed to
export const initializeQueuesStatus = (queues: string[]): QueuesStatus =>
  // eslint-disable-next-line no-nested-ternary
  queues.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).reduce((acc, qName) => ({ ...acc, [qName]: newQueueEntry }), {});

export const isPending = (status: string) => status === 'pending';
export const isReserved = (status: string) => status === 'reserved';
export const isAssigned = (status: string) => status === 'assigned';
export const isCanceled = (status: string) => status === 'canceled';
export const isWaiting = (status: string) => isPending(status) || isReserved(status);
const subscribedToQueue = (queue: string, queues: QueuesStatus) => Boolean(queues[queue]);

/**
 * This function is used to determine the channel of a task.
 * It handles additional SMS channels, such as Modica.
 */
const getChannel = (task: any): CoreChannelTypes => {
  if (task.channel_type === 'voice') return 'voice';

  return isSmsChannelType(task.attributes.channelType) ? 'sms' : task.attributes.channelType;
};

/**
 * Adds each waiting tasks to the appropiate queue and channel, recording which is the oldest.
 * If counselor is not subscribed to a queue, acc[queue] will be undefined
 */
export const addPendingTasks = (acc: QueuesStatus, task: any): QueuesStatus => {
  if (!isWaiting(task.status) || !subscribedToQueue(task.queue_name, acc) || task.channel_type === 'default')
    return acc;

  const created = task.date_created;
  const isChatBasedTask = task.channel_type !== 'voice';
  const channel = getChannel(task);
  const queue = task.queue_name;
  const currentOldest = acc[queue].longestWaitingDate;
  const longestWaitingDate = currentOldest !== null && currentOldest < created ? currentOldest : created;

  return {
    ...acc,
    [queue]: {
      ...acc[queue],
      [channel]: acc[queue][channel] + 1,
      longestWaitingDate,
      isChatPending: acc[queue].isChatPending || (isChatBasedTask && isPending(task.status)),
    },
  };
};

export const getNewQueuesStatus = (cleanQueuesStatus: QueuesStatus, tasks: any[]): QueuesStatus => {
  return Object.values(tasks).reduce<QueuesStatus>(addPendingTasks, cleanQueuesStatus);
};

export const isAnyChatPending = (queuesStatus: QueuesStatus): boolean =>
  queuesStatus && Object.values(queuesStatus).reduce<boolean>((acc, e) => e.isChatPending || acc, false);

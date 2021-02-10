import type { QueuesStatus } from '../../states/queuesStatus/types';
import type { ChannelTypes } from '../../states/DomainConstants';

type QueueEntry = { [K in ChannelTypes]: number } & { longestWaitingDate: string; isChatPending: boolean };

export const newQueueEntry: QueueEntry = {
  facebook: 0,
  sms: 0,
  voice: 0,
  web: 0,
  whatsapp: 0,
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
 * Adds each waiting tasks to the appropiate queue and channel, recording which is the oldest.
 * If counselor is not subscribed to a queue, acc[queue] will be undefined
 */
export const addPendingTasks = (acc: QueuesStatus, task: any): QueuesStatus => {
  if (!isWaiting(task.status) || !subscribedToQueue(task.queue_name, acc) || task.channel_type === 'default')
    return acc;

  const created = task.date_created;
  const isChatBasedTask = task.channel_type !== 'voice';
  const channel = isChatBasedTask ? task.attributes.channelType : 'voice';
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
  queuesStatus && Object.values(queuesStatus).reduce((acc, e) => e.isChatPending || acc, false);

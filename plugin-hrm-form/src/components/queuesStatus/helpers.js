// eslint-disable-next-line no-unused-vars
import { channelTypes } from '../../states/DomainConstants';

/**
 * @type {{ [K in keyof channelTypes]: number } & { longestWaitingDate: string; }}
 */
export const newQueueEntry = {
  facebook: 0,
  sms: 0,
  voice: 0,
  web: 0,
  whatsapp: 0,
  longestWaitingDate: null,
};

/**
 * @param {string[]} queues
 * @returns {{ [qName: string]: typeof newQueueEntry }}
 */
export const initializeQueuesStatus = queues =>
  // eslint-disable-next-line no-nested-ternary
  queues.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).reduce((acc, qName) => ({ ...acc, [qName]: newQueueEntry }), {});

const isNotWaiting = status => status !== 'pending' && status !== 'reserved';
const suscribedToQueue = (queue, queues) => Boolean(queues[queue]);

/**
 * Checks if a task is waiting and if counselor is suscribed to task queue (using information from cleanQueuesStatus)
 * Adds each waiting tasks to the appropiate queue and channel, recording which is the oldest
 * @returns {{ [qName: string]: typeof newQueueEntry }}
 */
export const addPendingTasks = (acc, task) => {
  if (isNotWaiting(task.status) || !suscribedToQueue(task.queue_name, acc)) return acc;

  const created = task.date_created;
  const channel = task.channel_type === 'voice' ? 'voice' : task.attributes.channelType;
  const queue = task.queue_name;
  const currentOldest = acc[queue].longestWaitingDate;
  const longestWaitingDate = currentOldest !== null && currentOldest < created ? currentOldest : created;

  return {
    ...acc,
    [queue]: {
      ...acc[queue],
      [channel]: acc[queue][channel] + 1,
      longestWaitingDate,
    },
  };
};

/**
 * @returns {{ [qName: string]: typeof newQueueEntry }}
 */
export const getNewQueuesStatus = (cleanQueuesStatus, tasks) => {
  const newQueuesStatus = Object.values(tasks).reduce(addPendingTasks, cleanQueuesStatus);

  return newQueuesStatus;
};

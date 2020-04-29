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
 * @param {{ [s: string]: { queue_name: string }; }} queues
 * @returns {{ [queue_name: string]: typeof newQueueEntry }}
 */
export const initializeQueuesStatus = queues =>
  Object.values(queues)
    // eslint-disable-next-line no-nested-ternary
    .sort((a, b) => (a.queue_name < b.queue_name ? -1 : a.queue_name > b.queue_name ? 1 : 0))
    .reduce((acc, q) => ({ ...acc, [q.queue_name]: newQueueEntry }), {});

/**
 * Adds each pending tasks to the appropiate queue and channel, recording which is the oldest
 * @returns {{ [queue_name: string]: typeof newQueueEntry }}
 */
export const addPendingTasks = (acc, task) => {
  if (task.status !== 'pending' && task.status !== 'reserved') return acc;

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
 * @returns {{ [queue_name: string]: typeof newQueueEntry }}
 */
export const getNewQueuesStatus = (cleanQueuesStatus, tasks) => {
  const newQueuesStatus = Object.values(tasks).reduce(addPendingTasks, cleanQueuesStatus);

  return newQueuesStatus;
};

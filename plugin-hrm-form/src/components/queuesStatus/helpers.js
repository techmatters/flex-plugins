import { channelTypes } from '../../states/DomainConstants';

export const newQueueEntry = {
  ...Object.keys(channelTypes).reduce((acc, channel) => ({ ...acc, [channel]: 0 }), {}),
  oldestWaitingTask: null,
};

export const initializeQueuesStatus = queues =>
  Object.values(queues)
    // eslint-disable-next-line no-nested-ternary
    .sort((a, b) => (a.queue_name < b.queue_name ? -1 : a.queue_name > b.queue_name ? 1 : 0))
    .reduce((acc, q) => ({ ...acc, [q.queue_name]: newQueueEntry }), {});

export const addPendingTasks = (acc, task) => {
  if (task.status !== 'pending') return acc;

  const updated = task.date_updated;
  const channel = task.attributes.channelType;
  const queue = task.queue_name;
  const currentOldest = acc[queue].oldestWaitingTask;
  const oldestWaitingTask = currentOldest !== null && currentOldest < updated ? currentOldest : updated;

  return {
    ...acc,
    [queue]: {
      ...acc[queue],
      [channel]: acc[queue][channel] + 1,
      oldestWaitingTask,
    },
  };
};

export const updateQueuesStatus = queuesStatus => tasks => Object.values(tasks).reduce(addPendingTasks, queuesStatus);

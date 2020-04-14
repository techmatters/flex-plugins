import { channelTypes } from '../../states/DomainConstants';

export const newQueueEntry = {
  ...Object.keys(channelTypes).reduce((acc, channel) => ({ ...acc, [channel]: 0 }), {}),
  oldestWaitingTask: null,
};

export const initializeQueuesStatus = queues =>
  Object.keys(queues).reduce((acc, key) => ({ ...acc, [queues[key].queue_name]: newQueueEntry }), {});

export const updateQueuesStatus = queuesStatus => pendingTasks =>
  Object.keys(pendingTasks).reduce((acc, taskId) => {
    const { queue, channel, updated } = pendingTasks[taskId];
    const oldest =
      // eslint-disable-next-line no-nested-ternary
      acc[queue].oldestWaitingTask === null
        ? updated
        : updated < acc[queue].oldestWaitingTask
        ? updated
        : acc[queue].oldestWaitingTask;
    return {
      ...acc,
      [queue]: {
        ...acc[queue],
        [channel]: acc[queue][channel] + 1,
        oldestWaitingTask: oldest,
      },
    };
  }, queuesStatus);

export const initializePendingTasks = tasks =>
  Object.keys(tasks).reduce(
    (accum, taskId) =>
      tasks[taskId].status === 'pending'
        ? {
            ...accum,
            [taskId]: {
              updated: tasks[taskId].date_updated,
              channel: tasks[taskId].attributes.channelType,
              queue: tasks[taskId].queue_name,
            },
          }
        : accum,
    {},
  );

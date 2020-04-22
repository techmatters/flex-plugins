import { channelTypes } from '../../states/DomainConstants';

/**
 * @type {{ [K in keyof channelTypes]: number } & {
 *  longestWaitingTask: { taskId: string; updated: string; waitingMinutes: number; intervalId: NodeJS.Timeout; },
 * }}
 */
export const newQueueEntry = {
  facebook: 0,
  sms: 0,
  voice: 0,
  web: 0,
  whatsapp: 0,
  longestWaitingTask: { taskId: null, updated: null, waitingMinutes: null, intervalId: null },
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
 * @param {{ [queue_name: string]: typeof newQueueEntry }} acc
 * @param {{ task_sid: string; status: string; date_updated: string; attributes: { channelType: string; }; queue_name: string; }} task
 * @returns {{ [queue_name: string]: typeof newQueueEntry }}
 */
export const addPendingTasks = (acc, task) => {
  if (task.status !== 'pending') return acc;

  const updated = task.date_updated;
  const channel = task.attributes.channelType;
  const queue = task.queue_name;
  const currentOldest = acc[queue].longestWaitingTask;
  const longestWaitingTask =
    currentOldest.updated !== null && currentOldest.updated < updated
      ? currentOldest
      : { taskId: task.task_sid, updated, waitingMinutes: null, intervalId: null };

  return {
    ...acc,
    [queue]: {
      ...acc[queue],
      [channel]: acc[queue][channel] + 1,
      longestWaitingTask,
    },
  };
};

/**
 * @returns {{ [queue_name: string]: typeof newQueueEntry }}
 */
export const getNewQueuesStatus = (cleanQueuesStatus, tasks, prevQueuesStatus, eachMinute) => {
  const intermidiate = Object.values(tasks).reduce(addPendingTasks, cleanQueuesStatus);

  return Object.entries(intermidiate).reduce((acc, [qName, newStatus]) => {
    const prevStatus = prevQueuesStatus && prevQueuesStatus[qName];
    const noTasksWaiting = newStatus.longestWaitingTask.taskId === null;
    const newLongestWaitingTaskId =
      !prevStatus || newStatus.longestWaitingTask.taskId !== prevStatus.longestWaitingTask.taskId;

    if (noTasksWaiting) {
      if (prevStatus) clearTimeout(prevStatus.longestWaitingTask.intervalId);
      return acc;
    }

    const waitingMillis = new Date().getTime() - new Date(newStatus.longestWaitingTask.updated).getTime();
    const waitingMinutes = Math.floor(waitingMillis / (60 * 1000)); // should use Math.round instead?

    if (newLongestWaitingTaskId) {
      if (prevStatus) clearTimeout(prevStatus.longestWaitingTask.intervalId);
      const intervalId = setInterval(() => eachMinute(qName, prevQueuesStatus), 1000 * 60);
      return {
        ...acc,
        [qName]: {
          ...newStatus,
          longestWaitingTask: { ...newStatus.longestWaitingTask, waitingMinutes, intervalId },
        },
      };
    }

    // at this point, prevStatus.longestWaitingTask is the longest waiting for this queue
    const { intervalId } = prevStatus.longestWaitingTask;
    return {
      ...acc,
      [qName]: {
        ...newStatus,
        longestWaitingTask: { ...newStatus.longestWaitingTask, waitingMinutes, intervalId },
      },
    };
  }, intermidiate);
};

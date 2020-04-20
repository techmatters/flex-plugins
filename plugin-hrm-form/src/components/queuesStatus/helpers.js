import { channelTypes } from '../../states/DomainConstants';

/**
 * @type {{ [K in keyof channelTypes]: number } & { longestWaitingTask: { taskId: string; updated: string } }}
 */
export const newQueueEntry = {
  facebook: 0,
  sms: 0,
  voice: 0,
  web: 0,
  whatsapp: 0,
  longestWaitingTask: { taskId: null, updated: null },
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
 * @param {{
 *  task_sid: string; status: string;
 *  date_updated: string;
 *  attributes: { channelType: string; };
 *  queue_name: string; }} task
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
      : { taskId: task.task_sid, updated };

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
 *
 * @returns {(tasks: any) => ({ [queue_name: string]: typeof newQueueEntry })}
 */
export const updateQueuesStatus = queuesStatus => tasks => Object.values(tasks).reduce(addPendingTasks, queuesStatus);

/**
 * @returns {{ [queue_name: string]: {
 *  longestWaitingTaskId: string;
 *  waitingMinutes: number;
 *  intervalId: NodeJS.Timeout;
 * } }}
 */
export const calculateQueuesWait = (queuesStatus, queuesLongestWait, callback) =>
  Object.entries(queuesStatus).reduce((acc, [qName, qStatus]) => {
    const thisQueue = queuesLongestWait && queuesLongestWait[qName];
    const noTasksWaiting = qStatus.longestWaitingTask.taskId === null;
    const newLongestWaitingTaskId = !thisQueue || thisQueue.longestWaitingTaskId !== qStatus.longestWaitingTask.taskId;

    if (noTasksWaiting) {
      if (thisQueue) clearTimeout(thisQueue.intervalId);
      return { ...acc, [qName]: null };
    }

    if (newLongestWaitingTaskId) {
      if (thisQueue) clearInterval(thisQueue.intervalId);
      const longestWaitingTaskId = qStatus.longestWaitingTask.taskId;
      const waitingMillis = new Date().getTime() - new Date(qStatus.longestWaitingTask.updated).getTime();
      const waitingMinutes = Math.floor(waitingMillis / (60 * 1000));
      const intervalId = setInterval(() => callback(qName), 1000 * 60);
      return { ...acc, [qName]: { longestWaitingTaskId, waitingMinutes, intervalId } };
    }

    // same task is the longest waiting for this queue
    return { ...acc, [qName]: queuesLongestWait[qName] };
  }, {});

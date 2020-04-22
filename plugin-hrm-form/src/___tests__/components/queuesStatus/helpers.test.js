/* eslint-disable camelcase */
import { omit } from 'lodash';

import {
  newQueueEntry,
  initializeQueuesStatus,
  addPendingTasks,
  getIntermidiateStatus,
  getNewQueuesStatus,
} from '../../../components/queuesStatus/helpers';
import { channelTypes } from '../../../states/DomainConstants';

test('Test newQueueEntry', () => {
  Object.keys(channelTypes).forEach(key => expect(newQueueEntry[key]).toEqual(0));
  expect(newQueueEntry.longestWaitingTask).toStrictEqual({
    taskId: null,
    updated: null,
    waitingMinutes: null,
  });
});

const queuesNames = ['Queue One', 'Queue Two', 'Queue Nine Nine'];
let cleanQueuesStatus;
test('Test initializeQueuesStatus', () => {
  const queues = {
    Q1: { queue_name: queuesNames[0] },
    Q2: { queue_name: queuesNames[1] },
    Q99: { queue_name: queuesNames[2] },
  };

  const result = initializeQueuesStatus(queues);

  Object.keys(result).forEach(key => {
    expect(result[key]).toStrictEqual(newQueueEntry);
    expect(queuesNames.some(item => item === key)).toBeTruthy();
  });

  cleanQueuesStatus = result;
});

const tasks = {
  T1: {
    task_sid: 'T1',
    status: 'pending',
    date_updated: '2020-04-14T21:36:28.045Z',
    attributes: { channelType: channelTypes.facebook },
    queue_name: queuesNames[0],
  },
  T2: {
    task_sid: 'T2',
    status: 'pending',
    date_updated: '2020-04-14T21:36:26.033Z',
    attributes: { channelType: channelTypes.web },
    queue_name: queuesNames[1],
  },
  T3: {
    task_sid: 'T3',
    status: 'pending',
    date_updated: '2020-04-14T21:25:00.012Z',
    attributes: { channelType: channelTypes.facebook },
    queue_name: queuesNames[0],
  },
  T4: {
    task_sid: 'T4',
    status: 'reserved',
  },
  T5: {
    task_sid: 'T5',
    status: 'wrapping',
  },
};

test('Test addPendingTasks', () => {
  const result1 = addPendingTasks(cleanQueuesStatus, tasks.T1);
  const result2 = addPendingTasks(result1, tasks.T2);
  const result3 = addPendingTasks(result2, tasks.T4);
  const result4 = addPendingTasks(result3, tasks.T3);

  expect(result1[queuesNames[0]].facebook).toBe(1);
  expect(result2[queuesNames[1]].web).toBe(1);
  expect(result3).toStrictEqual(result2);
  expect(result4[queuesNames[0]].facebook).toBe(2);
});

let queuesStatus;
test('Test getNewQueuesStatus with null prevQueuesStatus (first run)', () => {
  const intermidiate = getIntermidiateStatus(cleanQueuesStatus, tasks);
  const result = getNewQueuesStatus(intermidiate, null);
  expect(Object.keys(result).length).toBe(3);
  expect(result[queuesNames[0]].facebook).toBe(2);
  expect(result[queuesNames[1]].web).toBe(1);
  expect(result[queuesNames[0]].longestWaitingTask.updated).toBe(tasks.T3.date_updated);
  expect(result[queuesNames[1]].longestWaitingTask.updated).toBe(tasks.T2.date_updated);

  queuesStatus = result;
});

test('Test getNewQueuesStatus with same pending tasks', () => {
  const intermidiate = getIntermidiateStatus(cleanQueuesStatus, omit(tasks, 'T5'));
  const result = getNewQueuesStatus(intermidiate, queuesStatus);
  expect(result).toStrictEqual(queuesStatus);
});

const tasks2 = {
  ...tasks,
  T6: {
    task_sid: 'T6',
    status: 'pending',
    date_updated: '2020-03-14T21:25:00.012Z',
    attributes: { channelType: channelTypes.facebook },
    queue_name: queuesNames[0],
  },
};

test('Test getNewQueuesStatus with a new pending task (with older date_update)', () => {
  const intermidiate = getIntermidiateStatus(cleanQueuesStatus, tasks2);
  const result = getNewQueuesStatus(intermidiate, queuesStatus);
  expect(Object.keys(result).length).toBe(3);
  expect(result[queuesNames[0]].facebook).toBe(3);
  expect(result[queuesNames[1]].web).toBe(1);
  expect(result[queuesNames[0]].longestWaitingTask.updated).toBe(tasks2.T6.date_updated);
  expect(result[queuesNames[1]].longestWaitingTask.updated).toBe(tasks2.T2.date_updated);

  queuesStatus = result;
});

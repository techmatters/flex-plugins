/* eslint-disable camelcase */
import {
  newQueueEntry,
  initializeQueuesStatus,
  addPendingTasks,
  updateQueuesStatus,
} from '../../../components/queuesStatus/helpers';
import { channelTypes } from '../../../states/DomainConstants';

test('Test newQueueEntry', () => {
  Object.keys(channelTypes).forEach(key => expect(newQueueEntry[key]).toEqual(0));
  expect(newQueueEntry.oldestWaitingTask).toBeNull();
});

const queuesNames = ['Queue One', 'Queue Two', 'Queue Nine Nine'];
let queuesStatus;
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

  queuesStatus = result;
});

const tasks = {
  T1: {
    status: 'pending',
    date_updated: '2020-04-14T21:36:28.045Z',
    attributes: { channelType: channelTypes.facebook },
    queue_name: queuesNames[0],
  },
  T2: {
    status: 'pending',
    date_updated: '2020-04-14T21:36:26.033Z',
    attributes: { channelType: channelTypes.web },
    queue_name: queuesNames[1],
  },
  T3: {
    status: 'pending',
    date_updated: '2020-04-14T21:25:00.012Z',
    attributes: { channelType: channelTypes.facebook },
    queue_name: queuesNames[0],
  },
  T4: {
    status: 'reserved',
  },
  T5: {
    status: 'wrapping',
  },
};

test('Test addPendingTasks', () => {
  const result1 = addPendingTasks(queuesStatus, tasks.T1);
  const result2 = addPendingTasks(result1, tasks.T2);
  const result3 = addPendingTasks(result2, tasks.T4);
  const result4 = addPendingTasks(result3, tasks.T3);

  expect(result1[queuesNames[0]].facebook).toBe(1);
  expect(result2[queuesNames[1]].web).toBe(1);
  expect(result3).toStrictEqual(result2);
  expect(result4[queuesNames[0]].facebook).toBe(2);
});

test('Test updateQueuesStatus', () => {
  const result = updateQueuesStatus(queuesStatus)(tasks);
  expect(Object.keys(result).length).toBe(3);
  expect(result[queuesNames[0]].facebook).toBe(2);
  expect(result[queuesNames[1]].web).toBe(1);
  expect(result[queuesNames[0]].oldestWaitingTask).toBe(tasks.T3.date_updated);
  expect(result[queuesNames[1]].oldestWaitingTask).toBe(tasks.T2.date_updated);
});

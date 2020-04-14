/* eslint-disable camelcase */
import {
  newQueueEntry,
  initializeQueuesStatus,
  updateQueuesStatus,
  initializePendingTasks,
} from '../../../components/QueuesStatus/helpers';
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
    console.log(key);
    expect(queuesNames.some(item => item === key)).toBeTruthy();
  });

  queuesStatus = result;
});

let pendingTasks;
test('Test initializePendingTasks', () => {
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

  const result = initializePendingTasks(tasks);
  const resultKeys = Object.keys(result);
  expect(resultKeys.length).toBe(3);
  resultKeys.forEach(key => {
    expect(result[key].updated).toBe(tasks[key].date_updated);
    expect(result[key].channel).toBe(tasks[key].attributes.channelType);
    expect(result[key].queue).toBe(tasks[key].queue_name);
  });

  pendingTasks = result;
});

test('Test updateQueuesStatus', () => {
  const result = updateQueuesStatus(queuesStatus)(pendingTasks);
  expect(result[queuesNames[0]].facebook).toBe(2);
  expect(result[queuesNames[0]].oldestWaitingTask).toBe(pendingTasks.T3.updated);
  expect(result[queuesNames[1]].web).toBe(1);
});

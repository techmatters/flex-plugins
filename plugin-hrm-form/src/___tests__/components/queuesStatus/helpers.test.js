/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable camelcase */
import { omit } from 'lodash';

import {
  newQueueEntry,
  initializeQueuesStatus,
  addPendingTasks,
  getNewQueuesStatus,
} from '../../../components/queuesStatus/helpers';
import { coreChannelTypes } from '../../../states/DomainConstants';

test('Test newQueueEntry', () => {
  Object.keys(coreChannelTypes).forEach(key => expect(newQueueEntry[key]).toEqual(0));
  expect(newQueueEntry.longestWaitingDate).toBeNull();
});

const queuesNames = ['Queue One', 'Queue Two', 'Queue Nine Nine'];
let cleanQueuesStatus;
test('Test initializeQueuesStatus', () => {
  const counselorQueues = [...queuesNames];
  const result = initializeQueuesStatus(counselorQueues);

  expect(Object.keys(result)).toHaveLength(3);
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
    date_created: '2020-04-14T21:36:28.045Z',
    attributes: { channelType: coreChannelTypes.messenger },
    queue_name: queuesNames[0],
  },
  T2: {
    task_sid: 'T2',
    status: 'pending',
    date_created: '2020-04-14T21:36:26.033Z',
    attributes: { channelType: coreChannelTypes.web },
    queue_name: queuesNames[1],
  },
  T3: {
    task_sid: 'T3',
    status: 'reserved',
    date_created: '2020-04-14T21:25:00.012Z',
    attributes: { channelType: coreChannelTypes.messenger },
    queue_name: queuesNames[0],
  },
  T4: {
    task_sid: 'T4',
    status: 'assigned',
  },
  T5: {
    task_sid: 'T5',
    status: 'wrapping',
  },
  T6: {
    task_sid: 'T6',
    status: 'pending',
    channel_type: 'voice',
    date_created: '2020-04-14T21:36:00.012Z',
    attributes: { channelType: coreChannelTypes.messenger }, // this should be ignored
    queue_name: queuesNames[0],
  },
  T7: {
    task_sid: 'T7',
    status: 'pending',
    date_created: '2020-04-14T21:36:00.012Z',
    attributes: { channelType: coreChannelTypes.sms },
    queue_name: queuesNames[0],
  },
  T8: {
    task_sid: 'T8',
    status: 'pending',
    date_created: '2020-04-14T21:36:00.012Z',
    attributes: { channelType: coreChannelTypes.whatsapp },
    queue_name: queuesNames[0],
  },
};

test('Test addPendingTasks', () => {
  const result1 = addPendingTasks(cleanQueuesStatus, tasks.T1);
  const result2 = addPendingTasks(result1, tasks.T2);
  const result3 = addPendingTasks(result2, tasks.T4);
  const result4 = addPendingTasks(result3, tasks.T3);
  const result5 = addPendingTasks(result4, tasks.T6);
  const result6 = addPendingTasks(result4, tasks.T7);
  const result7 = addPendingTasks(result4, tasks.T8);

  expect(result1[queuesNames[0]].messenger).toBe(1);
  expect(result2[queuesNames[1]].web).toBe(1);
  expect(result3).toStrictEqual(result2);
  expect(result4[queuesNames[0]].messenger).toBe(2);
  expect(result5[queuesNames[0]].messenger).toBe(2); // not changed
  expect(result5[queuesNames[0]].voice).toBe(1);
  expect(result6[queuesNames[0]].sms).toBe(1);
  expect(result7[queuesNames[0]].whatsapp).toBe(1);
});

let queuesStatus;
test('Test getNewQueuesStatus', () => {
  const result = getNewQueuesStatus(cleanQueuesStatus, tasks);
  expect(Object.keys(result).length).toBe(3); // 3 queues
  expect(result[queuesNames[0]].messenger).toBe(2);
  expect(result[queuesNames[0]].voice).toBe(1);
  expect(result[queuesNames[0]].sms).toBe(1);
  expect(result[queuesNames[0]].whatsapp).toBe(1);
  expect(result[queuesNames[1]].web).toBe(1);
  expect(result[queuesNames[0]].longestWaitingDate).toBe(tasks.T3.date_created);
  expect(result[queuesNames[1]].longestWaitingDate).toBe(tasks.T2.date_created);

  queuesStatus = result;
});

test('Test getNewQueuesStatus with different non pending task', () => {
  const result = getNewQueuesStatus(cleanQueuesStatus, omit(tasks, 'T5'));
  expect(result).toStrictEqual(queuesStatus);
});

const tasks2 = {
  ...tasks,
  T9: {
    task_sid: 'T9',
    status: 'pending',
    date_created: '2020-03-14T21:25:00.012Z',
    attributes: { channelType: coreChannelTypes.messenger },
    queue_name: queuesNames[0],
  },
};

test('Test getNewQueuesStatus with a new pending task (with older date_update)', () => {
  const result = getNewQueuesStatus(cleanQueuesStatus, tasks2);
  expect(Object.keys(result).length).toBe(3); // 3 queues
  expect(result[queuesNames[0]].messenger).toBe(3);
  expect(result[queuesNames[0]].sms).toBe(1);
  expect(result[queuesNames[0]].whatsapp).toBe(1);
  expect(result[queuesNames[1]].web).toBe(1);
  expect(result[queuesNames[0]].longestWaitingDate).toBe(tasks2.T9.date_created);
  expect(result[queuesNames[1]].longestWaitingDate).toBe(tasks2.T2.date_created);

  queuesStatus = result;
});

const tasks3 = {
  ...tasks2,
  T10: {
    task_sid: 'T10',
    status: 'pending',
    date_created: '2020-03-14T21:25:00.013Z',
    attributes: { channelType: coreChannelTypes.messenger },
    queue_name: queuesNames[0],
  },
};

test('Test getNewQueuesStatus with a new pending task (with newer date_update)', () => {
  const result = getNewQueuesStatus(cleanQueuesStatus, tasks3);
  expect(Object.keys(result).length).toBe(3); // 3 queues
  expect(result[queuesNames[0]].messenger).toBe(4);
  expect(result[queuesNames[0]].sms).toBe(1);
  expect(result[queuesNames[0]].whatsapp).toBe(1);
  expect(result[queuesNames[1]].web).toBe(1);
  expect(result[queuesNames[0]].longestWaitingDate).toBe(tasks3.T9.date_created);
  expect(result[queuesNames[1]].longestWaitingDate).toBe(tasks3.T2.date_created);

  queuesStatus = result;
});

/* eslint-disable camelcase */
import React from 'react';
import { mount } from 'enzyme';

import { InnerQueuesStatusWriter as QueuesStatusWriter } from '../../../components/queuesStatus/QueuesStatusWriter';
import { channelTypes } from '../../../states/DomainConstants';
import { newQueueEntry, initializeQueuesStatus, getNewQueuesStatus } from '../../../components/queuesStatus/helpers';

console.log = jest.fn();
console.error = jest.fn();

const queues = { Q1: { queue_name: 'Q1' }, Admin: { queue_name: 'Admin' } };

const secondsAgo = new Date();
const oneMinuteAgo = new Date(secondsAgo.getTime() - 60 * 1000);
const twoMinutesAgo = new Date(oneMinuteAgo.getTime() - 60 * 1000);

const tasks = {
  T1: {
    status: 'pending',
    date_created: oneMinuteAgo,
    channel_type: channelTypes.voice,
    queue_name: 'Admin',
    attributes: { channelType: undefined },
  },
  T2: {
    status: 'pending',
    date_created: twoMinutesAgo,
    queue_name: 'Q1',
    attributes: { channelType: channelTypes.web },
  },
  T3: {
    status: 'pending',
    date_created: twoMinutesAgo,
    queue_name: 'Admin',
    attributes: { channelType: channelTypes.facebook },
  },
};

const newTasks = {
  T4: {
    status: 'pending',
    date_created: secondsAgo,
    queue_name: 'Q1',
    attributes: { channelType: channelTypes.whatsapp },
  },
  T5: {
    status: 'pending',
    date_created: secondsAgo,
    queue_name: 'Admin',
    attributes: { channelType: channelTypes.sms },
  },
};

const clearQueuesStatus = initializeQueuesStatus(Object.keys(queues));
const queuesStatus = getNewQueuesStatus(clearQueuesStatus, tasks);
const newQueuesStatus = getNewQueuesStatus(clearQueuesStatus, { ...tasks, ...newTasks });
const afterDeleteQueuesStatus = getNewQueuesStatus(clearQueuesStatus, { T3: tasks.T3, ...newTasks });

test('Test <QueuesStatusWriter> should suscribe to Admin queue only', () => {
  const events = {};

  const innerTasks = {};
  innerTasks.T1 = tasks.T1;
  innerTasks.T2 = tasks.T2;
  innerTasks.T3 = tasks.T3;

  const queuesQuery = { getItems: () => queues, close: jest.fn() };
  const tasksQuery = {
    getItems: () => innerTasks,
    on: jest.fn((event, cb) => {
      events[event] = cb;
    }),
    close: jest.fn(),
  };

  const spy = jest.spyOn(QueuesStatusWriter.prototype, 'updateQueuesState');

  const ownProps = {
    insightsClient: {
      liveQuery: jest.fn((query, _) => {
        if (query === 'tr-queue') {
          return new Promise(resolve => resolve(queuesQuery));
        }
        if (query === 'tr-task') {
          return new Promise(resolve => resolve(tasksQuery));
        }

        return undefined;
      }),
    },
  };

  const queuesStatusState = {
    queuesStatus: null,
    error: 'Not initialized',
    loading: true,
  };
  const queuesStatusUpdate = jest.fn();
  const queuesStatusFailure = jest.fn();
  const reduxProps = { queuesStatusState, queuesStatusUpdate, queuesStatusFailure };

  const mounted = mount(<QueuesStatusWriter {...ownProps} {...reduxProps} />);

  return Promise.resolve(mounted)
    .then(() => undefined)
    .then(() => {
      expect(ownProps.insightsClient.liveQuery).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(tasksQuery.getItems(), { Admin: newQueueEntry });
      expect(queuesStatusUpdate).toHaveBeenCalledWith({ Admin: queuesStatus.Admin });
      expect(queuesStatusFailure).not.toHaveBeenCalled();
      expect(mounted.state('tasksQuery')).not.toBeNull();

      spy.mockClear();
      queuesStatusUpdate.mockClear();

      // simulate new state (adding tasks)
      innerTasks.T4 = newTasks.T4;
      innerTasks.T5 = newTasks.T5;

      // simulate update events
      events.itemUpdated({ key: 'T4', value: newTasks.T4 });
      expect(queuesStatusUpdate).not.toHaveBeenCalled();

      events.itemUpdated({ key: 'T5', value: newTasks.T5 });
      expect(queuesStatusUpdate).toHaveBeenCalledWith({ Admin: newQueuesStatus.Admin });

      spy.mockClear();
      queuesStatusUpdate.mockClear();

      // simulate new state (removing tasks)
      delete innerTasks.T1;
      delete innerTasks.T2;

      // simulate removed events
      events.itemRemoved({ key: 'T2' });
      expect(queuesStatusUpdate).not.toHaveBeenCalled();

      events.itemRemoved({ key: 'T1' });
      expect(queuesStatusUpdate).toHaveBeenCalledWith({ Admin: afterDeleteQueuesStatus.Admin });

      mounted.unmount();
      expect(tasksQuery.close).toBeCalled();
    });
});

test('Test <QueuesStatusWriter> should suscribe to Q1 queue only', () => {
  const events = {};

  const innerTasks = {};
  innerTasks.T1 = tasks.T1;
  innerTasks.T2 = tasks.T2;
  innerTasks.T3 = tasks.T3;

  const queuesQuery = { getItems: () => queues, close: jest.fn() };
  const tasksQuery = {
    getItems: () => innerTasks,
    on: jest.fn((event, cb) => {
      events[event] = cb;
    }),
    close: jest.fn(),
  };

  const spy = jest.spyOn(QueuesStatusWriter.prototype, 'updateQueuesState');

  const ownProps = {
    insightsClient: {
      liveQuery: jest.fn((query, _) => {
        if (query === 'tr-queue') {
          return new Promise(resolve => resolve(queuesQuery));
        }
        if (query === 'tr-task') {
          return new Promise(resolve => resolve(tasksQuery));
        }

        return undefined;
      }),
    },
    helpline: 'Q1',
  };

  const queuesStatusState = {
    queuesStatus: null,
    error: 'Not initialized',
    loading: true,
  };
  const queuesStatusUpdate = jest.fn();
  const queuesStatusFailure = jest.fn();
  const reduxProps = { queuesStatusState, queuesStatusUpdate, queuesStatusFailure };

  const mounted = mount(<QueuesStatusWriter {...ownProps} {...reduxProps} />);

  return Promise.resolve(mounted)
    .then(() => undefined)
    .then(() => {
      expect(ownProps.insightsClient.liveQuery).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(tasksQuery.getItems(), { Q1: newQueueEntry });
      expect(queuesStatusUpdate).toHaveBeenCalledWith({ Q1: queuesStatus.Q1 });
      expect(queuesStatusFailure).not.toHaveBeenCalled();
      expect(mounted.state('tasksQuery')).not.toBeNull();

      spy.mockClear();
      queuesStatusUpdate.mockClear();

      // simulate new state
      innerTasks.T4 = newTasks.T4;
      innerTasks.T5 = newTasks.T5;

      // simulate events
      events.itemUpdated({ value: newTasks.T5 });
      expect(queuesStatusUpdate).not.toHaveBeenCalled();

      events.itemUpdated({ value: newTasks.T4 });
      expect(queuesStatusUpdate).toHaveBeenCalledWith({ Q1: newQueuesStatus.Q1 });

      spy.mockClear();
      queuesStatusUpdate.mockClear();

      // simulate new state (removing tasks)
      delete innerTasks.T1;
      delete innerTasks.T2;

      // simulate removed events
      events.itemRemoved({ key: 'T1' });
      expect(queuesStatusUpdate).not.toHaveBeenCalled();

      events.itemRemoved({ key: 'T2' });
      expect(queuesStatusUpdate).toHaveBeenCalledWith({ Q1: afterDeleteQueuesStatus.Q1 });

      mounted.unmount();
      expect(tasksQuery.close).toBeCalled();
    });
});

test('Test <QueuesStatusWriter> should fail', () => {
  const ownProps = {
    insightsClient: {
      liveQuery: jest.fn((query, _) => {
        if (query === 'tr-queue') {
          return new Promise((resolve, reject) => reject(new Error('Some error')));
        }
        if (query === 'tr-task') {
          return new Promise((resolve, reject) => reject(new Error('Some error')));
        }

        return undefined;
      }),
    },
  };

  const queuesStatusState = {
    queuesStatus: null,
    error: 'Not initialized',
    loading: true,
  };
  const queuesStatusUpdate = jest.fn();
  const queuesStatusFailure = jest.fn();
  const reduxProps = { queuesStatusState, queuesStatusUpdate, queuesStatusFailure };

  const mounted = mount(<QueuesStatusWriter {...ownProps} {...reduxProps} />);

  return (
    Promise.resolve(mounted)
      // .then(() => undefined) fails on the 1st await so we need only 1 then clause
      .then(() => {
        expect(ownProps.insightsClient.liveQuery).toHaveBeenCalledTimes(1);
        expect(queuesStatusFailure).toHaveBeenCalledWith("Error, couldn't subscribe to live updates");
        expect(queuesStatusUpdate).not.toHaveBeenCalled();
        expect(mounted.state('tasksQuery')).toBeNull();
      })
  );
});

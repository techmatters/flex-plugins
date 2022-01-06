/* eslint-disable camelcase */
import React from 'react';
import { mount } from 'enzyme';

import { InnerQueuesStatusWriter as QueuesStatusWriter } from '../../../components/queuesStatus/QueuesStatusWriter';
import { channelTypes } from '../../../states/DomainConstants';
import { newQueueEntry, initializeQueuesStatus, getNewQueuesStatus } from '../../../components/queuesStatus/helpers';

jest.mock('../../../components/CSAMReport/CSAMReportFormDefinition');

jest.mock('../../../services/ServerlessService', () => ({
  listWorkerQueues: async ({ workerSid }) => {
    if (workerSid === 'worker-admin')
      return { workerQueues: [{ friendlyName: 'Admin' }, { friendlyName: 'Everyone' }] };
    if (workerSid === 'worker-Q1') return { workerQueues: [{ friendlyName: 'Q1' }, { friendlyName: 'Everyone' }] };
    throw new Error('No matching worker');
  },
}));

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
  T4: {
    status: 'pending',
    date_created: twoMinutesAgo,
    channel_type: 'default',
    queue_name: 'Admin',
    attributes: { channelType: undefined },
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
  T5: {
    status: 'pending',
    date_created: secondsAgo,
    channel_type: 'default',
    queue_name: 'Admin',
    attributes: { channelType: undefined },
  },
};

const clearQueuesStatus = initializeQueuesStatus(Object.keys(queues));
const queuesStatus = getNewQueuesStatus(clearQueuesStatus, tasks);
const newQueuesStatus = getNewQueuesStatus(clearQueuesStatus, { ...tasks, ...newTasks });
const afterDeleteQueuesStatus = getNewQueuesStatus(clearQueuesStatus, { T3: tasks.T3, ...newTasks });

describe('QueuesStatusWriter should subscribe to Admin queue only', () => {
  const events = {};

  const innerTasks = {
    T1: tasks.T1,
    T2: tasks.T2,
    T3: tasks.T3,
  };

  const workerQuery = {
    on: jest.fn(),
    close: jest.fn(),
  };
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
        if (query === 'tr-worker') {
          return Promise.resolve(workerQuery);
        }
        if (query === 'tr-task') {
          return Promise.resolve(tasksQuery);
        }

        return undefined;
      }),
    },
    workerSid: 'worker-admin',
  };

  const queuesStatusState = {
    queuesStatus: null,
    error: 'Not initialized',
    loading: true,
  };
  const queuesStatusUpdate = jest.fn();
  const queuesStatusFailure = jest.fn();
  const reduxProps = { queuesStatusState, queuesStatusUpdate, queuesStatusFailure };

  let mounted;
  test('Test mount', async () => {
    mounted = mount(<QueuesStatusWriter {...ownProps} {...reduxProps} />);

    await Promise.resolve(); // resolves listWorkerQueues
    await Promise.resolve(); // resolves worker
    await Promise.resolve(); // resolves tasksQuery

    expect(ownProps.insightsClient.liveQuery).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(tasksQuery.getItems(), { Admin: newQueueEntry });
    expect(queuesStatusUpdate).toHaveBeenCalledWith({ Admin: queuesStatus.Admin });
    expect(queuesStatusFailure).not.toHaveBeenCalled();
    expect(mounted.state('tasksQuery')).not.toBeNull();

    spy.mockClear();
    queuesStatusUpdate.mockClear();
  });

  test('Test events', () => {
    expect(mounted.state().trackedTasks).toStrictEqual({ T1: true, T3: true });

    // simulate new state (adding tasks)
    innerTasks.T4 = newTasks.T4;
    innerTasks.T5 = newTasks.T5;

    // simulate update events
    events.itemUpdated({ key: 'T4', value: newTasks.T4 });
    expect(queuesStatusUpdate).not.toHaveBeenCalled();

    events.itemUpdated({ key: 'T5', value: newTasks.T5 });
    expect(queuesStatusUpdate).toHaveBeenCalledWith({ Admin: newQueuesStatus.Admin });
    expect(mounted.state().trackedTasks).toStrictEqual({ T1: true, T3: true, T5: true });

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
    expect(mounted.state().trackedTasks).toStrictEqual({ T3: true, T5: true });
  });

  test('Test unmount', () => {
    mounted.unmount();
    expect(tasksQuery.close).toBeCalled();
  });
});

describe('QueuesStatusWriter should subscribe to Q1 queue only', () => {
  const events = {};

  const innerTasks = {
    T1: tasks.T1,
    T2: tasks.T2,
    T3: tasks.T3,
  };

  const workerQuery = {
    on: jest.fn(),
    close: jest.fn(),
  };
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
      // eslint-disable-next-line sonarjs/no-identical-functions
      liveQuery: jest.fn((query, _) => {
        if (query === 'tr-worker') {
          return Promise.resolve(workerQuery);
        }
        if (query === 'tr-task') {
          return Promise.resolve(tasksQuery);
        }

        return undefined;
      }),
    },
    workerSid: 'worker-Q1',
  };

  const queuesStatusState = {
    queuesStatus: null,
    error: 'Not initialized',
    loading: true,
  };
  const queuesStatusUpdate = jest.fn();
  const queuesStatusFailure = jest.fn();
  const reduxProps = { queuesStatusState, queuesStatusUpdate, queuesStatusFailure };

  let mounted;
  test('Test mount', async () => {
    mounted = mount(<QueuesStatusWriter {...ownProps} {...reduxProps} />);

    await Promise.resolve(); // resolves listWorkerQueues
    await Promise.resolve(); // resolves worker
    await Promise.resolve(); // resolves tasksQuery

    expect(ownProps.insightsClient.liveQuery).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(tasksQuery.getItems(), { Q1: newQueueEntry });
    expect(queuesStatusUpdate).toHaveBeenCalledWith({ Q1: queuesStatus.Q1 });
    expect(queuesStatusFailure).not.toHaveBeenCalled();
    expect(mounted.state('tasksQuery')).not.toBeNull();

    spy.mockClear();
    queuesStatusUpdate.mockClear();
  });

  test('Test events', () => {
    expect(mounted.state().trackedTasks).toStrictEqual({ T2: true });

    // simulate new state
    innerTasks.T4 = newTasks.T4;
    innerTasks.T5 = newTasks.T5;

    // simulate events
    events.itemUpdated({ value: newTasks.T5 });
    expect(queuesStatusUpdate).not.toHaveBeenCalled();

    events.itemUpdated({ key: 'T4', value: newTasks.T4 });
    expect(queuesStatusUpdate).toHaveBeenCalledWith({ Q1: newQueuesStatus.Q1 });
    expect(mounted.state().trackedTasks).toStrictEqual({ T2: true, T4: true });

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
    expect(mounted.state().trackedTasks).toStrictEqual({ T4: true });
  });

  test('Test unmount', () => {
    mounted.unmount();
    expect(tasksQuery.close).toBeCalled();
  });
});

describe('QueuesStatusWriter should fail trying to subscribe', () => {
  test('Test fail on tasksQuery', async () => {
    const workerQuery = {
      on: jest.fn(),
      close: jest.fn(),
    };

    const ownProps = {
      insightsClient: {
        liveQuery: jest.fn((query, _) => {
          if (query === 'tr-worker') {
            return Promise.resolve(workerQuery);
          }
          if (query === 'tr-task') {
            return Promise.reject(new Error('Some error'));
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

    await Promise.resolve(); // resolves listWorkerQueues
    await Promise.resolve(); // resolves worker
    await Promise.resolve(); // resolves tasksQuery

    expect(ownProps.insightsClient.liveQuery).toHaveBeenCalledTimes(1);
    expect(queuesStatusFailure).toHaveBeenCalledWith("Error, couldn't subscribe to live updates");
    expect(queuesStatusUpdate).not.toHaveBeenCalled();
    expect(mounted.state('tasksQuery')).toBeNull();
  });

  test('Test fail on workersQuery', async () => {
    const ownProps = {
      insightsClient: {
        liveQuery: jest.fn((query, _) => {
          if (query === 'tr-worker') {
            return Promise.reject(new Error('Some error'));
          }
          if (query === 'tr-task') {
            return Promise.reject(new Error('Some error'));
          }

          return undefined;
        }),
      },
      workerSid: 'worker-admin',
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

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(ownProps.insightsClient.liveQuery).toHaveBeenCalledTimes(2);
    expect(queuesStatusFailure).toHaveBeenCalledWith("Error, couldn't subscribe to live updates");
    expect(queuesStatusUpdate).not.toHaveBeenCalled();
    expect(mounted.state('tasksQuery')).toBeNull();
  });
});

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

import React, { useEffect, useState } from 'react';
import { Manager } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
  queuesStatusUpdate as newQueuesStatusUpdateAction,
  queuesStatusFailure as newQueuesStatusFailureAction,
} from '../../states/queuesStatus/actions';
import * as h from './helpers';
import { namespace, queuesStatusBase } from '../../states/storeNamespaces';
import { listWorkerQueues } from '../../services/twilioWorkerService';
import { WorkerSID } from '../../types/twilio';

const mapStateToProps = state => {
  const queuesStatusState = state[namespace][queuesStatusBase];

  return { queuesStatusState };
};

const mapDispatchToProps = dispatch => {
  return {
    queuesStatusUpdate: bindActionCreators(newQueuesStatusUpdateAction, dispatch),
    queuesStatusFailure: bindActionCreators(newQueuesStatusFailureAction, dispatch),
  };
};

type OwnProps = {
  insightsClient: ReturnType<typeof Manager.getInstance>['insightsClient'];
  workerSid: WorkerSID;
  queuesStatusState: {
    queuesStatus?: {};
    error?: string;
    loading?: boolean;
  };
  queuesStatusUpdate: (queuesStatus: {}) => void;
  queuesStatusFailure: (error: string) => void;
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & OwnProps;

const QueuesStatusWriter: React.FC<Props> = ({
  workerSid,
  insightsClient,
  queuesStatusUpdate,
  queuesStatusFailure,
}) => {
  const handleSubscribeError = err => {
    const error = "Error, couldn't subscribe to live updates";
    queuesStatusFailure(error);
    console.error(error, err);
  };

  const updateQueuesState = (tasks, prevQueuesStatus) => {
    const queuesStatus = h.getNewQueuesStatus(prevQueuesStatus, tasks);
    queuesStatusUpdate(queuesStatus);
  };

  // eslint-disable-next-line camelcase
  type LiveQueryResultItems = { [key: string]: { status: string; queue_name: string } };

  const waitingInCounselorQueues = (tasksItems: LiveQueryResultItems, counselorQueues) =>
    Object.entries(tasksItems).reduce(
      (acc, [sid, task]) =>
        h.isWaiting(task.status) && counselorQueues.includes(task.queue_name) ? { ...acc, [sid]: true } : acc,
      {},
    );

  const [trackedTasks, setTrackedTasks] = useState(null);
  const [tasksQuery, setTasksQuery] = useState(null);
  const [workerQuery, setWorkerQuery] = useState(null);

  const subscribeToQueuesUpdates = async () => {
    try {
      // fetch the array of queues the counselor matches (excluding "Everyone")
      const { workerQueues } = await listWorkerQueues({ workerSid });
      const counselorQueues = workerQueues.map(q => q.friendlyName).filter(q => q !== 'Everyone');

      const cleanQueuesStatus = h.initializeQueuesStatus(counselorQueues);

      const liveQueryResult = await insightsClient.liveQuery('tr-task', '');

      const tasksItems = liveQueryResult.getItems();

      // tasks that are waiting and belong to a queue the counselor cares about, at the moment of this component mount
      const queuedTasks = waitingInCounselorQueues(tasksItems as any, counselorQueues);

      updateQueuesState(tasksItems, cleanQueuesStatus);
      setTrackedTasks(queuedTasks);
      setTasksQuery(tasksQuery);

      const shouldUpdate = status =>
        h.isPending(status) || h.isReserved(status) || h.isAssigned(status) || h.isCanceled(status);

      liveQueryResult.on('itemUpdated', args => {
        // eslint-disable-next-line camelcase
        const { status, queue_name } = args.value;
        if (counselorQueues.includes(queue_name) && shouldUpdate(status)) {
          updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          setTrackedTasks({ ...trackedTasks, [args.key]: true });
        }
      });

      liveQueryResult.on('itemRemoved', args => {
        if (trackedTasks[args.key]) {
          updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          const { [args.key as string]: _, ...rest } = trackedTasks;
          setTrackedTasks(rest);
        }
      });
    } catch (err) {
      handleSubscribeError(err);
    }
  };

  useEffect(() => {
    try {
      subscribeToQueuesUpdates().then(() => {
        /* suppress warning */
      });
      insightsClient.liveQuery('tr-worker', `data.worker_sid == "${workerSid}"`).then(workerQueryResult => {
        setWorkerQuery(workerQueryResult);

        workerQueryResult.on('itemUpdated', async _args => {
          await subscribeToQueuesUpdates();
        });
      });
    } catch (err) {
      handleSubscribeError(err);
    }
    return () => {
      if (tasksQuery) tasksQuery.close();
      if (workerQuery) workerQuery.close();
    };
  }, []);

  return null;
};

QueuesStatusWriter.displayName = 'QueuesStatusWriter';

export default connector(QueuesStatusWriter);

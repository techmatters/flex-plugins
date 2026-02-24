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

import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { omit } from 'lodash';

import { queuesStatusUpdate, queuesStatusFailure } from '../../states/queuesStatus/actions';
import * as h from './helpers';
import { namespace, queuesStatusBase } from '../../states/storeNamespaces';
import { listWorkerQueues } from '../../services/twilioWorkerService';
import type { QueuesStatus } from '../../states/queuesStatus/types';
import type { RootState } from '../../states';

type InsightsClient = {
  liveQuery: (table: string, query: string) => Promise<any>;
};

type QueuesStatusState = {
  queuesStatus: QueuesStatus;
  error?: string;
  loading: boolean;
};

type Props = {
  insightsClient: InsightsClient;
  workerSid: string;
};

type InnerProps = Props & {
  queuesStatusState: QueuesStatusState;
  queuesStatusUpdate: (queuesStatus: QueuesStatus) => void;
  queuesStatusFailure: (error: string) => void;
};

export const InnerQueuesStatusWriter: React.FC<InnerProps> = ({
  insightsClient,
  workerSid,
  queuesStatusUpdate: queuesStatusUpdateProp,
  queuesStatusFailure: queuesStatusFailureProp,
}) => {
  const tasksQueryRef = useRef<any>(null);
  const workerQueryRef = useRef<any>(null);
  const trackedTasksRef = useRef<Record<string, boolean>>({});

  // Keep refs to the latest callbacks to avoid stale closures in the effect
  const queuesStatusUpdateRef = useRef(queuesStatusUpdateProp);
  queuesStatusUpdateRef.current = queuesStatusUpdateProp;
  const queuesStatusFailureRef = useRef(queuesStatusFailureProp);
  queuesStatusFailureRef.current = queuesStatusFailureProp;

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    const handleSubscribeError = (err: unknown) => {
      const error = "Error, couldn't subscribe to live updates";
      queuesStatusFailureRef.current(error);
      console.error(error, err);
    };

    const updateQueuesState = (tasks: any, prevQueuesStatus: QueuesStatus) => {
      const queuesStatus = h.getNewQueuesStatus(prevQueuesStatus, tasks);
      queuesStatusUpdateRef.current(queuesStatus);
    };

    const waitingInCounselorQueues = (
      tasksItems: Record<string, any>,
      counselorQueues: string[],
    ): Record<string, boolean> =>
      Object.entries(tasksItems).reduce<Record<string, boolean>>(
        (acc, [sid, task]) =>
          h.isWaiting(task.status) && counselorQueues.includes(task.queue_name) ? { ...acc, [sid]: true } : acc,
        {},
      );

    const subscribeToQueuesUpdates = async () => {
      try {
        // fetch the array of queues the counselor matches (excluding "Everyone")
        const { workerQueues } = await listWorkerQueues({ workerSid });
        const counselorQueues = workerQueues.map(q => q.friendlyName).filter(q => q !== 'Everyone');

        const cleanQueuesStatus = h.initializeQueuesStatus(counselorQueues);

        const tasksQuery = await insightsClient.liveQuery('tr-task', '');

        const tasksItems = tasksQuery.getItems();

        // tasks that are waiting and belong to a queue the counselor cares about, at the moment of this component mount
        const trackedTasks = waitingInCounselorQueues(tasksItems, counselorQueues);

        updateQueuesState(tasksItems, cleanQueuesStatus);
        tasksQueryRef.current = tasksQuery;
        trackedTasksRef.current = trackedTasks;

        const shouldUpdate = (status: string) =>
          h.isPending(status) || h.isReserved(status) || h.isAssigned(status) || h.isCanceled(status);

        tasksQuery.on('itemUpdated', (args: any) => {
          // eslint-disable-next-line camelcase
          const { status, queue_name } = args.value;
          if (counselorQueues.includes(queue_name) && shouldUpdate(status)) {
            updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
            trackedTasksRef.current = { ...trackedTasksRef.current, [args.key]: true };
          }
        });

        tasksQuery.on('itemRemoved', (args: any) => {
          if (trackedTasksRef.current[args.key]) {
            updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
            trackedTasksRef.current = omit(trackedTasksRef.current, args.key);
          }
        });
      } catch (err) {
        handleSubscribeError(err);
      }
    };

    const init = async () => {
      try {
        await subscribeToQueuesUpdates();

        const workerQuery = await insightsClient.liveQuery('tr-worker', `data.worker_sid == "${workerSid}"`);
        workerQueryRef.current = workerQuery;

        workerQuery.on('itemUpdated', async (_args: any) => {
          await subscribeToQueuesUpdates();
        });
      } catch (err) {
        handleSubscribeError(err);
      }
    };

    init();

    return () => {
      // unsubscribe
      if (tasksQueryRef.current) tasksQueryRef.current.close();
      if (workerQueryRef.current) workerQueryRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

InnerQueuesStatusWriter.displayName = 'QueuesStatusWriter';

const QueuesStatusWriter: React.FC<Props> = props => {
  const dispatch = useDispatch();
  const queuesStatusState = useSelector((state: RootState) => state[namespace][queuesStatusBase]);

  const queuesStatusUpdateCallback = useCallback(
    (queuesStatus: QueuesStatus) => dispatch(queuesStatusUpdate(queuesStatus)),
    [dispatch],
  );

  const queuesStatusFailureCallback = useCallback((error: string) => dispatch(queuesStatusFailure(error)), [dispatch]);

  return (
    <InnerQueuesStatusWriter
      {...props}
      queuesStatusState={queuesStatusState}
      queuesStatusUpdate={queuesStatusUpdateCallback}
      queuesStatusFailure={queuesStatusFailureCallback}
    />
  );
};

export default QueuesStatusWriter;

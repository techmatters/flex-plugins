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

import React, { useCallback } from 'react';
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

type State = {
  tasksQuery: any;
  workerQuery: any;
  trackedTasks: Record<string, boolean> | null;
};

export class InnerQueuesStatusWriter extends React.Component<InnerProps, State> {
  static displayName = 'QueuesStatusWriter';

  constructor(props: InnerProps) {
    super(props);
    this.updateQueuesState = this.updateQueuesState.bind(this);
  }

  state: State = {
    tasksQuery: null,
    workerQuery: null,
    trackedTasks: null,
  };

  async componentDidMount() {
    try {
      await this.subscribeToQueuesUpdates();

      const workerQuery = await this.props.insightsClient.liveQuery(
        'tr-worker',
        `data.worker_sid == "${this.props.workerSid}"`,
      );
      this.setState({ workerQuery });

      workerQuery.on('itemUpdated', async (_args: any) => {
        await this.subscribeToQueuesUpdates();
      });
    } catch (err) {
      this.handleSubscribeError(err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery, workerQuery } = this.state;
    // unsubscribe
    if (tasksQuery) tasksQuery.close();
    if (workerQuery) workerQuery.close();
  }

  async subscribeToQueuesUpdates() {
    const { workerSid } = this.props;
    try {
      // fetch the array of queues the counselor matches (excluding "Everyone")
      const { workerQueues } = await listWorkerQueues({ workerSid });
      const counselorQueues = workerQueues.map(q => q.friendlyName).filter(q => q !== 'Everyone');

      const cleanQueuesStatus = h.initializeQueuesStatus(counselorQueues);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      const tasksItems = tasksQuery.getItems();

      // tasks that are waiting and belong to a queue the counselor cares about, at the moment of this component mount
      const trackedTasks = this.waitingInCounselorQueues(tasksItems, counselorQueues);

      this.updateQueuesState(tasksItems, cleanQueuesStatus);
      this.setState({ tasksQuery, trackedTasks });

      const shouldUpdate = (status: string) =>
        h.isPending(status) || h.isReserved(status) || h.isAssigned(status) || h.isCanceled(status);

      tasksQuery.on('itemUpdated', (args: any) => {
        // eslint-disable-next-line camelcase
        const { status, queue_name } = args.value;
        if (counselorQueues.includes(queue_name) && shouldUpdate(status)) {
          this.updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          this.setState(prev => ({ trackedTasks: { ...prev.trackedTasks, [args.key]: true } }));
        }
      });

      tasksQuery.on('itemRemoved', (args: any) => {
        if (this.state.trackedTasks[args.key]) {
          this.updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          this.setState(prev => ({ trackedTasks: omit(prev.trackedTasks, args.key) }));
        }
      });
    } catch (err) {
      this.handleSubscribeError(err);
    }
  }

  handleSubscribeError(err: unknown) {
    const error = "Error, couldn't subscribe to live updates";
    this.props.queuesStatusFailure(error);
    console.error(error, err);
  }

  updateQueuesState(tasks: any, prevQueuesStatus: QueuesStatus) {
    const queuesStatus = h.getNewQueuesStatus(prevQueuesStatus, tasks);
    this.props.queuesStatusUpdate(queuesStatus);
  }

  waitingInCounselorQueues = (tasksItems: Record<string, any>, counselorQueues: string[]) =>
    Object.entries(tasksItems).reduce<Record<string, boolean>>(
      (acc, [sid, task]) =>
        h.isWaiting(task.status) && counselorQueues.includes(task.queue_name) ? { ...acc, [sid]: true } : acc,
      {},
    );

  render() {
    return null;
  }
}

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

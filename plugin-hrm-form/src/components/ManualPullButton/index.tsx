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

/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Notifications } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { RootState } from '../../states';
import { isAnyChatPending } from '../queuesStatus/helpers';
import AddTaskButton from '../common/AddTaskButton';
import { configurationBase, namespace, queuesStatusBase } from '../../states/storeNamespaces';
import { pullNextTask } from '../../services/twilioWorkerService';

// eslint-disable-next-line no-use-before-define
type Props = ReturnType<typeof mapStateToProps>;

const ManualPullButton: React.FC<Props> = ({ queuesStatusState, chatChannelCapacity, worker }) => {
  const [isWaitingNewTask, setWaitingNewTask] = useState(false);

  const pullTask = async () => {
    setWaitingNewTask(true);
    try {
      const nextTaskSid = await pullNextTask();
      if (!nextTaskSid) {
        Notifications.showNotification('NoTaskAssignableNotification');
      }
    } finally {
      setWaitingNewTask(false);
    }
  };

  const { maxMessageCapacity } = worker.attributes;
  const maxCapacityReached = chatChannelCapacity >= parseInt(maxMessageCapacity, 10);
  const { isAvailable } = worker.worker;
  const noTasks = worker.tasks.size === 0;

  const disabled =
    !isAvailable ||
    noTasks ||
    maxCapacityReached ||
    !isAnyChatPending(queuesStatusState.queuesStatus) ||
    isWaitingNewTask;

  return (
    <AddTaskButton
      id="ManualPullButton"
      onClick={pullTask}
      disabled={disabled}
      isLoading={isWaitingNewTask}
      label="ManualPullButtonText"
      data-fs-id="Task-AnotherTask-Button"
    />
  );
};

ManualPullButton.displayName = 'ManualPullButton';

const mapStateToProps = (state: RootState) => {
  const queuesStatusState = state[namespace][queuesStatusBase];
  const { chatChannelCapacity } = state[namespace][configurationBase].workerInfo;
  const { worker } = state.flex;

  return { queuesStatusState, chatChannelCapacity, worker };
};

export default connect(mapStateToProps, null)(ManualPullButton);

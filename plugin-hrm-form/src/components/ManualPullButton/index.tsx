/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Notifications } from '@twilio/flex-ui';
import { connect } from 'react-redux';

import { configurationBase, namespace, queuesStatusBase, RootState } from '../../states';
import { isAnyChatPending } from '../queuesStatus/helpers';
import { adjustChatCapacity } from '../../services/ServerlessService';
import AddTaskButton from '../common/AddTaskButton';

type OwnProps = {
  workerClient: import('@twilio/flex-ui').Manager['workerClient'];
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ManualPullButton: React.FC<Props> = ({ queuesStatusState, chatChannelCapacity, worker, workerClient }) => {
  const [isWaitingNewTask, setWaitingNewTask] = useState(false);

  const [, availableActivity] = React.useMemo(() => {
    return Array.from(workerClient.activities).find(([k, v]) => v.name === 'Available');
  }, [workerClient.activities]);

  // move to utils for reusability
  const setKeepAvailable = async () => {
    const attributes = { ...workerClient.attributes, keepAvailable: true };
    await workerClient.setAttributes(attributes);
  };

  // move to utils for reusability
  const unsetKeepAvailable = async () => {
    const { keepAvailable, ...attributes } = workerClient.attributes;
    await workerClient.setAttributes(attributes);
  };

  // Increase chat capacity, if no reservation is created within 5 seconds, capacity is decreased and shows a notification.
  const increaseChatCapacity = async () => {
    setWaitingNewTask(true);
    let alertTimeout = null;

    const cancelTimeout = async () => {
      setWaitingNewTask(false);
      clearTimeout(alertTimeout);
      await unsetKeepAvailable();
    };

    alertTimeout = setTimeout(async () => {
      setWaitingNewTask(false);
      workerClient.removeListener('reservationCreated', cancelTimeout);
      Notifications.showNotification('NoTaskAssignableNotification');
      await Promise.all([unsetKeepAvailable(), adjustChatCapacity('decrease')]);
    }, 5000);

    workerClient.once('reservationCreated', cancelTimeout);

    await Promise.all([setKeepAvailable(), adjustChatCapacity('increase')]);
    await availableActivity.setAsCurrent();
  };

  const { maxMessageCapacity } = worker.attributes;
  const maxCapacityReached = chatChannelCapacity >= parseInt(maxMessageCapacity, 10);
  const { isAvailable } = worker.worker;
  const noTasks = worker.tasks.size === 0;

  const disabled =
    // !isAvailable || this should change to "not is ready"
    noTasks || maxCapacityReached || !isAnyChatPending(queuesStatusState.queuesStatus) || isWaitingNewTask;

  return (
    <AddTaskButton
      id="ManualPullButton"
      onClick={increaseChatCapacity}
      disabled={disabled}
      isLoading={isWaitingNewTask}
      label="ManualPullButtonText"
      data-fs-id="Task-AnotherTask-Button"
    />
  );
};

ManualPullButton.displayName = 'ManualPullButton';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];
  const { chatChannelCapacity } = state[namespace][configurationBase].workerInfo;
  const { worker } = state.flex;

  return { queuesStatusState, chatChannelCapacity, worker };
};

export default connect(mapStateToProps, null)(ManualPullButton);

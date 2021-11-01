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

  // Increase chat capacity, if no reservation is created within 5 seconds, capacity is decreased and shows a notification.
  const increaseChatCapacity = async () => {
    setWaitingNewTask(true);
    let alertTimeout = null;

    const cancelTimeout = () => {
      setWaitingNewTask(false);
      clearTimeout(alertTimeout);
    };

    alertTimeout = setTimeout(async () => {
      setWaitingNewTask(false);
      workerClient.removeListener('reservationCreated', cancelTimeout);
      Notifications.showNotification('NoTaskAssignableNotification');
      await adjustChatCapacity('decrease');
    }, 5000);

    workerClient.once('reservationCreated', cancelTimeout);

    await adjustChatCapacity('increase');
  };

  const { maxMessageCapacity } = worker.attributes;
  const maxCapacityReached = chatChannelCapacity >= parseInt(maxMessageCapacity, 10);
  const disabled = maxCapacityReached || !isAnyChatPending(queuesStatusState.queuesStatus) || isWaitingNewTask;

  return (
    <AddTaskButton
      onClick={increaseChatCapacity}
      disabled={disabled}
      isLoading={isWaitingNewTask}
      label="ManualPullButtonText"
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

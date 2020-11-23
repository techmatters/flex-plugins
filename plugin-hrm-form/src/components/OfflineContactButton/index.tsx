/* eslint-disable react/prop-types */
import React from 'react';
import { Notifications } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import type { RootState } from '../../states';
import { assignMeContactlessTask } from '../../services/ServerlessService';
import AddTaskButton from '../common/AddTaskButton';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactButton: React.FC<Props> = ({ worker }) => {
  const { activity, tasks } = worker;
  const disabled = Array.from(tasks.values()).some(t => t.channelType === 'default');

  const onClick = async () => {
    if (!activity || !activity.available) Notifications.showNotification('YouMustBeAvailableToPerformThisOp');
    else await assignMeContactlessTask();
  };

  return <AddTaskButton onClick={onClick} disabled={disabled} label="OfflineContactButtonText" />;
};

OfflineContactButton.displayName = 'OfflineContactButton';

const mapStateToProps = (state: RootState) => {
  return {
    worker: state.flex.worker,
  };
};

const connector = connect(mapStateToProps);
export default connector(OfflineContactButton);

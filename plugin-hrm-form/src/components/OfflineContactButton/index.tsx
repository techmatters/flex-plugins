/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import type { RootState } from '../../states';
import { assignMeContactlessTask } from '../../services/ServerlessService';
import AddTaskButton from '../common/AddTaskButton';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactButton: React.FC<Props> = ({ tasks }) => {
  const disabled = Array.from(tasks.values()).some(t => t.channelType === 'default');

  const onClick = async () => {
    await assignMeContactlessTask();
  };

  return <AddTaskButton onClick={onClick} disabled={disabled} label="OfflineContactButtonText" />;
};

OfflineContactButton.displayName = 'OfflineContactButton';

const mapStateToProps = (state: RootState) => {
  return {
    tasks: state.flex.worker.tasks,
  };
};

const connector = connect(mapStateToProps);
export default connector(OfflineContactButton);

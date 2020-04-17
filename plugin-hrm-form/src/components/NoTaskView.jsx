import React from 'react';
import { withTaskContext } from '@twilio/flex-ui';

import { taskType } from '../types';

const NoTaskView = props => {
  const { task } = props;
  const hide = task && task.taskSid;

  if (hide) {
    return null;
  }

  return <div style={{ height: '100%' }}>No Task Selected</div>;
};

NoTaskView.displayName = 'NoTaskView';
NoTaskView.propTypes = {
  task: taskType.isRequired,
};

export default withTaskContext(NoTaskView);

import React from 'react';
import { withTaskContext } from '@twilio/flex-ui';

import { taskType } from '../types';

const wrapperStyle = {
  position: 'absolute',
  margin: '0',
  padding: '0',
  border: '0px',
  overflow: 'hidden',
  height: '100%',
  width: '100%',
};

const NoTaskView = props => {
  const { task } = props;

  const show = task && task.taskSid ? 'hidden' : 'visible';

  return <div style={{ ...wrapperStyle, visibility: show }}>No Task Selected</div>;
};

NoTaskView.displayName = 'NoTaskView';
NoTaskView.propTypes = {
  task: taskType.isRequired,
};

export default withTaskContext(NoTaskView);

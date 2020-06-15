import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import { taskType } from '../../types';

const Case = props => {
  const saveAndEnd = () => {
    const { task } = props;
    props.handleCompleteTask(task.taskSid, task);
  };

  return (
    <div>
      Case #1234
      <button type="button" onClick={saveAndEnd}>Save and end</button>
    </div>
  );
};

Case.displayName = 'Case';
Case.propTypes = {
  handleCompleteTask: PropTypes.func.isRequired,
  task: taskType.isRequired,
};

export default withTaskContext(Case);

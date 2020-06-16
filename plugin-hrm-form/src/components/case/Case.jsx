import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import { taskType, formType } from '../../types';

const Case = props => {
  const { connectedCase } = props.form.metadata;
  if (!connectedCase) return null;

  const saveAndEnd = () => {
    const { task } = props;
    props.handleCompleteTask(task.taskSid, task);
  };

  return (
    <div>
      Case #{connectedCase.id}
      <button type="button" onClick={saveAndEnd}>
        Save and end
      </button>
    </div>
  );
};

Case.displayName = 'Case';
Case.propTypes = {
  handleCompleteTask: PropTypes.func.isRequired,
  task: taskType.isRequired,
  form: formType.isRequired,
};

export default withTaskContext(Case);

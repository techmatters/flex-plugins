import React from 'react';
import PropTypes from 'prop-types';
import { withTaskContext, Template } from '@twilio/flex-ui';

import { taskType, formType } from '../../types';
import { getConfig } from '../../HrmFormPlugin';
import { saveToHrm, connectToCase } from '../../services/ContactService';

const Case = props => {
  const { connectedCase } = props.form.metadata;
  if (!connectedCase) return null;

  const saveAndEnd = async () => {
    const { task, form } = props;
    const { hrmBaseUrl, workerSid, helpline, strings } = getConfig();

    try {
      const contact = await saveToHrm(task, form, hrmBaseUrl, workerSid, helpline);
      await connectToCase(hrmBaseUrl, contact.id, connectedCase.id);
      props.handleCompleteTask(task.taskSid, task);
    } catch (error) {
      window.alert(strings['Error-Backend']);
    }
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

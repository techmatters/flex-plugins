import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTaskContext } from '@twilio/flex-ui';

import TaskView from './TaskView';
import { namespace, contactFormsBase } from '../states';
import { Actions } from '../states/ContactState';
import { handleBlur, handleCategoryToggle, handleFocus, handleSubmit } from '../states/ActionCreators';
import secret from '../private/secret';
import { FieldType } from '../states/ContactFormStateFactory';
import { taskType } from '../types';

// VisibleForTesting
export function transformForm(form) {
  const newForm = {};
  const filterableFields = ['type', 'validation', 'error', 'touched'];
  Object.keys(form)
    .filter(key => !filterableFields.includes(key))
    .forEach(key => {
      switch (form[key].type) {
        case FieldType.CALL_TYPE:
        case FieldType.CHECKBOX:
        case FieldType.SELECT_SINGLE:
        case FieldType.TEXT_BOX:
        case FieldType.TEXT_INPUT:
          newForm[key] = form[key].value;
          break;
        case FieldType.CHECKBOX_FIELD:
        case FieldType.INTERMEDIATE:
        case FieldType.TAB:
          newForm[key] = {
            ...transformForm(form[key]),
          };
          break;
        default:
          throw new Error(`Unknown FieldType ${form[key].type} for key ${key} in ${JSON.stringify(form)}`);
      }
    });
  return newForm;
}

// should this be a static method on the class or separate.  Or should it even be here at all?
export function saveToHrm(task, form, abortFunction, hrmBaseUrl, workerSid) {
  // if we got this far, we assume the form is valid and ready to submit

  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */
  const formToSend = transformForm(form);

  // Add task info
  formToSend.channel = task.channelType;
  formToSend.queueName = task.queueName;
  formToSend.counselor = workerSid;
  if (task.channelType === 'facebook') {
    formToSend.number = task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === 'whatsapp') {
    formToSend.number = task.defaultFrom.replace('whatsapp:', '');
  } else {
    formToSend.number = task.defaultFrom;
  }

  const formdata = {
    form: formToSend,
  };
  console.log(`Using base url: ${hrmBaseUrl}`);

  // print the form values to the console
  console.log(`Sending: ${JSON.stringify(formdata)}`);
  fetch(`${hrmBaseUrl}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(formdata),
  })
    .then(response => {
      if (!response.ok) {
        console.log(`Form error: ${response.statusText}`);
        if (!window.confirm('Error from backend system.  Are you sure you want to end the task without recording?')) {
          abortFunction();
        }
      }
      return response.json();
    })
    .then(myJson => {
      console.log(`Received: ${JSON.stringify(myJson)}`);
    })
    .catch(response => {
      console.log('Caught something');

      // TODO(nick): fix this. this isn't working I don't think the function is working from inside the promise.
      if (!window.confirm('Unknown error saving form.  Are you sure you want to end the task without recording?')) {
        abortFunction();
      }
    });
}

const HrmFormController = props => {
  /*
   * I don't think this should be needed, since we shouldn't be here
   * if there's no task.  But without this check, props.task.taskSid
   * will error when the task is completed, so there may be a lifecycle issue.
   */
  if (!props.task) {
    return null;
  }

  return (
    <TaskView
      thisTask={props.thisTask}
      key={props.task.taskSid}
      form={props.form}
      handleBlur={props.handleBlur(props.form, props.task.taskSid)}
      handleChange={props.handleChange}
      handleCallTypeButtonClick={props.handleCallTypeButtonClick}
      handleCategoryToggle={handleCategoryToggle(props.form, props.handleChange)}
      handleSubmit={props.handleSubmit(props.form, props.handleCompleteTask)}
      handleFocus={props.handleFocus}
    />
  );
};

const mapStateToProps = (state, ownProps) => {
  // This should already have been created when beforeAcceptTask is fired
  return {
    form: state[namespace][contactFormsBase].tasks[ownProps.thisTask.taskSid],
  };
};

const mapDispatchToProps = dispatch => ({
  handleBlur: handleBlur(dispatch),
  handleCallTypeButtonClick: bindActionCreators(Actions.handleCallTypeButtonClick, dispatch),
  handleChange: bindActionCreators(Actions.handleChange, dispatch),
  handleFocus: handleFocus(dispatch),
  handleSubmit: handleSubmit(dispatch),
});

HrmFormController.displayName = 'HrmFormController';
HrmFormController.propTypes = {
  task: taskType.isRequired,
  thisTask: taskType.isRequired,
  form: PropTypes.isRequired,
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleCallTypeButtonClick: PropTypes.func.isRequired,
  handleCompleteTask: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleFocus: PropTypes.func.isRequired,
};

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(HrmFormController));

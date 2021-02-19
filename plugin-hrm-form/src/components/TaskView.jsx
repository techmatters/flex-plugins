import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTaskContext, TaskHelper } from '@twilio/flex-ui';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { taskType } from '../types';
import { namespace, contactFormsBase, searchContactsBase, routingBase, configurationBase } from '../states';
import * as GeneralActions from '../states/actions';
import { hasTaskControl } from '../utils/transfer';

class TaskView extends Component {
  static displayName = 'TaskView';

  static propTypes = {
    task: taskType,
    thisTask: taskType.isRequired,
    contactFormStateExists: PropTypes.bool.isRequired,
    routingStateExists: PropTypes.bool.isRequired,
    searchStateExists: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    currentDefinitionVersion: PropTypes.shape({ tabbedForms: PropTypes.shape({}) }).isRequired,
  };

  static defaultProps = {
    task: null,
  };

  // eslint-disable-next-line complexity
  componentDidMount() {
    const { contactFormStateExists, routingStateExists, searchStateExists, currentDefinitionVersion } = this.props;
    if (!contactFormStateExists || !routingStateExists || !searchStateExists) {
      this.props.dispatch(
        GeneralActions.recreateContactState(currentDefinitionVersion.tabbedForms)(this.props.thisTask.taskSid),
      );
    }
  }

  render() {
    const { task, thisTask } = this.props;

    // If this task is not the active task, or if the task is not accepted yet, hide it
    const show = task && task.taskSid === thisTask.taskSid && !TaskHelper.isPending(task);

    if (!show) {
      return null;
    }

    return (
      <div style={{ height: '100%' }}>
        {!hasTaskControl(thisTask) && <FormNotEditable />}
        <HrmForm />
      </div>
    );
  }
}

/**
 * @param {import('../states').RootState} state
 */
const mapStateToProps = (state, ownProps) => {
  // Check if the entry for this task exists in each reducer
  const contactFormStateExists = Boolean(state[namespace][contactFormsBase].tasks[ownProps.thisTask.taskSid]);
  const routingStateExists = Boolean(state[namespace][routingBase].tasks[ownProps.thisTask.taskSid]);
  const searchStateExists = Boolean(state[namespace][searchContactsBase].tasks[ownProps.thisTask.taskSid]);
  const { currentDefinitionVersion } = state[namespace][configurationBase];

  // This should already have been created when beforeAcceptTask is fired
  return {
    contactFormStateExists,
    routingStateExists,
    searchStateExists,
    currentDefinitionVersion,
  };
};

export default withTaskContext(connect(mapStateToProps, null)(TaskView));

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTaskContext } from '@twilio/flex-ui';

import HrmForm from './HrmForm';
import { formType, taskType } from '../types';

const wrapperStyle = {
  position: 'absolute',
  margin: '0',
  padding: '0',
  border: '0px',

  // overflow: "hidden",  // this prevents scrolling
  height: '100%',
  width: '100%',
};

class TaskView extends Component {
  static displayName = 'TaskView';

  static propTypes = {
    task: taskType.isRequired,
    thisTask: taskType.isRequired,
    form: formType.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleCategoryToggle: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleCallTypeButtonClick: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleFocus: PropTypes.func.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  componentDidMount() {
    console.log('IFrame mounted');
  }

  componentWillUnmount() {
    console.log('IFrame unmounted');
  }

  render() {
    const { task, thisTask } = this.props;

    // If this task is not the active task, hide it
    const show = task && task.taskSid === thisTask.taskSid ? 'visible' : 'hidden';

    return (
      <div style={{ ...wrapperStyle, visibility: show }}>
        <HrmForm
          form={this.props.form}
          handleBlur={this.props.handleBlur}
          handleCategoryToggle={this.props.handleCategoryToggle}
          handleChange={this.props.handleChange}
          handleCallTypeButtonClick={this.props.handleCallTypeButtonClick}
          handleSubmit={this.props.handleSubmit}
          handleFocus={this.props.handleFocus}
          handleSelectSearchResult={this.props.handleSelectSearchResult}
        />
      </div>
    );
  }
}

export default withTaskContext(TaskView);

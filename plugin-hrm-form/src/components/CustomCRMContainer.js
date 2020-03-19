import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import NoTaskView from './NoTaskView';
import TaskView from './TaskView';
import { taskType } from '../types';

const CustomCRMContainer = props => {
  const { tasks } = props;

  return (
    <div>
      <NoTaskView key="no-task" />
      {Array.from(tasks.values()).map(item => (
        <TaskView thisTask={item} key={`controller-${item.taskSid}`} handleCompleteTask={props.handleCompleteTask} />
      ))}
    </div>
  );
};

const mapStateToProps = state => {
  return {
    tasks: state.flex.worker.tasks,
  };
};

CustomCRMContainer.displayName = 'CustomCRMContainer';
CustomCRMContainer.propTypes = {
  tasks: PropTypes.arrayOf(taskType).isRequired,
  handleCompleteTask: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(CustomCRMContainer);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import NoTaskView from './NoTaskView';
import TaskView from './TaskView';
import { taskType } from '../types';
import { Absolute } from '../styles/HrmStyles';

const CustomCRMContainer = props => {
  const { tasks } = props;

  return (
    <Absolute top="0" bottom="0" left="0" right="0">
      <NoTaskView key="no-task" />
      {Array.from(tasks.values()).map(item => (
        <TaskView thisTask={item} key={`controller-${item.taskSid}`} handleCompleteTask={props.handleCompleteTask} />
      ))}
    </Absolute>
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

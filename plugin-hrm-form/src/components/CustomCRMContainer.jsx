import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TaskView from './TaskView';
import { taskType } from '../types';
import { Absolute } from '../styles/HrmStyles';
import { populateCounselors } from '../services/ServerlessService';
import { populateCounselorsState } from '../states/ConfigurationState';

class CustomCRMContainer extends React.Component {
  static displayName = 'CustomCRMContainer';

  static propTypes = {
    tasks: PropTypes.arrayOf(taskType).isRequired,
    handleCompleteTask: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  async componentDidMount() {
    try {
      const counselorsList = await populateCounselors();
      this.props.dispatch(populateCounselorsState(counselorsList));
    } catch (err) {
      // TODO (Gian): probably we need to handle this in a nicer way
      console.error(err.message);
    }
  }

  render() {
    const { tasks } = this.props;

    return (
      <Absolute top="0" bottom="0" left="0" right="0">
        {Array.from(tasks.values()).map(item => (
          <TaskView
            thisTask={item}
            key={`controller-${item.taskSid}`}
            handleCompleteTask={this.props.handleCompleteTask}
          />
        ))}
      </Absolute>
    );
  }
}

const mapStateToProps = state => {
  return {
    tasks: state.flex.worker.tasks,
  };
};

export default connect(mapStateToProps)(CustomCRMContainer);

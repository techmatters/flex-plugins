import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { queuesStatusInit, queuesStatusUpdate, queuesStatusFailure } from '../../states/QueuesStatus';
import { initializeQueuesStatus, getNewQueuesStatus } from './helpers';
import { namespace, queuesStatusBase } from '../../states';

class QueuesStatusWriter extends React.Component {
  static displayName = 'QueuesStatusWriter';

  static propTypes = {
    insightsClient: PropTypes.shape({
      liveQuery: PropTypes.func,
    }).isRequired,
    queuesStatusState: PropTypes.shape({
      queuesStatus: PropTypes.shape({}),
      error: PropTypes.string,
      loading: PropTypes.bool,
    }).isRequired,
    queuesStatusInit: PropTypes.func.isRequired,
    queuesStatusUpdate: PropTypes.func.isRequired,
    queuesStatusFailure: PropTypes.func.isRequired,
  };

  state = {
    tasksQuery: null,
  };

  async componentDidMount() {
    try {
      // increase by 1 the longest wait each minute
      const eachMinute = (qName, prevQueuesStatus) => {
        const queuesStatus = {
          ...prevQueuesStatus,
          [qName]: {
            ...prevQueuesStatus[qName],
            longestWaitingTask: {
              ...prevQueuesStatus[qName].longestWaitingTask,
              waitingMinutes: prevQueuesStatus[qName].longestWaitingTask.waitingMinutes + 1,
            },
          },
        };

        this.props.queuesStatusUpdate(queuesStatus);
      };

      const q = await this.props.insightsClient.liveQuery('tr-queue', '');
      const queues = q.getItems();
      q.close();

      const cleanQueuesStatus = initializeQueuesStatus(queues);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      const updateQueuesStatus = (init = false) => {
        console.log('UPDATER PROPS', this.props.queuesStatusState.queuesStatus);
        const tasks = tasksQuery.getItems();
        const prevQueuesStatus = this.props.queuesStatusState.queuesStatus;
        const queuesStatus = getNewQueuesStatus(cleanQueuesStatus, tasks, prevQueuesStatus, eachMinute);
        if (init) {
          this.props.queuesStatusInit(queuesStatus);
          return;
        }
        this.props.queuesStatusUpdate(queuesStatus);
      };

      this.setState({ tasksQuery }, () => updateQueuesStatus(true));

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        const { status } = args.value;
        if (status === 'pending' || status === 'reserved' || status === 'canceled') {
          // here we can filter and update only if the task belongs to a queue the user cares about
          updateQueuesStatus();
        }
      });
    } catch (err) {
      const error = "Error, couldn't subscribe to live updates";
      this.props.queuesStatusFailure(error);
      console.log(error, err);
    }
  }

  componentWillUnmount() {
    const { queuesStatus } = this.props.queuesStatusState;
    const { tasksQuery } = this.state;
    // unsuscribe
    if (tasksQuery) tasksQuery.close();
    // clear all timers
    Object.values(queuesStatus).forEach(({ longestWaitingTask }) => clearInterval(longestWaitingTask.intervalId));
  }

  render() {
    console.log('WRITER PROPS', this.props.queuesStatusState.queuesStatus)
    return null;
  }
}

const mapStateToProps = (state, ownProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];

  return { queuesStatusState };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    queuesStatusInit: bindActionCreators(queuesStatusInit, dispatch),
    queuesStatusUpdate: bindActionCreators(queuesStatusUpdate, dispatch),
    queuesStatusFailure: bindActionCreators(queuesStatusFailure, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QueuesStatusWriter);

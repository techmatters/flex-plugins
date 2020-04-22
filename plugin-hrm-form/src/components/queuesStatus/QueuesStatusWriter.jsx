import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { queuesStatusUpdate, queuesStatusFailure, queuesStatusTick } from '../../states/QueuesStatus';
import { initializeQueuesStatus, getIntermidiateStatus } from './helpers';
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
    queuesStatusUpdate: PropTypes.func.isRequired,
    queuesStatusFailure: PropTypes.func.isRequired,
    queuesStatusTick: PropTypes.func.isRequired,
  };

  state = {
    tasksQuery: null,
    intervalId: null,
  };

  async componentDidMount() {
    try {
      // increase by 1 the longest wait each minute
      const q = await this.props.insightsClient.liveQuery('tr-queue', '');
      const queues = q.getItems();
      q.close();

      const cleanQueuesStatus = initializeQueuesStatus(queues);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      const updateQueuesStatus = () => {
        const tasks = tasksQuery.getItems();
        const intermidiateStatus = getIntermidiateStatus(cleanQueuesStatus, tasks);
        const intervalId = setInterval(this.props.queuesStatusTick, 1000 * 60);

        clearInterval(this.state.intervalId);
        this.setState({ intervalId });
        this.props.queuesStatusUpdate(intermidiateStatus);
      };

      this.setState({ tasksQuery }, updateQueuesStatus);

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
    const { tasksQuery, intervalId } = this.state;
    // unsuscribe
    if (tasksQuery) tasksQuery.close();
    // clear all timers
    clearInterval(intervalId);
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state, ownProps) => {
  const queuesStatusState = state[namespace][queuesStatusBase];

  return { queuesStatusState };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    queuesStatusUpdate: bindActionCreators(queuesStatusUpdate, dispatch),
    queuesStatusFailure: bindActionCreators(queuesStatusFailure, dispatch),
    queuesStatusTick: bindActionCreators(queuesStatusTick, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QueuesStatusWriter);

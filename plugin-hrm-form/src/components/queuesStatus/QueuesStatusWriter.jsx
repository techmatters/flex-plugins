import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { queuesStatusUpdate, queuesStatusFailure } from '../../states/QueuesStatus';
import { initializeQueuesStatus, getNewQueuesStatus } from './helpers';
import { namespace, queuesStatusBase } from '../../states';

class QueuesStatusWriter extends React.Component {
  static displayName = 'QueuesStatusWriter';

  static propTypes = {
    insightsClient: PropTypes.shape({
      liveQuery: PropTypes.func,
    }).isRequired,
    helpline: PropTypes.string.isRequired,
    queuesStatusState: PropTypes.shape({
      queuesStatus: PropTypes.shape({}),
      error: PropTypes.string,
      loading: PropTypes.bool,
    }).isRequired,
    queuesStatusUpdate: PropTypes.func.isRequired,
    queuesStatusFailure: PropTypes.func.isRequired,
  };

  state = {
    tasksQuery: null,
  };

  async componentDidMount() {
    const { helpline } = this.props;
    try {
      const q = await this.props.insightsClient.liveQuery('tr-queue', '');
      const queues = Object.values(q.getItems()).reduce((acc, queue) => [...acc, queue.queue_name], []);
      q.close();

      // builds the array of queues the counselor cares about (for now will always be one)
      const counselorQueues = helpline && queues.includes(helpline) ? [helpline] : ['Admin'];

      const cleanQueuesStatus = initializeQueuesStatus(counselorQueues);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      const updateQueuesState = () => {
        const tasks = tasksQuery.getItems();
        const queuesStatus = getNewQueuesStatus(cleanQueuesStatus, tasks);
        this.props.queuesStatusUpdate(queuesStatus);
      };

      const shouldUpdate = status => status === 'pending' || status === 'assigned' || status === 'canceled';

      updateQueuesState();
      this.setState({ tasksQuery });

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        // eslint-disable-next-line camelcase
        const { status, queue_name } = args.value;
        if (counselorQueues.includes(queue_name) && shouldUpdate(status)) {
          updateQueuesState();
        }
      });

      tasksQuery.on('itemRemoved', args => {
        updateQueuesState();
      });
    } catch (err) {
      const error = "Error, couldn't subscribe to live updates";
      this.props.queuesStatusFailure(error);
      console.log(error, err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery } = this.state;
    // unsubscribe
    if (tasksQuery) tasksQuery.close();
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QueuesStatusWriter);

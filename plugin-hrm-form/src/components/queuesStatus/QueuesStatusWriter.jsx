import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { omit } from 'lodash';

import { queuesStatusUpdate, queuesStatusFailure } from '../../states/QueuesStatus';
import { initializeQueuesStatus, getNewQueuesStatus, isWaiting } from './helpers';
import { namespace, queuesStatusBase } from '../../states';

export class InnerQueuesStatusWriter extends React.Component {
  static displayName = 'QueuesStatusWriter';

  static propTypes = {
    insightsClient: PropTypes.shape({
      liveQuery: PropTypes.func,
    }).isRequired,
    helpline: PropTypes.string,
    queuesStatusState: PropTypes.shape({
      queuesStatus: PropTypes.shape({}),
      error: PropTypes.string,
      loading: PropTypes.bool,
    }).isRequired,
    queuesStatusUpdate: PropTypes.func.isRequired,
    queuesStatusFailure: PropTypes.func.isRequired,
  };

  static defaultProps = {
    helpline: undefined,
  };

  constructor(props) {
    super(props);
    this.updateQueuesState = this.updateQueuesState.bind(this);
  }

  state = {
    tasksQuery: null,
    trackedTasks: null,
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

      const initialTasks = tasksQuery.getItems();

      const trackedTasks = Object.entries(initialTasks).reduce(
        (acc, [sid, task]) =>
          counselorQueues.includes(task.queue_name) && isWaiting(task.status) ? { ...acc, [sid]: true } : acc,
        {},
      );

      this.updateQueuesState(initialTasks, cleanQueuesStatus);
      this.setState({ tasksQuery, trackedTasks });

      const shouldUpdate = status => status === 'pending' || status === 'assigned' || status === 'canceled';

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        // eslint-disable-next-line camelcase
        const { status, queue_name } = args.value;
        if (counselorQueues.includes(queue_name) && shouldUpdate(status)) {
          console.log('TASK UPDATED INNER');
          this.updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          this.setState(prev => ({ trackedTasks: { ...prev.trackedTasks, [args.key]: true } }));
        }
      });

      tasksQuery.on('itemRemoved', args => {
        console.log('TASK REMOVED', args);
        if (this.state.trackedTasks[args.key]) {
          console.log('TASK REMOVED INNER');
          this.updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          this.setState(prev => ({ trackedTasks: omit(prev.trackedTasks, args.key) }));
        }
      });
    } catch (err) {
      const error = "Error, couldn't subscribe to live updates";
      this.props.queuesStatusFailure(error);
      console.error(error, err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery } = this.state;
    // unsubscribe
    if (tasksQuery) tasksQuery.close();
  }

  updateQueuesState(tasks, prevQueuesStatus) {
    const queuesStatus = getNewQueuesStatus(prevQueuesStatus, tasks);
    this.props.queuesStatusUpdate(queuesStatus);
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

export default connect(mapStateToProps, mapDispatchToProps)(InnerQueuesStatusWriter);

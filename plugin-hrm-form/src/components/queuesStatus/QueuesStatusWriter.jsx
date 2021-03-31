import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { omit } from 'lodash';

import { queuesStatusUpdate, queuesStatusFailure } from '../../states/queuesStatus/actions';
import * as h from './helpers';
import { namespace, queuesStatusBase } from '../../states';
import { listWorkerQueues } from '../../services/ServerlessService';

export class InnerQueuesStatusWriter extends React.Component {
  static displayName = 'QueuesStatusWriter';

  static propTypes = {
    insightsClient: PropTypes.shape({
      liveQuery: PropTypes.func,
    }).isRequired,
    workerSid: PropTypes.string.isRequired,
    queuesStatusState: PropTypes.shape({
      queuesStatus: PropTypes.shape({}),
      error: PropTypes.string,
      loading: PropTypes.bool,
    }).isRequired,
    queuesStatusUpdate: PropTypes.func.isRequired,
    queuesStatusFailure: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.updateQueuesState = this.updateQueuesState.bind(this);
  }

  state = {
    tasksQuery: null,
    workerQuery: null,
    trackedTasks: null,
  };

  async componentDidMount() {
    try {
      await this.subscribeToQueuesUpdates();

      const workerQuery = await this.props.insightsClient.liveQuery(
        'tr-worker',
        `data.worker_sid == "${this.props.workerSid}"`,
      );
      this.setState({ workerQuery });

      workerQuery.on('itemUpdated', async _args => {
        await this.subscribeToQueuesUpdates();
      });
    } catch (err) {
      this.handleSubscribeError(err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery, workerQuery } = this.state;
    // unsubscribe
    if (tasksQuery) tasksQuery.close();
    if (workerQuery) workerQuery.close();
  }

  async subscribeToQueuesUpdates() {
    const { workerSid } = this.props;
    try {
      // fetch the array of queues the counselor matches (excluding "Everyone")
      const { workerQueues } = await listWorkerQueues({ workerSid });
      const counselorQueues = workerQueues.map(q => q.friendlyName).filter(q => q !== 'Everyone');

      const cleanQueuesStatus = h.initializeQueuesStatus(counselorQueues);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      const tasksItems = tasksQuery.getItems();

      // tasks that are waiting and belong to a queue the counselor cares about, at the moment of this component mount
      const trackedTasks = this.waitingInCounselorQueues(tasksItems, counselorQueues);

      this.updateQueuesState(tasksItems, cleanQueuesStatus);
      this.setState({ tasksQuery, trackedTasks });

      const shouldUpdate = status =>
        h.isPending(status) || h.isReserved(status) || h.isAssigned(status) || h.isCanceled(status);

      tasksQuery.on('itemUpdated', args => {
        // eslint-disable-next-line camelcase
        const { status, queue_name } = args.value;
        if (counselorQueues.includes(queue_name) && shouldUpdate(status)) {
          this.updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          this.setState(prev => ({ trackedTasks: { ...prev.trackedTasks, [args.key]: true } }));
        }
      });

      tasksQuery.on('itemRemoved', args => {
        if (this.state.trackedTasks[args.key]) {
          this.updateQueuesState(tasksQuery.getItems(), cleanQueuesStatus);
          this.setState(prev => ({ trackedTasks: omit(prev.trackedTasks, args.key) }));
        }
      });
    } catch (err) {
      this.handleSubscribeError(err);
    }
  }

  handleSubscribeError(err) {
    const error = "Error, couldn't subscribe to live updates";
    this.props.queuesStatusFailure(error);
    console.error(error, err);
  }

  updateQueuesState(tasks, prevQueuesStatus) {
    const queuesStatus = h.getNewQueuesStatus(prevQueuesStatus, tasks);
    this.props.queuesStatusUpdate(queuesStatus);
  }

  waitingInCounselorQueues = (tasksItems, counselorQueues) =>
    Object.entries(tasksItems).reduce(
      (acc, [sid, task]) =>
        h.isWaiting(task.status) && counselorQueues.includes(task.queue_name) ? { ...acc, [sid]: true } : acc,
      {},
    );

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

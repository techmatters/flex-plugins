import React from 'react';
import PropTypes from 'prop-types';

import { initializeQueuesStatus, getNewQueuesStatus } from './helpers';
import { withQueuesContext } from '../../contexts/QueuesStatusContext';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class QueuesContextWriter extends React.Component {
  static displayName = 'QueuesContextWriter';

  static propTypes = {
    insightsClient: PropTypes.shape({
      liveQuery: PropTypes.func,
    }).isRequired,
    queuesContext: PropTypes.shape({
      state: PropTypes.shape({
        queuesStatus: PropTypes.shape({}),
        error: PropTypes.string,
        loading: PropTypes.bool,
      }),
      setState: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = {
    tasksQuery: null,
  };

  async componentDidMount() {
    try {
      // increases by 1 the waiting time each minute
      const eachMinute = qName =>
        this.props.queuesContext.setState(prev => ({
          queuesStatus: {
            ...prev.queuesStatus,
            [qName]: {
              ...prev.queuesStatus[qName],
              longestWaitingTask: {
                ...prev.queuesStatus[qName].longestWaitingTask,
                waitingMinutes: prev.queuesStatus[qName].longestWaitingTask.waitingMinutes + 1,
              },
            },
          },
        }));

      await timeout(500);

      const q = await this.props.insightsClient.liveQuery('tr-queue', '');
      const queues = q.getItems();
      q.close();

      const cleanQueuesStatus = initializeQueuesStatus(queues);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      const updateQueuesContext = () => {
        const tasks = tasksQuery.getItems();
        const prevQueuesStatus = this.props.queuesContext.state.queuesStatus;
        const queuesStatus = getNewQueuesStatus(cleanQueuesStatus, tasks, prevQueuesStatus, eachMinute);
        this.props.queuesContext.setState({ queuesStatus, loading: false });
      };

      this.setState({ tasksQuery }, () => updateQueuesContext());

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        const { status } = args.value;
        if (status === 'pending' || status === 'reserved' || status === 'canceled') {
          // here we can filter and update only if the task belongs to a queue the user cares about
          updateQueuesContext();
        }
      });
    } catch (err) {
      const error = "Error, couldn't subscribe to live updates";
      this.props.queuesContext.setState({ error });
      console.log(error, err);
    }
  }

  componentWillUnmount() {
    const { queuesStatus } = this.props.queuesContext.state;
    const { tasksQuery } = this.state;
    // unsuscribe
    if (tasksQuery) tasksQuery.close();
    // clear all timers
    Object.values(queuesStatus).forEach(({ longestWaitingTask }) => clearInterval(longestWaitingTask.intervalId));
  }

  render() {
    return null;
  }
}

export default withQueuesContext(QueuesContextWriter);

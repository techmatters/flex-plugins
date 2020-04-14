import React from 'react';
import { Manager } from '@twilio/flex-ui';

import { initializeQueuesStatus, updateQueuesStatus, initializePendingTasks } from './helpers';

class QueuesStatus extends React.Component {
  static displayName = 'QueuesStatus';

  static propTypes = {};

  state = {
    queuesStatus: null,
    tasksQuery: null,
  };

  async componentDidMount() {
    try {
      const manager = Manager.getInstance();
      const q = await manager.insightsClient.liveQuery('tr-queue', '');
      const queues = q.getItems();
      q.close();

      const cleanQueuesStatus = initializeQueuesStatus(queues);
      const refreshQueuesStatus = updateQueuesStatus(cleanQueuesStatus);

      const tasksQuery = await manager.insightsClient.liveQuery('tr-task', '');

      const pendingTasks = initializePendingTasks(tasksQuery.getItems());
      const queuesStatus = refreshQueuesStatus(pendingTasks);

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        // here we are assigning a new object for every change
        const newPendingTasks = initializePendingTasks(tasksQuery.getItems());
        const newQueuesStatus = refreshQueuesStatus(newPendingTasks);
        this.setState({ queuesStatus: newQueuesStatus });
      });

      this.setState({ queuesStatus, tasksQuery });

      console.log('queuesStatus initialized');
    } catch (err) {
      console.log('Error when subscribing to live updates', err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery } = this.state;
    // unsuscribe
    if (tasksQuery) tasksQuery.close();
  }

  render() {
    const { queuesStatus } = this.state;
    return (
      queuesStatus && (
        <>
          {Object.keys(queuesStatus).map(key => (
            <>
              <p>Queue: {key}</p>
              <p>facebook: {queuesStatus[key].facebook}</p>
              <p>web: {queuesStatus[key].web}</p>
              <p>voice: {queuesStatus[key].voice}</p>
              <p>sms: {queuesStatus[key].sms}</p>
              <p>whatsapp: {queuesStatus[key].whatsapp}</p>
            </>
          ))}
        </>
      )
    );
  }
}

export default QueuesStatus;

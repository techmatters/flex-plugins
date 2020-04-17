import React from 'react';
import PropTypes from 'prop-types';

import { initializeQueuesStatus, updateQueuesStatus } from './helpers';
import { Row } from '../../styles/HrmStyles';

class QueuesStatus extends React.Component {
  static displayName = 'QueuesStatus';

  static propTypes = {
    insightsClient: PropTypes.shape({
      liveQuery: PropTypes.func,
    }).isRequired,
  };

  state = {
    queuesStatus: null,
    tasksQuery: null,
  };

  async componentDidMount() {
    try {
      const q = await this.props.insightsClient.liveQuery('tr-queue', '');
      const queues = q.getItems();
      q.close();

      const cleanQueuesStatus = initializeQueuesStatus(queues);
      const refreshQueuesStatus = updateQueuesStatus(cleanQueuesStatus);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      const queuesStatus = refreshQueuesStatus(tasksQuery.getItems());

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        // here we are assigning a new object for every change
        const newQueuesStatus = refreshQueuesStatus(tasksQuery.getItems());
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
              <Row>
                <p style={{ margin: 5 }}>Calls: {queuesStatus[key].voice}</p>
                <p style={{ margin: 5 }}>SMS: {queuesStatus[key].sms}</p>
                <p style={{ margin: 5 }}>FB: {queuesStatus[key].facebook}</p>
                <p style={{ margin: 5 }}>WA: {queuesStatus[key].whatsapp}</p>
                <p style={{ margin: 5 }}>Web: {queuesStatus[key].web}</p>
              </Row>
            </>
          ))}
        </>
      )
    );
  }
}

export default QueuesStatus;

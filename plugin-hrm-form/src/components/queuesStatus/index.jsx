import React from 'react';
import PropTypes from 'prop-types';

import QueueCard from './QueueCard';
import { initializeQueuesStatus, updateQueuesStatus } from './helpers';
import { Container, HeaderContainer, QueuesContainer } from '../../styles/queuesStatus';

class QueuesStatus extends React.Component {
  static displayName = 'QueuesStatus';

  static propTypes = {
    insightsClient: PropTypes.shape({
      liveQuery: PropTypes.func,
    }).isRequired,
    colors: PropTypes.shape({
      voiceColor: PropTypes.shape({ Accepted: PropTypes.string }),
      webColor: PropTypes.shape({ Accepted: PropTypes.string }),
      facebookColor: PropTypes.shape({ Accepted: PropTypes.string }),
      smsColor: PropTypes.shape({ Accepted: PropTypes.string }),
      whatsappColor: PropTypes.shape({ Accepted: PropTypes.string }),
    }).isRequired,
  };

  state = {
    tasksQuery: null,
    queuesStatus: null,
  };

  async componentDidMount() {
    try {
      const eachMinute = qName =>
        this.setState(prev => ({
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

      const q = await this.props.insightsClient.liveQuery('tr-queue', '');
      const queues = q.getItems();
      q.close();

      const cleanQueuesStatus = initializeQueuesStatus(queues);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      // returns a new queuesStatus
      const updateState = () => {
        const tasks = tasksQuery.getItems();
        const prevQueuesStatus = this.state.queuesStatus;
        const queuesStatus = updateQueuesStatus(cleanQueuesStatus, tasks, prevQueuesStatus, eachMinute);
        return queuesStatus;
      };

      const queuesStatus = updateState();
      this.setState({ tasksQuery, queuesStatus });

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        // here we are assigning a new object for every change
        const newQueuesStatus = updateState();
        this.setState({ queuesStatus: newQueuesStatus });
      });
    } catch (err) {
      console.log('Error when subscribing to live updates', err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery, queuesStatus } = this.state;
    // unsuscribe
    if (tasksQuery) tasksQuery.close();
    // clear all timers
    Object.values(queuesStatus).forEach(({ longestWaitingTask }) => clearInterval(longestWaitingTask.intervalId));
  }

  render() {
    const { queuesStatus } = this.state;
    console.log('QUEUESSTATUS', queuesStatus);
    return (
      queuesStatus && (
        <>
          <Container>
            <HeaderContainer>Contacts waiting</HeaderContainer>
            <QueuesContainer>
              {Object.entries(queuesStatus).map(([qName, qStatus]) => (
                <QueueCard key={qName} qName={qName} qStatus={qStatus} colors={this.props.colors} />
              ))}
            </QueuesContainer>
          </Container>
        </>
      )
    );
  }
}

export default QueuesStatus;

import React from 'react';
import PropTypes from 'prop-types';

import QueueCard from './QueueCard';
import { initializeQueuesStatus, updateQueuesStatus, calculateQueuesWait } from './helpers';
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
    queuesLongestWait: null, // for each queue -> { longestWaitingTaskId, waitingMinutes, intervalId }
  };

  async componentDidMount() {
    try {
      const eachMinute = qName =>
        this.setState(prev => ({
          queuesLongestWait: {
            ...prev.queuesLongestWait,
            [qName]: {
              ...prev.queuesLongestWait[qName],
              waitingMinutes: prev.queuesLongestWait[qName].waitingMinutes + 1,
            },
          },
        }));

      const q = await this.props.insightsClient.liveQuery('tr-queue', '');
      const queues = q.getItems();
      q.close();

      const cleanQueuesStatus = initializeQueuesStatus(queues);
      const updateFromClean = updateQueuesStatus(cleanQueuesStatus);

      const tasksQuery = await this.props.insightsClient.liveQuery('tr-task', '');

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        // here we are assigning a new object for every change
        const queuesStatus = updateFromClean(tasksQuery.getItems());
        const prevQueuesLongestWait = this.state.queuesLongestWait;
        const queuesLongestWait = calculateQueuesWait(queuesStatus, prevQueuesLongestWait, eachMinute);

        this.setState({ queuesStatus, queuesLongestWait });
      });

      const queuesStatus = updateFromClean(tasksQuery.getItems());
      const prevQueuesLongestWait = this.state.queuesLongestWait;
      const queuesLongestWait = calculateQueuesWait(queuesStatus, prevQueuesLongestWait, eachMinute);

      this.setState({ tasksQuery, queuesStatus, queuesLongestWait });
    } catch (err) {
      console.log('Error when subscribing to live updates', err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery, queuesLongestWait } = this.state;
    // unsuscribe
    if (tasksQuery) tasksQuery.close();
    // clear all timers
    Object.values(queuesLongestWait).forEach(({ intervalId }) => clearInterval(intervalId));
  }

  render() {
    const { queuesStatus, queuesLongestWait } = this.state;
    return (
      queuesStatus && (
        <>
          <Container>
            <HeaderContainer>Contacts waiting</HeaderContainer>
            <QueuesContainer>
              {Object.entries(queuesStatus).map(([qName, qStatus]) => {
                const thisQueue = queuesLongestWait && queuesLongestWait[qName];
                const waitingMinutesMsg =
                  // eslint-disable-next-line no-nested-ternary
                  thisQueue === null
                    ? 'None'
                    : thisQueue.waitingMinutes === 0
                    ? 'Less than 1 minute'
                    : `${thisQueue.waitingMinutes} minute${thisQueue.waitingMinutes > 1 ? 's' : ''}`;

                return (
                  <QueueCard
                    key={qName}
                    qName={qName}
                    qStatus={qStatus}
                    colors={this.props.colors}
                    waitingMinutesMsg={waitingMinutesMsg}
                  />
                );
              })}
            </QueuesContainer>
          </Container>
        </>
      )
    );
  }
}

export default QueuesStatus;

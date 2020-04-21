import React from 'react';
import PropTypes from 'prop-types';
import { Collapse, CircularProgress } from '@material-ui/core';
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';

import QueueCard from './QueueCard';
import { initializeQueuesStatus, updateQueuesStatus } from './helpers';
import { Container, HeaderContainer, QueuesContainer } from '../../styles/queuesStatus';
import { Box, ErrorText } from '../../styles/HrmStyles';

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
    expanded: false,
    loading: true,
    error: null,
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

      const updateState = () => {
        const tasks = tasksQuery.getItems();
        const prevQueuesStatus = this.state.queuesStatus;
        const queuesStatus = updateQueuesStatus(cleanQueuesStatus, tasks, prevQueuesStatus, eachMinute);
        return queuesStatus;
      };

      const queuesStatus = updateState();
      this.setState({ tasksQuery, queuesStatus, expanded: true, loading: false });

      tasksQuery.on('itemUpdated', args => {
        console.log('TASK UPDATED', args);
        // here we can filter and update only if the task belongs to a queue the user cares about
        const newQueuesStatus = updateState();
        this.setState({ queuesStatus: newQueuesStatus });
      });
    } catch (err) {
      const error = "Error, couldn't subscribing to live updates";
      this.setState({ loading: false, error });
      console.log(error, err);
    }
  }

  componentWillUnmount() {
    const { tasksQuery, queuesStatus } = this.state;
    // unsuscribe
    if (tasksQuery) tasksQuery.close();
    // clear all timers
    Object.values(queuesStatus).forEach(({ longestWaitingTask }) => clearInterval(longestWaitingTask.intervalId));
  }

  handleExpandClick = () => {
    if (!this.state.loading) this.setState(prev => ({ expanded: !prev.expanded }));
  };

  renderHeaderIcon = () => {
    if (this.state.loading) return <CircularProgress size={12} color="inherit" />;

    return this.state.expanded ? (
      <ArrowDropUpTwoTone style={{ padding: 0, fontSize: 18 }} />
    ) : (
      <ArrowDropDownTwoTone style={{ padding: 0, fontSize: 18 }} />
    );
  };

  render() {
    const { queuesStatus, expanded, error } = this.state;
    return (
      <>
        <Container>
          <HeaderContainer onClick={this.handleExpandClick} role="button">
            <Box marginTop="12px" marginRight="5px" marginBottom="12px" marginLeft="12px">
              Contacts waiting
            </Box>
            {this.renderHeaderIcon()}
          </HeaderContainer>
          <Collapse in={expanded} timeout="auto">
            <QueuesContainer>
              {error && <ErrorText>{error}</ErrorText>}
              {queuesStatus &&
                Object.entries(queuesStatus).map(([qName, qStatus]) => (
                  <QueueCard key={qName} qName={qName} qStatus={qStatus} colors={this.props.colors} />
                ))}
            </QueuesContainer>
          </Collapse>
        </Container>
      </>
    );
  }
}

export default QueuesStatus;

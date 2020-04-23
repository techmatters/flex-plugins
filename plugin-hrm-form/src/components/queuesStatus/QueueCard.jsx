import React from 'react';
import PropTypes from 'prop-types';
import { differenceInMinutes } from 'date-fns';

import { Box, Row } from '../../styles/HrmStyles';
import {
  QueueName,
  ChannelColumn,
  ChannelBox,
  ChannelLabel,
  WaitTimeLabel,
  WaitTimeValue,
} from '../../styles/queuesStatus';

class QueuesCard extends React.PureComponent {
  static displayName = 'QueuesCard';

  static propTypes = {
    qName: PropTypes.string.isRequired,
    facebook: PropTypes.number.isRequired,
    sms: PropTypes.number.isRequired,
    voice: PropTypes.number.isRequired,
    web: PropTypes.number.isRequired,
    whatsapp: PropTypes.number.isRequired,
    longestWaitingDate: PropTypes.string.isRequired,
    colors: PropTypes.shape({
      voiceColor: PropTypes.shape({ Accepted: PropTypes.string }),
      webColor: PropTypes.shape({ Accepted: PropTypes.string }),
      facebookColor: PropTypes.shape({ Accepted: PropTypes.string }),
      smsColor: PropTypes.shape({ Accepted: PropTypes.string }),
      whatsappColor: PropTypes.shape({ Accepted: PropTypes.string }),
    }).isRequired,
  };

  state = {
    waitingMinutes: null,
    intervalId: null,
  };

  componentDidUpdate(prevProps, prevState) {
    const { longestWaitingDate } = this.props;

    if (prevProps.longestWaitingDate !== longestWaitingDate) {
      clearTimeout(prevState.intervalId);

      if (longestWaitingDate) {
        this.setNewInterval();
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.intervalId);
  }

  setNewInterval = () => {
    const intervalId = setInterval(
      () => this.setState(prev => ({ waitingMinutes: prev.waitingMinutes + 1 })),
      60 * 1000,
    );

    this.setState({ intervalId });
  };

  render() {
    const { qName, colors, facebook, sms, voice, web, whatsapp, longestWaitingDate } = this.props;
    const { voiceColor, smsColor, facebookColor, whatsappColor, webColor } = colors;
    const waitingMinutes = longestWaitingDate && differenceInMinutes(new Date(), new Date(longestWaitingDate));
    const waitingMinutesMsg =
      // eslint-disable-next-line no-nested-ternary
      longestWaitingDate === null
        ? 'None'
        : waitingMinutes === 0
        ? 'Less than 1 minute'
        : `${waitingMinutes} minute${waitingMinutes > 1 ? 's' : ''}`;

    return (
      <>
        <Box paddingLeft="10px" paddingTop="10px">
          <QueueName>{qName}</QueueName>
          <Box marginTop="7px" marginBottom="14px">
            <Row>
              <ChannelColumn>
                <ChannelBox backgroundColor={voiceColor.Accepted}>{voice}</ChannelBox>
                <ChannelLabel>Calls</ChannelLabel>
              </ChannelColumn>
              <ChannelColumn marginLeft>
                <ChannelBox backgroundColor={smsColor.Accepted}>{sms}</ChannelBox>
                <ChannelLabel>SMS</ChannelLabel>
              </ChannelColumn>
              <ChannelColumn marginLeft>
                <ChannelBox backgroundColor={facebookColor.Accepted}>{facebook}</ChannelBox>
                <ChannelLabel>FB</ChannelLabel>
              </ChannelColumn>
              <ChannelColumn marginLeft>
                <ChannelBox backgroundColor={whatsappColor.Accepted}>{whatsapp}</ChannelBox>
                <ChannelLabel>WA</ChannelLabel>
              </ChannelColumn>
              <ChannelColumn marginLeft>
                <ChannelBox backgroundColor={webColor.Accepted}>{web}</ChannelBox>
                <ChannelLabel>Chat</ChannelLabel>
              </ChannelColumn>
            </Row>
          </Box>
          <Row>
            <WaitTimeLabel>Longest wait time:</WaitTimeLabel>
            <WaitTimeValue>{waitingMinutesMsg}</WaitTimeValue>
          </Row>
        </Box>
      </>
    );
  }
}

export default QueuesCard;

import React from 'react';
import PropTypes from 'prop-types';
import { differenceInMinutes } from 'date-fns';
import { Template } from '@twilio/flex-ui';

import { Box, Row, HiddenText } from '../../styles/HrmStyles';
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
    twitter: PropTypes.number.isRequired,
    longestWaitingDate: PropTypes.string,
    colors: PropTypes.shape({
      voiceColor: PropTypes.string,
      webColor: PropTypes.string,
      facebookColor: PropTypes.string,
      smsColor: PropTypes.string,
      whatsappColor: PropTypes.string,
      twitterColor: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    longestWaitingDate: null,
  };

  state = {
    waitingMinutes: 0,
    intervalId: null,
  };

  componentDidMount() {
    if (this.props.longestWaitingDate) this.setNewInterval();
  }

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

    const waitingMinutes = differenceInMinutes(new Date(), new Date(this.props.longestWaitingDate));
    this.setState({ intervalId, waitingMinutes });
  };

  renderChannel = (channel, color, value, marginLeft, channelAria) => (
    <ChannelColumn marginLeft={marginLeft} aria-label={`${value} ${channelAria || channel},`}>
      <ChannelBox isZero={value === 0} backgroundColor={color}>
        {value}
      </ChannelBox>
      <ChannelLabel>{channel}</ChannelLabel>
    </ChannelColumn>
  );

  getWaitingMessage = () => {
    if (this.props.longestWaitingDate === null) return <Template code="QueueCard-None" />;
    if (this.state.waitingMinutes === 0) return <Template code="QueueCard-LessThanMinute" />;
    if (this.state.waitingMinutes === 1) return <Template code="QueueCard-OneMinute" />;
    return (
      <>
        {this.state.waitingMinutes}
        <Template code="QueueCard-Minutes" component="span" />
      </>
    );
  };

  render() {
    const { qName, colors, facebook, sms, voice, web, whatsapp, twitter } = this.props;
    const { voiceColor, smsColor, facebookColor, whatsappColor, webColor, twitterColor } = colors;
    console.log(typeof smsColor)
    console.log(typeof whatsappColor);
    console.log(typeof facebookColor);
    console.log(typeof smsColor);
    console.log(typeof voiceColor);
    return (
      <>
        <Box paddingLeft="10px" paddingTop="10px">
          <HiddenText id={`name-${qName}`}>
            <Template code="QueueCard-Name" />
          </HiddenText>
          <HiddenText aria-labelledby={`name-${qName}`} />
          <QueueName>{qName}</QueueName>
          <Box marginTop="7px" marginBottom="14px">
            <Row>
              {this.renderChannel('Calls', voiceColor.Accepted, voice, false)}
              {this.renderChannel('SMS', smsColor.Accepted, sms, true)}
              {this.renderChannel('FB', facebookColor.Accepted, facebook, true, 'Facebook')}
              {this.renderChannel('WA', whatsappColor.Accepted, whatsapp, true, 'Whatsapp')}
              {this.renderChannel('Chat', webColor.Accepted, web, true)}
              {this.renderChannel('Twtr', twitterColor, twitter, true)}
            </Row>
          </Box>
          <Row>
            <WaitTimeLabel>
              <Template code="QueueCard-WaitLabel" />
            </WaitTimeLabel>
            <WaitTimeValue>{this.getWaitingMessage()}</WaitTimeValue>
          </Row>
        </Box>
      </>
    );
  }
}

export default QueuesCard;

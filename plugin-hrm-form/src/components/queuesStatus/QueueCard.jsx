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
import { channelTypes, ChannelTypes } from '../../states/DomainConstants';

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
    instagram: PropTypes.number.isRequired,
    longestWaitingDate: PropTypes.string,
    colors: PropTypes.shape({
      voiceColor: PropTypes.string,
      webColor: PropTypes.string,
      facebookColor: PropTypes.string,
      smsColor: PropTypes.string,
      whatsappColor: PropTypes.string,
      twitterColor: PropTypes.string,
      instagramColor: PropTypes.string,
    }).isRequired,
    contactsWaitingChannels: PropTypes.shape([]),
  };

  static defaultProps = {
    longestWaitingDate: null,
    contactsWaitingChannels: null,
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

  getChannelUI = (channel, color, value, marginLeft, channelAria) => (
    <ChannelColumn marginLeft={marginLeft} aria-label={`${value} ${channelAria || channel},`}>
      <ChannelBox
        isZero={value === 0}
        backgroundColor={color}
        className="channel-box-inner-value"
        data-testid="channel-box-inner-value"
      >
        {value}
      </ChannelBox>
      <ChannelLabel>{channel}</ChannelLabel>
    </ChannelColumn>
  );

  /**
   * @param {ChannelTypes} channel
   */
  renderChannel = channel => {
    const { colors, facebook, sms, voice, web, whatsapp, twitter, instagram } = this.props;
    const { voiceColor, smsColor, facebookColor, whatsappColor, webColor, twitterColor, instagramColor } = colors;

    switch (channel) {
      case channelTypes.voice:
        return this.getChannelUI('Calls', voiceColor, voice, false);
      case channelTypes.sms:
        return this.getChannelUI('SMS', smsColor, sms, true);
      case channelTypes.facebook:
        return this.getChannelUI('FB', facebookColor, facebook, true, 'Facebook');
      case channelTypes.whatsapp:
        return this.getChannelUI('WA', whatsappColor, whatsapp, true, 'Whatsapp');
      case channelTypes.web:
        return this.getChannelUI('Chat', webColor, web, true);
      case channelTypes.twitter:
        return this.getChannelUI('Twtr', twitterColor, twitter, true);
      case channelTypes.instagram:
        return this.getChannelUI('IG', instagramColor, instagram, true);
      default:
        return null;
    }
  };

  render() {
    const { qName, contactsWaitingChannels } = this.props;
    const renderFun = channel => <div data-testid={`${qName}-${channel}`}>{this.renderChannel(channel)}</div>;

    return (
      <>
        <Box paddingLeft="10px" paddingTop="10px" data-testid={`Queue-Status${qName}`}>
          <HiddenText id={`name-${qName}`}>
            <Template code="QueueCard-Name" />
          </HiddenText>
          <HiddenText aria-labelledby={`name-${qName}`} />
          <QueueName>{qName}</QueueName>
          <Box marginTop="7px" marginBottom="14px">
            <Row>
              {contactsWaitingChannels && Array.isArray(contactsWaitingChannels)
                ? Object.values(channelTypes)
                    .filter(c => contactsWaitingChannels.includes(c))
                    .map(renderFun)
                : Object.values(channelTypes).map(renderFun)}
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

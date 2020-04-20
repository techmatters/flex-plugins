import React from 'react';
import PropTypes from 'prop-types';

import { Box, Row } from '../../styles/HrmStyles';
import {
  QueueName,
  ChannelColumn,
  ChannelBox,
  ChannelLabel,
  WaitTimeLabel,
  WaitTimeValue,
} from '../../styles/queuesStatus';

const QueuesCard = ({ qName, qStatus, colors, waitingMinutesMsg }) => {
  const { voiceColor, smsColor, facebookColor, whatsappColor, webColor } = colors;

  return (
    <>
      <Box paddingLeft="10px" paddingTop="10px">
        <QueueName>{qName}</QueueName>
        <Box marginTop="7px" marginBottom="14px">
          <Row>
            <ChannelColumn>
              <ChannelBox backgroundColor={voiceColor.Accepted}>{qStatus.voice}</ChannelBox>
              <ChannelLabel>Calls</ChannelLabel>
            </ChannelColumn>
            <ChannelColumn marginLeft>
              <ChannelBox backgroundColor={smsColor.Accepted}>{qStatus.sms}</ChannelBox>
              <ChannelLabel>SMS</ChannelLabel>
            </ChannelColumn>
            <ChannelColumn marginLeft>
              <ChannelBox backgroundColor={facebookColor.Accepted}>{qStatus.facebook}</ChannelBox>
              <ChannelLabel>FB</ChannelLabel>
            </ChannelColumn>
            <ChannelColumn marginLeft>
              <ChannelBox backgroundColor={whatsappColor.Accepted}>{qStatus.whatsapp}</ChannelBox>
              <ChannelLabel>WA</ChannelLabel>
            </ChannelColumn>
            <ChannelColumn marginLeft>
              <ChannelBox backgroundColor={webColor.Accepted}>{qStatus.web}</ChannelBox>
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
};

QueuesCard.displayName = 'QueuesCard';

QueuesCard.propTypes = {
  qName: PropTypes.string.isRequired,
  qStatus: PropTypes.shape({
    facebook: PropTypes.number,
    sms: PropTypes.number,
    voice: PropTypes.number,
    web: PropTypes.number,
    whatsapp: PropTypes.number,
    longestWaitingTask: PropTypes.shape({
      taskId: PropTypes.string,
      timeWaiting: PropTypes.string,
    }),
  }).isRequired,
  colors: PropTypes.shape({
    voiceColor: PropTypes.shape({ Accepted: PropTypes.string }),
    webColor: PropTypes.shape({ Accepted: PropTypes.string }),
    facebookColor: PropTypes.shape({ Accepted: PropTypes.string }),
    smsColor: PropTypes.shape({ Accepted: PropTypes.string }),
    whatsappColor: PropTypes.shape({ Accepted: PropTypes.string }),
  }).isRequired,
  waitingMinutesMsg: PropTypes.string.isRequired,
};

export default QueuesCard;

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

const QueuesCard = ({ qName, qStatus, colors }) => {
  const { voiceColor, smsColor, facebookColor, whatsappColor, webColor } = colors;
  const { taskId, waitingMinutes } = qStatus.longestWaitingTask;
  const waitingMinutesMsg =
    // eslint-disable-next-line no-nested-ternary
    taskId === null
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
      updated: PropTypes.string,
      waitingMinutes: PropTypes.number,
      intervalId: PropTypes.number,
    }),
  }).isRequired,
  colors: PropTypes.shape({
    voiceColor: PropTypes.shape({ Accepted: PropTypes.string }),
    webColor: PropTypes.shape({ Accepted: PropTypes.string }),
    facebookColor: PropTypes.shape({ Accepted: PropTypes.string }),
    smsColor: PropTypes.shape({ Accepted: PropTypes.string }),
    whatsappColor: PropTypes.shape({ Accepted: PropTypes.string }),
  }).isRequired,
};

export default QueuesCard;

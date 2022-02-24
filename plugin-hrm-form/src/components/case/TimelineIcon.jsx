/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import * as Flex from '@twilio/flex-ui';
import NoteIcon from '@material-ui/icons/NoteAdd';
import AssignmentInd from '@material-ui/icons/AssignmentInd';
import ReplyIcon from '@material-ui/icons/Reply';

import { TimelineIconContainer } from '../../styles/case';
import { channelTypes, otherContactChannels } from '../../states/DomainConstants';
import InstagramIcon from '../common/icons/InstagramIcon';


// eslint-disable-next-line react/display-name
const getIcon = type => {
  switch (type) {
    case channelTypes.whatsapp:
      return <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.ChatWhatsApp} />;
    case channelTypes.facebook:
      return <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.ChatMessenger} />;
    case channelTypes.web:
      return <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.Chat} />;
    case channelTypes.sms:
      return <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.ChatSms} />;
    case channelTypes.voice:
      return <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.Call} />;
    case channelTypes.twitter:
      return <TwitterIcon width="24px" height="24px" />;
    case channelTypes.instagram:
      return <InstagramIcon width="30px" height="30px" color='#E70970' />;
    case 'note':
      return <NoteIcon style={{ opacity: 0.62, fontSize: '20px' }} />;
    case 'referral':
      return <ReplyIcon style={{ transform: 'scaleX(-1)', fontSize: '20px' }} />;
    // defaulting to otherContactChannels.includes(type). Maybe at some point we need to address this in a different way.
    default:
      return <AssignmentInd style={{ opacity: 0.62, fontSize: '20px' }} />;
  }
};

const TimelineIcon = ({ type }) => <TimelineIconContainer>{getIcon(type)}</TimelineIconContainer>;

TimelineIcon.displayName = 'TimelineIcon';
TimelineIcon.propTypes = {
  type: PropTypes.oneOf([...Object.values(channelTypes), ...Object.values(otherContactChannels), 'note', 'referral'])
    .isRequired,
};

const DefaultIcon = ({ defaultTaskChannel }) => (
  <div
    style={{
      color: typeof defaultTaskChannel.colors.main === 'function' ? '#3276CB' : defaultTaskChannel.colors.main.Accepted,
    }}
  >
    <Flex.Icon
      icon={
        typeof defaultTaskChannel.icons.active === 'function'
          ? defaultTaskChannel.icons.main
          : defaultTaskChannel.icons.active
      }
    />
  </div>
);

DefaultIcon.displayName = 'DefaultIcon';
DefaultIcon.propTypes = {
  defaultTaskChannel: PropTypes.instanceOf(Flex.TaskChannelDefinition).isRequired,
};

export default TimelineIcon;

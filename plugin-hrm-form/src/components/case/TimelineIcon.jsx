/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import * as Flex from '@twilio/flex-ui';
import NoteIcon from '@material-ui/icons/NoteAdd';

import { TimelineIconContainer } from '../../styles/case';
import { channelTypes } from '../../states/DomainConstants';

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
    case 'note':
    default:
      return <NoteIcon style={{ opacity: 0.62, fontSize: '20px' }} />;
  }
};

const TimelineIcon = ({ type }) => <TimelineIconContainer>{getIcon(type)}</TimelineIconContainer>;

TimelineIcon.displayName = 'TimelineIcon';
TimelineIcon.propTypes = {
  type: PropTypes.oneOf([...Object.values(channelTypes), 'note']).isRequired,
};

const DefaultIcon = ({ defaultTaskChannel }) => (
  <div
    style={{
      color:
        typeof defaultTaskChannel.colors.main === 'function'
          ? defaultTaskChannel.colors.main()
          : defaultTaskChannel.colors.main.Accepted,
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

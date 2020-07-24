/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import * as Flex from '@twilio/flex-ui';
import NoteIcon from '@material-ui/icons/NoteAdd';

const TimelineIcon = ({ type }) => {
  let icon;
  switch (type) {
    case 'whatsapp':
      icon = <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.ChatWhatsApp} />;
      break;
    case 'facebook':
      icon = <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.ChatMessenger} />;
      break;
    case 'web':
      icon = <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.Chat} />;
      break;
    case 'sms':
      icon = <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.ChatSms} />;
      break;
    case 'note':
    default:
      icon = <NoteIcon style={{ opacity: 0.62, fontSize: '20px' }} />;
      break;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '40px'}}>
      {icon}
    </div>
  );
};

TimelineIcon.displayName = 'TimelineIcon';
TimelineIcon.propTypes = {
  type: PropTypes.oneOf(['whatsapp', 'facebook', 'web', 'sms', 'note']).isRequired,
};

const DefaultIcon = ({ defaultTaskChannel }) => (
  <div style={{ color: defaultTaskChannel.colors.main.Accepted }}>
    <Flex.Icon icon={defaultTaskChannel.icons.active} />
  </div>
);

DefaultIcon.displayName = 'DefaultIcon';
DefaultIcon.propTypes = {
  defaultTaskChannel: PropTypes.instanceOf(Flex.TaskChannelDefinition).isRequired,
};

export default TimelineIcon;

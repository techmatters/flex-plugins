/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/no-multi-comp */
import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { TaskChannelDefinition } from '@twilio/flex-ui';
import NoteIcon from '@material-ui/icons/NoteAddOutlined';
import AssignmentInd from '@material-ui/icons/AssignmentIndOutlined';
import ReplyIcon from '@material-ui/icons/Reply';

import { TimelineIconContainer } from '../styles';
import { channelTypes, ChannelTypes } from '../../../states/DomainConstants';
import TelegramIcon from '../../common/icons/TelegramIcon';
import InstagramIcon from '../../common/icons/InstagramIcon';
import LineIcon from '../../common/icons/LineIcon';
import WhatsappIcon from '../../common/icons/WhatsappIcon';
import FacebookIcon from '../../common/icons/FacebookIcon';
import SmsIcon from '../../common/icons/SmsIcon';
import CallIcon from '../../common/icons/CallIcon';
import { colors } from '../../../channels/colors';

export type IconType = ChannelTypes | 'note' | 'referral';

export const getIcon = (type: IconType, size: string = '24px') => {
  switch (type) {
    case channelTypes.whatsapp:
      return <WhatsappIcon width={size} height={size} color={colors.whatsapp} />;
    case channelTypes.facebook:
    case channelTypes.messenger:
      return <FacebookIcon width={size} height={size} color={colors.facebook} />;
    case channelTypes.web:
      return <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.Chat} color={colors.web} />;
    case channelTypes.sms:
    case channelTypes.modica:
      return <SmsIcon width={size} height={size} color={colors.sms} />;
    case channelTypes.voice:
      return <CallIcon width={size} height={size} color={colors.voice} />;
    case channelTypes.telegram:
      return <TelegramIcon width={size} height={size} color={colors.telegram} />;
    case channelTypes.instagram:
      return <InstagramIcon width={size} height={size} color={colors.instagram} />;
    case channelTypes.line:
      return <LineIcon width={size} height={size} color={colors.line} />;
    case 'note':
      return <NoteIcon style={{ opacity: 0.62, fontSize: size }} />;
    case 'referral':
      return <ReplyIcon style={{ transform: 'scaleX(-1)', fontSize: size }} />;
    // defaulting to isOtherContactChannel(channel). Maybe at some point we need to address this in a different way.
    default:
      return <AssignmentInd style={{ opacity: 0.62, fontSize: size }} />;
  }
};

const TimelineIcon: React.FC<{ type: IconType }> = ({ type }) => (
  <TimelineIconContainer>{getIcon(type)}</TimelineIconContainer>
);

TimelineIcon.displayName = 'TimelineIcon';

type DefaultIconProps = { defaultTaskChannel: TaskChannelDefinition; color: string };

const DefaultIcon: React.FC<DefaultIconProps> = ({ defaultTaskChannel, color }) => (
  <div
    style={{
      color,
    }}
  >
    <Flex.Icon
      icon={
        typeof defaultTaskChannel.icons.active === 'function'
          ? defaultTaskChannel.icons.main
          : defaultTaskChannel.icons.active
      }
      aria-label={defaultTaskChannel.name}
    />
  </div>
);

DefaultIcon.displayName = 'DefaultIcon';

export default TimelineIcon;

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

<<<<<<< HEAD:plugin-hrm-form/src/components/case/TimelineIcon.tsx
import { TimelineIconContainer } from './styles';
import { channelTypes, ChannelTypes } from '../../states/DomainConstants';
import TwitterIcon from '../common/icons/TwitterIcon';
import InstagramIcon from '../common/icons/InstagramIcon';
import LineIcon from '../common/icons/LineIcon';
import WhatsappIcon from '../common/icons/WhatsappIcon';
import FacebookIcon from '../common/icons/FacebookIcon';
import SmsIcon from '../common/icons/SmsIcon';
import CallIcon from '../common/icons/CallIcon';
import { colors } from '../../channels/colors';
=======
import { TimelineIconContainer } from '../../../styles/case';
import { channelTypes, ChannelTypes } from '../../../states/DomainConstants';
import TwitterIcon from '../../common/icons/TwitterIcon';
import InstagramIcon from '../../common/icons/InstagramIcon';
import LineIcon from '../../common/icons/LineIcon';
import WhatsappIcon from '../../common/icons/WhatsappIcon';
import FacebookIcon from '../../common/icons/FacebookIcon';
import SmsIcon from '../../common/icons/SmsIcon';
import CallIcon from '../../common/icons/CallIcon';
import { colors } from '../../../channels/colors';
>>>>>>> 0d1f170937b0125a4c8872a49553c0d77b4968cf:plugin-hrm-form/src/components/case/timeline/TimelineIcon.tsx

type IconType = ChannelTypes | 'note' | 'referral';

// eslint-disable-next-line react/display-name
const getIcon = (type: IconType) => {
  switch (type) {
    case channelTypes.whatsapp:
      return <WhatsappIcon width="24px" height="24px" color={colors.whatsapp} />;
    case channelTypes.facebook:
      return <FacebookIcon width="24px" height="24px" color={colors.facebook} />;
    case channelTypes.web:
      return <DefaultIcon defaultTaskChannel={Flex.DefaultTaskChannels.Chat} color={colors.web} />;
    case channelTypes.sms:
      return <SmsIcon width="24px" height="24px" color={colors.sms} />;
    case channelTypes.voice:
      return <CallIcon width="24px" height="24px" color={colors.voice} />;
    case channelTypes.twitter:
      return <TwitterIcon width="24px" height="24px" color={colors.twitter} />;
    case channelTypes.instagram:
      return <InstagramIcon width="20px" height="20px" color={colors.instagram} />;
    case channelTypes.line:
      return <LineIcon width="24px" height="24px" color={colors.line} />;
    case 'note':
      return <NoteIcon style={{ opacity: 0.62, fontSize: '20px' }} />;
    case 'referral':
      return <ReplyIcon style={{ transform: 'scaleX(-1)', fontSize: '20px' }} />;
    // defaulting to isOtherContactChannel(channel). Maybe at some point we need to address this in a different way.
    default:
      return <AssignmentInd style={{ opacity: 0.62, fontSize: '20px' }} />;
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
    />
  </div>
);

DefaultIcon.displayName = 'DefaultIcon';

export default TimelineIcon;

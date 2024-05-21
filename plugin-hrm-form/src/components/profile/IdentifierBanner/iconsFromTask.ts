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

import { getIcon } from '../../case/timeline/TimelineIcon';
import { CoreChannelTypes, coreChannelTypes } from '../../../states/DomainConstants';
import { customSmsChannelTypes } from '../../../utils/smsChannels';

type ExtendedChannelTypes = CoreChannelTypes | keyof typeof customSmsChannelTypes;

const iconSize = '18px';
export const iconsFromTask: { [channelType in ExtendedChannelTypes]: JSX.Element } = {
  ...{
    [coreChannelTypes.web]: getIcon(coreChannelTypes.web, iconSize),
    [coreChannelTypes.voice]: getIcon(coreChannelTypes.voice, iconSize),
    [coreChannelTypes.sms]: getIcon(coreChannelTypes.sms, iconSize),
    [coreChannelTypes.whatsapp]: getIcon(coreChannelTypes.whatsapp, iconSize),
    [coreChannelTypes.facebook]: getIcon(coreChannelTypes.facebook, iconSize),
    [coreChannelTypes.twitter]: getIcon(coreChannelTypes.twitter, iconSize),
    [coreChannelTypes.instagram]: getIcon(coreChannelTypes.instagram, iconSize),
    [coreChannelTypes.line]: getIcon(coreChannelTypes.line, iconSize),
    [coreChannelTypes.email]: getIcon(coreChannelTypes.line, iconSize),
  },
  [customSmsChannelTypes.modica]: getIcon(customSmsChannelTypes.modica, iconSize),
};

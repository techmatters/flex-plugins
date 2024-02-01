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

type ExtendedChannelTypes = CoreChannelTypes | 'modica';

export const iconsFromTask: { [channelType in ExtendedChannelTypes]: JSX.Element } = {
  ...{
    [coreChannelTypes.web]: getIcon(coreChannelTypes.web, '18px'),
    [coreChannelTypes.voice]: getIcon(coreChannelTypes.voice, '18px'),
    [coreChannelTypes.sms]: getIcon(coreChannelTypes.sms, '18px'),
    [coreChannelTypes.whatsapp]: getIcon(coreChannelTypes.whatsapp, '18px'),
    [coreChannelTypes.facebook]: getIcon(coreChannelTypes.facebook, '18px'),
    [coreChannelTypes.twitter]: getIcon(coreChannelTypes.twitter, '18px'),
    [coreChannelTypes.instagram]: getIcon(coreChannelTypes.instagram, '18px'),
    [coreChannelTypes.line]: getIcon(coreChannelTypes.line, '18px'),
  },
  modica: getIcon('modica', '18px'),
};

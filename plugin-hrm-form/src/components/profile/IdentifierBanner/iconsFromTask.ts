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

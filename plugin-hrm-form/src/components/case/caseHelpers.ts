import { ActivityType } from '../../states/case/types';
import { channelsAndDefault } from '../../states/DomainConstants';

/**
 * Returns true if the activity provided is a connected case activity (included in channelsAndDefault const object)
 * @param activity Timeline Activity
 */
export const isConnectedCaseActivity = (activity: ActivityType): Boolean => Boolean(channelsAndDefault[activity.type]);

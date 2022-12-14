/* eslint-disable sonarjs/prefer-immediate-return */
import { ConfigurationState } from '../configuration/reducer';
import { SearchAPIContact, SearchUIContact } from '../../types/types';

export const searchAPIContactToSearchUIContact = (
  counselorsHash: ConfigurationState['counselors']['hash'],
  raw: SearchAPIContact[],
): SearchUIContact[] =>
  raw.map(contact => {
    const counselor = counselorsHash[contact.overview.counselor] || 'Unknown';
    const { firstName, lastName } = contact.details.callerInformation?.name ?? {};
    const callerName =
      contact.overview.callType === 'Someone calling about a child' && (firstName || lastName)
        ? `${firstName} ${lastName}`
        : undefined;
    return { ...contact, counselorName: counselor, callerName };
  });

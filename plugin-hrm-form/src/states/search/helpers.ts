/* eslint-disable sonarjs/prefer-immediate-return */
import { ConfigurationState } from '../configuration/reducer';
import { SearchAPIContact, SearchUIContact } from '../../types/types';

export const searchAPIContactToSearchUIContact = (
  counselorsHash: ConfigurationState['counselors']['hash'],
  raw: SearchAPIContact[],
): SearchUIContact[] =>
  raw.map(contact => {
    const counselor = counselorsHash[contact.overview.counselor] || 'Unknown';
    return { ...contact, counselorName: counselor };
  });

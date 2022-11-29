/* eslint-disable sonarjs/prefer-immediate-return */
import { ConfigurationState } from '../configuration/reducer';
import { SearchContact } from '../../types/types';

export const searchAPIContactToSearchUIContact = (
  counselorsHash: ConfigurationState['counselors']['hash'],
  raw: SearchContact[],
): (SearchContact & { counselorName: string })[] =>
  raw.map(contact => {
    const counselor = counselorsHash[contact.overview.counselor] || 'Unknown';
    return { ...contact, counselorName: counselor };
  });

/* eslint-disable sonarjs/prefer-immediate-return */
import { ConfigurationState } from '../configuration/reducer';
import { SearchContact } from '../../types/types';

export const addDetails = (counselorsHash: ConfigurationState['counselors']['hash'], raw: SearchContact[]) => {
  const detailed = raw.map(contact => {
    const counselor = counselorsHash[contact.overview.counselor] || 'Unknown';
    const det = { ...contact, counselor };
    return det;
  });

  return detailed;
};

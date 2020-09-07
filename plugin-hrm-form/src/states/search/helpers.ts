import { ConfigurationState } from '../configuration/reducer';
import { SearchContactResult } from '../../types/types';

export const addDetails = (counselorsHash: ConfigurationState['counselors']['hash'], raw: SearchContactResult[]) => {
  const detailed = raw.map(contact => {
    const counselor = counselorsHash[contact.overview.counselor] || 'Unknown';
    const det = { ...contact, counselor };
    return det;
  });

  return detailed;
};

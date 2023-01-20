import fetchResourceApi from './fetchResourceApi';
import { getReferrableResourceConfig } from '../hrmConfig';

// eslint-disable-next-line import/no-unused-modules
export type ReferrableResource = {
  id: string;
  name: string;
};

// eslint-disable-next-line import/no-unused-modules
export const referrableResourcesEnabled = () => Boolean(getReferrableResourceConfig().resourceBaseUrl);
// eslint-disable-next-line import/no-unused-modules
export const getResource = async (resourceID: string): Promise<ReferrableResource> => {
  // return fetchResourceApi(`resources/`);
  return {
    id: resourceID,
    name: 'Example Client Side Stubbed Resuource',
  };
};

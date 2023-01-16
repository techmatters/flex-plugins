import fetchResourceApi from './fetchResourceApi';
import { getConfig } from '../HrmFormPlugin';

// eslint-disable-next-line import/no-unused-modules
export type ReferrableResource = {
  id: string;
  name: string;
};

// eslint-disable-next-line import/no-unused-modules
export const resourceService = () => {
  const referableResourcesEnabled = () => Boolean(getConfig().resourceBaseUrl);
  const getResource = async (resourceID: string): Promise<ReferrableResource> => {
    // return fetchResourceApi(`resources/`);
    return {
      id: '1234',
      name: 'Example Client Side Stubbed Resuource',
    };
  };

  return {
    getResource,
  };
};

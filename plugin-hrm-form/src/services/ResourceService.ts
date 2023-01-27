import fetchResourceApi from './fetchResourceApi';
import { getReferrableResourceConfig } from '../hrmConfig';

export type ReffarebleResourceAttributeValue = string | string[] | { id: string; value: string; color?: string }[];

// eslint-disable-next-line import/no-unused-modules
export type ReferrableResource = {
  id: string;
  name: string;
  attributes: {
    [attr: string]: ReffarebleResourceAttributeValue;
  };
};

// eslint-disable-next-line import/no-unused-modules
export const referrableResourcesEnabled = () => Boolean(getReferrableResourceConfig().resourcesBaseUrl);
// eslint-disable-next-line import/no-unused-modules
export const getResource = async (resourceId: string): Promise<ReferrableResource> => {
  return fetchResourceApi(`resource/${resourceId}`);
};

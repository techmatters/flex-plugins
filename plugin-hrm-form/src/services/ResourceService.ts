import fetchResourceApi from './fetchResourceApi';
import { getReferrableResourceConfig } from '../hrmConfig';

export type ReferrableResourceAttributeValue = string | string[] | { id: string; value: string; color?: string }[];

export type ReferrableResource = {
  id: string;
  name: string;
  attributes: {
    [attr: string]: ReferrableResourceAttributeValue;
  };
};

export const referrableResourcesEnabled = () => Boolean(getReferrableResourceConfig().resourcesBaseUrl);

export const getResource = async (resourceId: string): Promise<ReferrableResource> => {
  return fetchResourceApi(`resource/${resourceId}`);
};

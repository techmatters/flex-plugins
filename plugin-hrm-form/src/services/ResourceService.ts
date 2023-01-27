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
export const referrableResourcesEnabled = () => Boolean(getReferrableResourceConfig().resourceBaseUrl);
// eslint-disable-next-line import/no-unused-modules
export const getResource = async (resourceId: string): Promise<ReferrableResource> => {
  // return fetchResourceApi(`resources/`);
  return {
    id: resourceId,
    name: 'Canadian Human Trafficking Hotline',
    attributes: {
      Details:
        'Details The Canadian Human Trafficking Hotline is a confidential, multilingual service, operating 24/7 to connect victims and survivors with social services, law enforcement, and emergency services, as well as receive tips from the public. The hotline uses a victim-centered approach when connecting human trafficking victims and survivors with local emergency, transition, and/or long-term supports and services across the country, as well as connecting callers to law enforcement where appropriate',
      Fee: 'Need based sliding scale',
      'Application Process': 'Intake forms, 30 day waiting period',
      Accessibility: 'Public Health Agency of Canada',
      'Special Needs': 'Interpreter services as needed',
      Phone: '604-123-4567',
      Address: '400-601 West Broadway, Vancouver, BC, V5Z 462',
      'Ages Served': 'Adults, Ages 13-18, Children 10+',
      'Service Categories': [
        { id: 'Mental Health', value: 'Mental Health', color: '#DFBF03' },
        { id: 'First Nations', value: 'First Nations', color: '#8055BA' },
        { id: 'Suicide Prevention and Trauma Center', value: 'Suicide Prevention and Trauma Center', color: '#97D2FF' },
      ],
      Hours: ['Monday - Fridays 9:00am - 11:00pm', 'Saturdays 10:00am - 12:00am', 'Sundays 12:00pm - 8:00pm'],
    },
  };
};

/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

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

const withFakeAttributes = (withoutAttributes: ReferrableResource) => ({
  ...withoutAttributes,
  // TODO: remove mocked attributes once we they come from the backend
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
});

export const getResource = async (resourceId: string): Promise<ReferrableResource> => {
  const resource = await fetchResourceApi(`resource/${resourceId}`);

  return withFakeAttributes(resource);
};

type SearchParameters = {
  nameSubstring: string;
  ids: string[];
};

export const searchResources = async (
  parameters: SearchParameters,
  start: number,
  limit: number,
): Promise<{ totalCount: number; results: ReferrableResource[] }> => {
  const fromApi = await fetchResourceApi(`search?start=${start}&limit=${limit}`, {
    method: 'POST',
    body: JSON.stringify(parameters),
  });
  return {
    ...fromApi,
    results: fromApi.results.map(r => withFakeAttributes(r)),
  };
};

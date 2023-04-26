/* eslint-disable import/no-unused-modules */

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
import fetchResourceApi from './fetchResourcesApi';
import { getReferrableResourceConfig } from '../hrmConfig';

export type ReferrableResourceAttributeValue =
  | string
  | string[]
  | { id: string; value: string; color?: string }[]
  | { info: string; value: string; language: string }[];

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

type SearchParameters = {
  generalSearchTerm: string;
};

export const searchResources = async (
  { generalSearchTerm }: SearchParameters,
  start: number,
  limit: number,
): Promise<{ totalCount: number; results: ReferrableResource[] }> => {
  const fromApi = await fetchResourceApi(`search?start=${start}&limit=${limit}`, {
    method: 'POST',
    body: JSON.stringify({ generalSearchTerm, filters: {} }),
  });
  return {
    ...fromApi,
    results: fromApi.results.map(r => r),
  };
};

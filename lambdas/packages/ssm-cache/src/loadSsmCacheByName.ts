/**
 * Copyright (C) 2021-2025 Technology Matters
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

import {
  DescribeParametersCommand,
  DescribeParametersCommandInput,
  GetParametersCommand,
} from '@aws-sdk/client-ssm';

import {
  ssmCache,
  getSsmClient,
  addToCache,
  hasCacheExpired,
  setCacheDurationMilliseconds,
  isConfigNotEmpty,
} from './ssmCache';

const MAX_NAMES_PER_GET_PARAMETERS = 10; // 10 is max allowed by AWS

const loadParameters = async (names: string[]): Promise<void> => {
  const batches = Array.from(
    { length: Math.ceil(names.length / MAX_NAMES_PER_GET_PARAMETERS) },
    (_, i) =>
      names.slice(
        i * MAX_NAMES_PER_GET_PARAMETERS,
        (i + 1) * MAX_NAMES_PER_GET_PARAMETERS,
      ),
  );

  const promises = batches.map(async batch => {
    const command = new GetParametersCommand({ Names: batch, WithDecryption: true });
    const resp = await getSsmClient().send(command);
    resp.Parameters?.forEach(p => addToCache(undefined, p));
  });
  await Promise.all(promises);
};

type LoadPaginatedByNameParameters = {
  nameContains: string;
  regex?: RegExp;
  nextToken?: string;
};
// Like loadPaginated in the HRM ssm-cache, which loads by path, but lists the parameters by name instead,
// so only the matching values are read
export const loadPaginatedByName = async ({
  nameContains,
  regex,
  nextToken,
}: LoadPaginatedByNameParameters): Promise<void> => {
  const params: DescribeParametersCommandInput = {
    MaxResults: 50, // 50 is max allowed by AWS
    ParameterFilters: [{ Key: 'Name', Option: 'Contains', Values: [nameContains] }],
  };

  if (nextToken) params.NextToken = nextToken;

  const command = new DescribeParametersCommand(params);

  const resp = await getSsmClient().send(command);

  const names = (resp.Parameters ?? [])
    .map(({ Name }) => Name)
    .filter((name): name is string => !!name && (!regex || regex.test(name)));
  await loadParameters(names);

  if (resp.NextToken) {
    await loadPaginatedByName({
      nameContains,
      regex,
      nextToken: resp.NextToken,
    });
  }
};

export type SsmCacheByNameConfig = {
  nameContains: string;
  regex?: RegExp;
};
export type LoadSsmCacheByNameParameters = {
  cacheDurationMilliseconds?: number;
  // We accept an array of types to allow loading parameters matching different names
  configs: SsmCacheByNameConfig[];
};
export const loadSsmCacheByName = async ({
  cacheDurationMilliseconds,
  configs,
}: LoadSsmCacheByNameParameters) => {
  if (isConfigNotEmpty() && !hasCacheExpired()) return;
  if (cacheDurationMilliseconds) setCacheDurationMilliseconds(cacheDurationMilliseconds);

  ssmCache.expiryDate = new Date(Date.now() + ssmCache.cacheDurationMilliseconds);

  const promises = configs.map(async config => loadPaginatedByName(config));
  try {
    await Promise.all(promises);
  } catch (e) {
    // Expire the cache so the next call retries, rather than using a partial load until it expires
    ssmCache.expiryDate = new Date(0);
    throw e;
  }
};

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

import {
  SSMClient,
  SSMClientConfig,
  GetParameterCommand,
  GetParametersByPathCommand,
  GetParametersByPathCommandInput,
  Parameter as SsmParameter,
  ParameterNotFound,
} from '@aws-sdk/client-ssm';

const convertToEndpoint = (endpointUrl: string) => {
  const url: URL = new URL(endpointUrl);
  return {
    url: url,
  };
};

const getSsmConfig = () => {
  const ssmConfig: SSMClientConfig = {};

  if (process.env.SSM_ENDPOINT) {
    ssmConfig.region = 'us-east-1';
    ssmConfig.endpoint = convertToEndpoint(process.env.SSM_ENDPOINT);
  }

  if (process.env.LOCAL_SSM_PORT) {
    ssmConfig.region = 'us-east-1';
    ssmConfig.endpoint = convertToEndpoint(
      `http://localhost:${process.env.LOCAL_SSM_PORT}`,
    );
  }

  if (process.env.SSM_REGION) {
    ssmConfig.region = process.env.SSM_REGION;
  }

  return ssmConfig;
};

let ssm: SSMClient;

export type SsmCacheParameter = {
  value: string;
  expiryDate: Date;
};

export type SsmCache = {
  values: Record<string, SsmCacheParameter | undefined>;
  expiryDate?: Date;
  cacheDurationMilliseconds: number;
};

export const ssmCache: SsmCache = {
  values: {},
  cacheDurationMilliseconds: 3600000,
};

export class SsmParameterNotFound extends Error {
  constructor(message: string) {
    super(message);

    // see: https://github.com/microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
    Object.setPrototypeOf(this, SsmParameterNotFound.prototype);
    this.name = 'SsmParameterNotFound';
  }
}

export const hasParameterExpired = (parameter: SsmCacheParameter | undefined) => {
  return !!(parameter?.expiryDate && new Date() > parameter.expiryDate);
};

export const hasCacheExpired = () =>
  !!(ssmCache.expiryDate && new Date() > ssmCache.expiryDate);

export const isConfigNotEmpty = () => !!Object.keys(ssmCache.values).length;

export const setCacheDurationMilliseconds = (cacheDurationMilliseconds: number) => {
  ssmCache.cacheDurationMilliseconds = cacheDurationMilliseconds;
};

// If the value is falsy, we take that to means that the parameter doesn't exist in addition to just a missing name
export const parameterExistsInCache = (name: string): boolean =>
  !!ssmCache.values[name]?.value;

export const getSsmClient = () => {
  if (!ssm) {
    ssm = new SSMClient(getSsmConfig());
  }

  return ssm;
};

export const addToCache = (regex: RegExp | undefined, { Name, Value }: SsmParameter) => {
  if (!Name) return;
  if (regex && !regex.test(Name)) return;

  ssmCache.values[Name] = {
    value: Value || '',
    expiryDate: new Date(Date.now() + ssmCache.cacheDurationMilliseconds),
  };
};

export const loadParameter = async (name: string) => {
  const params = {
    Name: name,
    WithDecryption: true,
  };

  const command = new GetParameterCommand(params);
  try {
    const { Parameter } = await getSsmClient().send(command);
    if (!Parameter?.Name) {
      return;
    }
    addToCache(undefined, Parameter);
  } catch (e) {
    if (e instanceof ParameterNotFound) {
      return;
    }
    throw e;
  }
};

export const getSsmParameter = async (
  name: string,
  cacheDurationMilliseconds?: number,
): Promise<string> => {
  const oldCacheDurationMilliseconds = ssmCache.cacheDurationMilliseconds;
  if (cacheDurationMilliseconds) setCacheDurationMilliseconds(cacheDurationMilliseconds);

  // If the cache doesn't have the requested parameter or if it is expired, load it
  if (!parameterExistsInCache(name) || hasParameterExpired(ssmCache.values[name])) {
    await loadParameter(name);
  }
  setCacheDurationMilliseconds(oldCacheDurationMilliseconds);

  // If the cache still doesn't have the requested parameter, throw an error
  if (!parameterExistsInCache(name)) {
    throw new SsmParameterNotFound(`Parameter ${name} not found`);
  }

  return ssmCache.values[name]?.value || '';
};

type LoadPaginatedParameters = {
  path: string;
  regex?: RegExp;
  nextToken?: string;
};

export const loadPaginated = async ({
  path,
  regex,
  nextToken,
}: LoadPaginatedParameters): Promise<void> => {
  const params: GetParametersByPathCommandInput = {
    MaxResults: 10, // 10 is max allowed by AWS
    Path: path,
    Recursive: true,
    WithDecryption: true,
  };

  if (nextToken) params.NextToken = nextToken;

  const command = new GetParametersByPathCommand(params);

  const resp = await getSsmClient().send(command);

  resp.Parameters?.forEach(p => addToCache(regex, p));

  if (resp.NextToken) {
    await loadPaginated({
      path,
      regex,
      nextToken: resp.NextToken,
    });
  }
};

export type SsmCacheConfig = {
  path: string;
  regex?: RegExp;
};

export type LoadSsmCacheParameters = {
  cacheDurationMilliseconds?: number;
  // We accept an array of types to allow loading parameters from multiple paths
  configs: SsmCacheConfig[];
};

export const loadSsmCache = async ({
  cacheDurationMilliseconds,
  configs,
}: LoadSsmCacheParameters) => {
  if (isConfigNotEmpty() && !hasCacheExpired()) return;
  if (cacheDurationMilliseconds) setCacheDurationMilliseconds(cacheDurationMilliseconds);

  ssmCache.expiryDate = new Date(Date.now() + ssmCache.cacheDurationMilliseconds);

  const promises = configs.map(async config => loadPaginated(config));
  await Promise.all(promises);
};

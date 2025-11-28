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

const hasParameterExpired = (parameter: SsmCacheParameter | undefined) => {
  return !!(parameter?.expiryDate && new Date() > parameter.expiryDate);
};

const setCacheDurationMilliseconds = (cacheDurationMilliseconds: number) => {
  ssmCache.cacheDurationMilliseconds = cacheDurationMilliseconds;
};

// If the value is falsy, we take that to means that the parameter doesn't exist in addition to just a missing name
const parameterExistsInCache = (name: string): boolean => !!ssmCache.values[name]?.value;

const getSsmClient = () => {
  if (!ssm) {
    ssm = new SSMClient(getSsmConfig());
  }

  return ssm;
};

const addToCache = (regex: RegExp | undefined, { Name, Value }: SsmParameter) => {
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

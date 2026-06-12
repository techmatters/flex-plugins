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
import { Twilio } from 'twilio';
import type { ConfigurationInstance } from 'twilio/lib/rest/flexApi/v1/configuration';

export const retrieveServiceConfiguration = async (
  client: Twilio,
): Promise<
  Omit<ConfigurationInstance, 'attributes'> & {
    attributes: Record<string, any> & {
      feature_flags: Record<string, boolean | undefined>;
    };
  }
> => {
  const serviceConfig = await client.flexApi.v1.configuration.get().fetch();
  return serviceConfig;
};

export const retrieveServiceConfigurationAttributes = async (
  client: Twilio,
): Promise<
  Record<string, any> & { feature_flags: Record<string, boolean | undefined> }
> => {
  const serviceConfig = await retrieveServiceConfiguration(client);
  return serviceConfig.attributes;
};

export const retrieveFeatureFlags = async (
  client: Twilio,
): Promise<Record<string, boolean | undefined>> => {
  const serviceConfigAttributes = await retrieveServiceConfigurationAttributes(client);
  return serviceConfigAttributes.feature_flags;
};

export type TaskRouterSkill =
  | {
      multivalue: false;
      name: string;
      maximum: null;
      minimum: null;
    }
  | {
      multivalue: true;
      name: string;
      maximum: number;
      minimum: number;
    };

export const retrieveServiceConfigurationTaskRouterSkills = async (
  client: Twilio,
): Promise<TaskRouterSkill[]> => {
  const serviceConfig = await retrieveServiceConfiguration(client);
  return serviceConfig.taskrouterSkills;
};

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

import * as Flex from '@twilio/flex-ui';

import { FeatureFlags } from './types/types';
import { configurationBase, namespace, RootState } from './states';

const featureFlagEnvVarPrefix = 'REACT_FF_';

const readConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = `${process.env.REACT_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url}/${
    manager.serviceConfiguration.attributes.hrm_api_version
  }/accounts/${manager.workerClient.accountSid}`;
  const resourcesConfiguredBaseUrl =
    process.env.REACT_RESOURCES_BASE_URL || manager.serviceConfiguration.attributes.resources_base_url;
  const resourcesBaseUrl = resourcesConfiguredBaseUrl
    ? `${resourcesConfiguredBaseUrl}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${manager.workerClient.accountSid}`
    : undefined;
  const serverlessBaseUrl =
    process.env.REACT_SERVERLESS_BASE_URL || manager.serviceConfiguration.attributes.serverless_base_url;
  const logoUrl = manager.serviceConfiguration.attributes.logo_url;
  const assetsBucketUrl = manager.serviceConfiguration.attributes.assets_bucket_url;

  const chatServiceSid = manager.serviceConfiguration.chat_service_instance_sid;
  const workerSid = manager.workerClient.sid;
  const { helpline, counselorLanguage, full_name: counselorName, roles } = manager.workerClient.attributes as any;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const { identity, token } = manager.user;
  const isSupervisor = roles.includes('supervisor');
  const {
    helplineLanguage,
    definitionVersion,
    pdfImagesSource,
    multipleOfficeSupport,
    permissionConfig,
  } = manager.serviceConfiguration.attributes;
  const contactsWaitingChannels = manager.serviceConfiguration.attributes.contacts_waiting_channels || null;
  const featureFlagsFromEnvEntries = Object.entries(process.env)
    .filter(([varName]) => varName.startsWith(featureFlagEnvVarPrefix))
    .map(([name, value]) => [
      name.substring(featureFlagEnvVarPrefix.length),
      (value ?? 'false').toLowerCase() === 'true',
    ]);
  const featureFlagsFromEnv = Object.fromEntries(featureFlagsFromEnvEntries);
  const featureFlagsFromServiceConfig: FeatureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
  const featureFlags = { ...featureFlagsFromServiceConfig, ...featureFlagsFromEnv };
  const { strings } = (manager as unknown) as { strings: { [key: string]: string } };

  return {
    featureFlags,
    strings,
    hrm: {
      hrmBaseUrl,
      serverlessBaseUrl,
      logoUrl,
      assetsBucketUrl,
      chatServiceSid,
      workerSid,
      helpline,
      currentWorkspace,
      counselorLanguage,
      helplineLanguage,
      identity,
      token,
      counselorName,
      isSupervisor,
      definitionVersion,
      pdfImagesSource,
      multipleOfficeSupport,
      permissionConfig,
      contactsWaitingChannels,
    },
    referrableResources: {
      resourcesBaseUrl,
      token,
    },
  };
};

let cachedConfig: ReturnType<typeof readConfig>;

export const initializeConfig = () => {
  try {
    cachedConfig = readConfig();
  } catch (err) {
    console.log(
      'Failed to read config on page load, leaving undefined for now (it will be populated when the flex reducer runs)',
      err,
    );
  }
};

export const subscribeToConfigUpdates = (manager: Flex.Manager) => {
  manager.store.subscribe(() => {
    try {
      cachedConfig = readConfig();
    } catch (err) {
      console.warn('Failed to read configuration - leaving cached version the same', err);
    }
  });
};

export const getHrmConfig = () => cachedConfig.hrm;
export const getReferrableResourceConfig = () => cachedConfig.referrableResources;
export const getTemplateStrings = () => cachedConfig.strings;
export const getAseloFeatureFlags = (): FeatureFlags => cachedConfig.featureFlags;

/**
 * Helper to expose the forms definitions without the need of calling Manager
 */
export const getDefinitionVersions = () => {
  const { currentDefinitionVersion, definitionVersions } = (Flex.Manager.getInstance().store.getState() as RootState)[
    namespace
  ][configurationBase];

  return { currentDefinitionVersion, definitionVersions };
};

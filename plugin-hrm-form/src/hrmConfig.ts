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

import { buildFormDefinitionsBaseUrlGetter } from './definitionVersions';
import { FeatureFlags } from './types/types';

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
  const getFormDefinitionsBaseUrl = buildFormDefinitionsBaseUrlGetter(manager);

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

  const featureFlags: FeatureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
  const { strings } = (manager as unknown) as { strings: { [key: string]: string } };

  return {
    featureFlags,
    strings,
    hrm: {
      hrmBaseUrl,
      serverlessBaseUrl,
      logoUrl,
      assetsBucketUrl,
      getFormDefinitionsBaseUrl,
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
    },
  };
};

let cachedConfig: ReturnType<typeof readConfig>;

try {
  cachedConfig = readConfig();
} catch (err) {
  console.log(
    'Failed to read config on page load, leaving undefined for now (it will be populated when the flex reducer runs)',
    err,
  );
}

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
export const getResourceStrings = () => cachedConfig.strings;
export const getAseloFeatureFlags = () => cachedConfig.featureFlags;

/*
 * Legacy function, only used for backward compatibility,
 * New code should use one of the above functions instead
 */
export const getConfig = () => ({
  ...cachedConfig.hrm,
  ...cachedConfig.referrableResources,
  strings: cachedConfig.strings,
  featureFlags: cachedConfig.featureFlags,
});

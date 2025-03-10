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

import { buildFormDefinitionsBaseUrlGetter, inferConfiguredFormDefinitionsBaseUrl } from './definitionVersions';
import { ConfigFlags, FeatureFlags } from './types/types';
import type { RootState } from './states';
import { namespace } from './states/storeNamespaces';
import { WorkerSID } from './types/twilio';

const featureFlagEnvVarPrefix = 'REACT_APP_FF_';
type ContactSaveFrequency = 'onTabChange' | 'onFinalSaveAndTransfer';

const readConfig = () => {
  const manager = Flex.Manager.getInstance();
  const { identity } = manager.user;

  // This is a really hacky test, need a better way to determine if the user is one of our bots
  const userIsAseloBot = /aselo.+@techmatters\.org/.test(identity);

  const accountSid = manager.serviceConfiguration.account_sid;
  const baseUrl = process.env.REACT_APP_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url;
  const hrmBaseUrl = `${process.env.REACT_APP_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url}/${
    manager.serviceConfiguration.attributes.hrm_api_version
  }/accounts/${accountSid}${userIsAseloBot ? '-aselo_test' : ''}`;
  const hrmMicroserviceBaseUrl = process.env.REACT_APP_HRM_MICROSERVICE_BASE_URL
    ? `${process.env.REACT_APP_HRM_MICROSERVICE_BASE_URL}${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${accountSid}`
    : hrmBaseUrl;
  const llmAssistantBaseUrl = `${
    process.env.REACT_APP_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url
  }/lambda/ai/llm-service/${accountSid}`;
  const resourcesConfiguredBaseUrl =
    process.env.REACT_APP_RESOURCES_BASE_URL || manager.serviceConfiguration.attributes.resources_base_url;
  const resourcesBaseUrl = resourcesConfiguredBaseUrl
    ? `${resourcesConfiguredBaseUrl}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${accountSid}`
    : undefined;
  const serverlessBaseUrl =
    process.env.REACT_APP_SERVERLESS_BASE_URL || manager.serviceConfiguration.attributes.serverless_base_url;
  const configuredFormDefinitionsBaseUrl =
    process.env.REACT_APP_FORM_DEFINITIONS_BASE_URL ||
    manager.serviceConfiguration.attributes.form_definitions_base_url ||
    inferConfiguredFormDefinitionsBaseUrl(manager);
  const logoUrl = manager.serviceConfiguration.attributes.logo_url;
  const assetsBucketUrl = manager.serviceConfiguration.attributes.assets_bucket_url;
  const getFormDefinitionsBaseUrl = buildFormDefinitionsBaseUrlGetter(new URL(configuredFormDefinitionsBaseUrl));

  const { helpline_code: helplineCode, environment } = manager.serviceConfiguration.attributes;
  const docsBucket = `tl-aselo-docs-${helplineCode}-${environment}`;

  const externalRecordingsEnabled = manager.serviceConfiguration.attributes.external_recordings_enabled || false;
  const contactSaveFrequency: ContactSaveFrequency =
    manager.serviceConfiguration.attributes.contact_save_frequency || 'onTabChange';

  const chatServiceSid = manager.serviceConfiguration.chat_service_instance_sid;
  const workerSid = manager.workerClient.sid as WorkerSID;
  const { helpline, counselorLanguage, full_name: counselorName, roles } = manager.workerClient.attributes as any;
  const currentWorkspace = manager.serviceConfiguration.taskrouter_workspace_sid;
  const isSupervisor = roles.includes('supervisor');
  const {
    helplineLanguage,
    definitionVersion,
    pdfImagesSource,
    multipleOfficeSupport,
    permissionConfig,
  } = manager.serviceConfiguration.attributes;
  const contactsWaitingChannels = manager.serviceConfiguration.attributes.contacts_waiting_channels || null;

  const configFlags: ConfigFlags = manager.serviceConfiguration.attributes.config_flags || {};

  const featureFlagsFromEnvEntries = Object.entries(process.env)
    .filter(([varName]) => varName.startsWith(featureFlagEnvVarPrefix))
    .map(([name, value]) => [
      name.substring(featureFlagEnvVarPrefix.length),
      (value ?? 'false').toLowerCase() === 'true',
    ]);
  const featureFlagsFromEnv = Object.fromEntries(featureFlagsFromEnvEntries);
  const featureFlagsFromServiceConfig: FeatureFlags = manager.serviceConfiguration.attributes.feature_flags || {};

  const featureFlags = {
    ...featureFlagsFromServiceConfig,
    ...featureFlagsFromEnv,
  };
  const { strings } = (manager as unknown) as {
    strings: { [key: string]: string };
  };

  return {
    configFlags,
    featureFlags,
    strings,
    llm: {
      assistantBaseUrl: llmAssistantBaseUrl,
    },
    hrm: {
      accountSid,
      baseUrl,
      hrmBaseUrl,
      hrmMicroserviceBaseUrl,
      serverlessBaseUrl,
      logoUrl,
      assetsBucketUrl,
      getFormDefinitionsBaseUrl,
      chatServiceSid,
      workerSid,
      helpline,
      currentWorkspace,
      counselorLanguage: 'en-USCR',
      helplineLanguage: 'en-USCR',
      identity,
      counselorName,
      isSupervisor,
      definitionVersion: 'uscr-v1' as any,
      // definitionVersion,
      pdfImagesSource,
      multipleOfficeSupport,
      permissionConfig,
      contactsWaitingChannels,
      externalRecordingsEnabled,
      helplineCode,
      environment,
      docsBucket,
      contactSaveFrequency,
    },
    referrableResources: {
      resourcesBaseUrl,
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
export const getLlmConfig = () => cachedConfig.llm;

export const getTemplateStrings = () => cachedConfig.strings;
export const getAseloConfigFlags = (): ConfigFlags => cachedConfig.configFlags;
export const getAseloFeatureFlags = (): FeatureFlags => cachedConfig.featureFlags;

/**
 * DO NOT USE IN REACT COMPONENTS! Using this in react components can lead to race conditions on loading where the component loads before the definition is ready
 * Map the configuration redux state to the React component properties instead. This way if the component loads before the definitions are ready, it will reload once they are
 * Ideally this should only be used in code that is invoked independently of React components, like Flex action event handlers
 */
// eslint-disable-next-line import/no-unused-modules
export const getDefinitionVersions = () => {
  return (Flex.Manager.getInstance().store.getState() as RootState)[namespace].configuration;
};

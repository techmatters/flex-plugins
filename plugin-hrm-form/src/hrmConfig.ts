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
import { buildFormDefinitionsBaseUrlGetter } from 'hrm-form-definitions';

import type { RootState } from './states';
import { namespace } from './states/storeNamespaces';
import { WorkerSID } from './types/twilio';
import { FeatureFlags } from './types/FeatureFlags';

const featureFlagEnvVarPrefix = 'REACT_APP_FF_';
type ContactSaveFrequency = 'onTabChange' | 'onFinalSaveAndTransfer';

const getEnvironmentFromHrmBaseUrl = (manager: Flex.Manager) => {
  const hrmBaseUrl = `${process.env.REACT_APP_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url}`;
  const prefix = 'https://hrm-';
  const suffix = '.tl.techmatters.org';
  const environment = hrmBaseUrl.substring(prefix.length, hrmBaseUrl.indexOf(suffix)).replace('-eu', '');

  /*
   * hrm-test is an alias of hrm-staging that we should deprecate & remove, but some accounts are still configured to point at it
   * This ensures any accounts still pointing at hrm-test go to the right bucket for their assets
   */
  if (environment === 'test') {
    return 'staging';
  }

  return environment;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const readConfig = () => {
  const manager = Flex.Manager.getInstance();
  const { identity } = manager.user;
  // This is a really hacky test, need a better way to determine if the user is one of our bots
  const userIsAseloBot = /aselo.+(?:@|_40)techmatters(?:\.|_2E)org/.test(identity);
  const accountSid = manager.serviceConfiguration.account_sid;
  const baseUrl = process.env.REACT_APP_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url;
  const hrmBaseUrl = `${process.env.REACT_APP_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url}/${
    manager.serviceConfiguration.attributes.hrm_api_version
  }/accounts/${accountSid}${userIsAseloBot ? '-aselo_test' : ''}`;
  const hrmMicroserviceBaseUrl = process.env.REACT_APP_HRM_MICROSERVICE_BASE_URL
    ? `${process.env.REACT_APP_HRM_MICROSERVICE_BASE_URL}${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${accountSid}`
    : hrmBaseUrl;
  const accountScopedLambdaBaseUrl = `${
    process.env.REACT_APP_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url
  }/lambda/twilio/account-scoped/${accountSid}`;
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
  const logoUrl = manager.serviceConfiguration.attributes.logo_url;
  const assetsBucketUrl = manager.serviceConfiguration.attributes.assets_bucket_url;

  const { helpline_code: helplineCode, environment } = manager.serviceConfiguration.attributes;
  const docsBucket = `tl-aselo-docs-${helplineCode}-${environment}`;
  const getFormDefinitionsBaseUrl = buildFormDefinitionsBaseUrlGetter({
    environment: getEnvironmentFromHrmBaseUrl(manager),
  });

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
    enableExternalRecordings,
    enableUnmaskingCalls,
    hideAddToNewCaseButton,
    enforceZeroTranscriptRetention,
  } = {
    // Deprecated, remove when service configurations changes have applied 2025-09-30
    ...manager.serviceConfiguration.attributes.config_flags,
    ...manager.serviceConfiguration.attributes,
  } as any;
  const contactsWaitingChannels = manager.serviceConfiguration.attributes.contacts_waiting_channels || null;
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
  // Compatibility, remove feature flag check when service configurations changes have applied 2025-09-30
  const enableClientProfiles =
    manager.serviceConfiguration.attributes.enableClientProfiles ?? featureFlags.enable_client_profiles ?? true;
  // Compatibility, remove feature flag check when service configurations changes have applied 2025-09-30
  const enableConferencing =
    manager.serviceConfiguration.attributes.enableConferencing ?? featureFlags.enable_conferencing ?? false;
  const { strings } = (manager as unknown) as {
    strings: { [key: string]: string };
  };

  return {
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
      accountScopedLambdaBaseUrl,
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
      counselorName,
      isSupervisor,
      definitionVersion,
      pdfImagesSource,
      multipleOfficeSupport,
      permissionConfig,
      contactsWaitingChannels,
      externalRecordingsEnabled,
      enforceZeroTranscriptRetention,
      helplineCode,
      environment,
      docsBucket,
      contactSaveFrequency,
      enableExternalRecordings,
      enableUnmaskingCalls,
      enableClientProfiles,
      enableConferencing,
      hideAddToNewCaseButton,
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

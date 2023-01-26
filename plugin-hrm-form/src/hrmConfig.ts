import * as Flex from '@twilio/flex-ui';

import { FeatureFlags } from './types/types';

const readConfig = () => {
  const manager = Flex.Manager.getInstance();

  const hrmBaseUrl = `${process.env.REACT_HRM_BASE_URL || manager.serviceConfiguration.attributes.hrm_base_url}/${
    manager.serviceConfiguration.attributes.hrm_api_version
  }/accounts/${manager.workerClient.accountSid}`;
  const resourceConfiguredBaseUrl =
    process.env.REACT_RESOURCE_BASE_URL || manager.serviceConfiguration.attributes.resource_base_url;
  const resourceBaseUrl = resourceConfiguredBaseUrl
    ? `${resourceConfiguredBaseUrl}/${manager.serviceConfiguration.attributes.hrm_api_version}/accounts/${manager.workerClient.accountSid}`
    : undefined;
  const serverlessBaseUrl =
    process.env.REACT_SERVERLESS_BASE_URL || manager.serviceConfiguration.attributes.serverless_base_url;
  const logoUrl = manager.serviceConfiguration.attributes.logo_url;
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
  const featureFlags: FeatureFlags = manager.serviceConfiguration.attributes.feature_flags || {};
  const contactsWaitingChannels = manager.serviceConfiguration.attributes.contacts_waiting_channels || null;
  const { strings } = (manager as unknown) as { strings: { [key: string]: string } };

  return {
    featureFlags,
    strings,
    hrm: {
      hrmBaseUrl,
      serverlessBaseUrl,
      logoUrl,
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
      resourceBaseUrl,
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

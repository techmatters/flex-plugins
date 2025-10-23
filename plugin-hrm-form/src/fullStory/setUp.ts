import type { Worker } from 'twilio-taskrouter';
import { CustomPlugins, ServiceConfiguration } from '@twilio/flex-ui';
import * as FullStory from '@fullstory/browser';

import { fullStoryId } from '../private/secret';

/**
 * Identifies helpline usage by Twilio Account ID (accountSid) in FullStory
 * @param workerClient
 */
function helplineIdentifierFullStory(workerClient: Worker, flexVersion, customPlugins: CustomPlugins[]) {
  const { accountSid, attributes } = workerClient;
  const { full_name: fullName, email, contact_uri: contactUri } = attributes ?? {};
  FullStory.setUserVars({ accountSid, displayName: fullName || contactUri || 'Unknown', email });
  FullStory.setVars('page', {
    flexVersion,
  });
  const { src } = customPlugins.find(p => p.name === 'HRM Forms') ?? {};
  if (src) {
    const { pluginVersion } =
      src.match(
        /https:\/\/assets-\w+\.tl\.techmatters\.org\/plugins\/hrm-form\/\w+\/(?<pluginVersion>[\w.-]+)\/plugin-hrm-form\.js/,
      )?.groups ?? {};
    FullStory.setVars('page', {
      pluginUrl: src,
      pluginVersion,
    });
  }
}

export function setUpFullStory(workerClient: Worker, serviceConfiguration: ServiceConfiguration) {
  if (serviceConfiguration.attributes.feature_flags.enable_fullstory_monitoring) {
    FullStory.init({
      orgId: fullStoryId,
      devMode: process.env.ENABLE_MONITORING !== 'true',
    });
    console.log('Fullstory monitoring is enabled');
    helplineIdentifierFullStory(
      workerClient,
      serviceConfiguration.ui_version,
      serviceConfiguration.plugin_service_attributes?.custom_plugins ?? [],
    );
  }
}

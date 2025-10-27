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

import type { Worker } from 'twilio-taskrouter';
import { CustomPlugins, ServiceConfiguration } from '@twilio/flex-ui';
import * as FullStory from '@fullstory/browser';

import { fullStoryId } from '../private/secret';

/**
 * Identifies helpline usage by Twilio Account ID (accountSid) in FullStory
 */
function helplineIdentifierFullStory(workerClient: Worker, flexVersion: string, customPlugins: CustomPlugins[]) {
  try {
    const { accountSid, attributes } = workerClient;
    const { full_name: fullName, email, contact_uri: contactUri, helpline_code: helplineCode } = attributes ?? {};
    FullStory.setUserVars({ accountSid, displayName: fullName || contactUri || 'Unknown', email, helplineCode });
    FullStory.setVars('page', {
      flexVersion,
    });
    const { src } = customPlugins.find(p => p.name === 'HRM Forms') ?? {};
    if (src) {
      const { pluginVersion, environment } =
        src.match(
          /https:\/\/assets-(?<environment>\w+)\.tl\.techmatters\.org\/plugins\/hrm-form\/\w+\/(?<pluginVersion>[\w.-]+)\/plugin-hrm-form\.js/,
        )?.groups ?? {};
      FullStory.setVars('page', {
        pluginUrl: src,
        pluginVersion,
      });
      FullStory.setUserVars({ environment });
    }
  } catch (err) {
    console.error('Error adding contextual data to FullStory session', err);
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

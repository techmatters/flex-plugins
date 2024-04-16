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

import { ServiceConfiguration } from '@twilio/flex-ui';
import * as FullStory from '@fullstory/browser';
import type { Worker } from 'twilio-taskrouter';

import { fullStoryId } from '../private/secret';

function setUpFullStory() {
  FullStory.init({
    orgId: fullStoryId,
    devMode: process.env.ENABLE_MONITORING !== 'true',
  });
  console.log('Fullstory monitoring is enabled');
}

/**
 * Identifies helpline usage by Twilio Account ID (accountSid) in FullStory
 * @param workerClient
 */
function helplineIdentifierFullStory(workerClient) {
  const { accountSid } = workerClient;
  FullStory.setUserVars({ accountSid });
}

export default function setUpMonitoring(workerClient: Worker, serviceConfiguration: ServiceConfiguration) {
  if (serviceConfiguration.attributes.feature_flags.enable_fullstory_monitoring) {
    setUpFullStory();
    helplineIdentifierFullStory(workerClient);
  }
}

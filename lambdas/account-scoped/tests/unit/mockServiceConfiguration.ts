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

import twilio from 'twilio';
import { AseloServiceConfigurationAttributes } from '../testTwilioTypes';
import {
  ConfigurationContext,
  ConfigurationInstance,
} from 'twilio/lib/rest/flexApi/v1/configuration';
import { RecursivePartial } from './RecursivePartial';
import { DEFAULT_CONFIGURATION_ATTRIBUTES } from '../testTwilioValues';

export const setConfigurationAttributes = (
  twilioClient: RecursivePartial<twilio.Twilio>,
  attributes: RecursivePartial<AseloServiceConfigurationAttributes> = {},
): twilio.Twilio => {
  const mockServiceConfigurationFetch: jest.MockedFunction<
    ConfigurationContext['fetch']
  > = jest.fn();
  const updatedConfiguration: AseloServiceConfigurationAttributes = {
    ...DEFAULT_CONFIGURATION_ATTRIBUTES,
    ...attributes,
    feature_flags: {
      ...DEFAULT_CONFIGURATION_ATTRIBUTES.feature_flags,
      ...attributes.feature_flags,
    },
  };
  mockServiceConfigurationFetch.mockClear();
  mockServiceConfigurationFetch.mockResolvedValue({
    attributes: updatedConfiguration,
  } as ConfigurationInstance);

  return {
    ...twilioClient,
    flexApi: {
      ...twilioClient?.flexApi,
      v1: {
        ...twilioClient.flexApi?.v1,
        configuration: {
          ...twilioClient.flexApi?.v1?.configuration,
          get: () => ({
            fetch: mockServiceConfigurationFetch as ConfigurationContext['fetch'],
          }),
        },
      },
    },
  } as twilio.Twilio;
};

export const newMockTwilioClientWithConfigurationAttributes = (
  attributes: RecursivePartial<AseloServiceConfigurationAttributes> = {},
) => setConfigurationAttributes({}, attributes);

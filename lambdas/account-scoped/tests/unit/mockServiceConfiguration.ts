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

import axios from 'axios';
import { logDebug, logSuccess } from '../helpers/log';

const TWILIO_FLEX_CONFIGURATION_ENDPOINT = 'https://flex-api.twilio.com/v1/Configuration';

export default async function updateFlexServiceConfiguration(payload: unknown) {
  logDebug('Patching flex configuration with:', payload);
  const response = await axios.post(TWILIO_FLEX_CONFIGURATION_ENDPOINT, payload, {
    auth: {
      username: process.env.TWILIO_ACCOUNT_SID ?? '',
      password: process.env.TWILIO_AUTH_TOKEN ?? '',
    },
  });
  if (response.status === 200) {
    logSuccess('Successfully patched Flex Service Configuration');
    logDebug('Full updated Flex Service Configuration:', response.data);
  } else {
    throw new Error(
      `Error response from Flex Service Configuration POST, HTTP Status ${response.statusText} (${
        response.status
      }). Response: ${response.data === 'object' ? JSON.stringify(response.data) : response.data}`,
    );
  }
}

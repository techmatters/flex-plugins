import axios from 'axios';
import { logDebug, logInfo, logSuccess, logWarning } from '../helpers/log';

const TWILIO_FLEX_CONFIGURATION_ENDPOINT = 'https://flex-api.twilio.com/v1/Configuration';

export async function updateFlexServiceConfiguration(
  accountSid: string,
  authToken: string,
  payload: unknown,
  dryRun: boolean = false,
) {
  if (dryRun) {
    logWarning('Dry run, not updating Flex Service Configuration');
    logInfo(`Would patch flex configuration attributes for ${accountSid}`);
    logDebug('Payload attributes:', (payload as any).attributes);
    return;
  }
  logDebug('Patching flex configuration with:', payload);
  const response = await axios.post(TWILIO_FLEX_CONFIGURATION_ENDPOINT, payload, {
    auth: {
      username: accountSid,
      password: authToken,
    },
    validateStatus: () => true,
  });
  if (response.status === 200) {
    logSuccess(`[${accountSid}]`, 'Successfully patched Flex Service Configuration');
    logDebug('Full updated Flex Service Configuration:', response.data);
  } else {
    throw new Error(
      `[${accountSid}] Error response from Flex Service Configuration POST, HTTP Status ${
        response.statusText
      } (${response.status}). Response: ${
        response.data === 'object' ? JSON.stringify(response.data) : response.data
      }`,
    );
  }
}

export async function patchFeatureFlags(
  accountSid: string,
  authToken: string,
  flags: Record<string, boolean>,
  attributeUpdates: Record<string, any> = {},
  dryRun: boolean = false,
) {
  logDebug(
    'Setting the following feature flags:',
    process.env.TWILIO_ACCOUNT_SID,
    flags,
    attributeUpdates,
  );
  const response = await axios.get(TWILIO_FLEX_CONFIGURATION_ENDPOINT, {
    auth: {
      username: accountSid,
      password: authToken,
    },
    validateStatus: () => true,
  });
  if (response.status === 200) {
    logSuccess(`[${accountSid}]`, 'Successfully retrieved Flex Service Configuration');
  } else {
    if (response.status === 401) {
      logWarning(
        `Failed to authenticate for account ${process.env.TWILIO_ACCOUNT_SID}. Aborting operation for this account`,
      );
      return;
    }
    throw new Error(
      `Error response from Flex Service Configuration GET, HTTP Status ${response.statusText} (${
        response.status
      }). Response: ${response.data === 'object' ? JSON.stringify(response.data) : response.data}`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { account_sid, attributes } = response.data;
  if (dryRun) {
    logDebug(`Original flex configuration attributes for ${accountSid}:`, attributes);
  }
  await updateFlexServiceConfiguration(
    accountSid,
    authToken,
    {
      account_sid,
      attributes: {
        ...attributes,
        ...attributeUpdates,
        feature_flags: {
          ...attributes.feature_flags,
          ...(attributeUpdates?.flags ?? {}),
          ...flags,
        },
      },
    },
    dryRun,
  );
}

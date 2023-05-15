import { getSSMParameter } from '../helpers/ssm';
import { logDebug, logWarning } from '../helpers/log';

export const setEnvFromSsm = async (keyIdentifier: String): Promise<void> => {
  try {
    const result = await getSSMParameter(`/terraform/twilio-iac/${keyIdentifier}/secrets.json`);

    if (!result.Parameter?.Value) {
      logWarning('No secrets found');
      return;
    }

    const secrets = JSON.parse(result.Parameter.Value);

    if (secrets.twilio_account_sid && secrets.twilio_auth_token) {
      process.env.TWILIO_ACCOUNT_SID = secrets.twilio_account_sid;
      process.env.TWILIO_AUTH_TOKEN = secrets.twilio_auth_token;
    }
  } catch (e) {
    logDebug('ssm credential file: ', `/terraform/twilio-iac/${keyIdentifier}/secrets.json`);
    logWarning(e);
  }
};

import twilio from 'twilio';
import { saveSSMParameter } from '../helpers/ssm';
import { logDebug, logSuccess } from '../helpers/log';

export type CreateTwilioApiKeyAndSsmSecretOptions = {
  sidSmmParameterName: string;
  sidSmmParameterDescription: string;
  secretSmmParameterDescription: string;
};

export async function createTwilioApiKeyAndSsmSecret(
  twilioFriendlyName: string,
  ssmKeyName: string,
  helpline: string,
  environment: string,
  {
    sidSmmParameterName,
    sidSmmParameterDescription = `SID for Twilio API key '${twilioFriendlyName}, ${helpline} (${environment})'`,
    secretSmmParameterDescription = `Secret for Twilio API key '${twilioFriendlyName} ${helpline} (${environment})'`,
  }: Partial<CreateTwilioApiKeyAndSsmSecretOptions>,
) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const key = await client.newKeys.create({ friendlyName: twilioFriendlyName });
  logSuccess(`Twilio API Key ${twilioFriendlyName} created.`);
  const { secret } = key;
  await saveSSMParameter(ssmKeyName, secret, secretSmmParameterDescription, [
    { Key: 'Helpline', Value: helpline },
    { Key: 'Environment', Value: environment },
  ]);
  logSuccess(`SSM parameter ${ssmKeyName} saved.`);
  if (sidSmmParameterName) {
    await saveSSMParameter(sidSmmParameterName, key.sid, sidSmmParameterDescription, [
      { Key: 'Helpline', Value: helpline },
      { Key: 'Environment', Value: environment },
    ]);
    logSuccess(`SSM parameter ${sidSmmParameterName} saved.`);
  }
  logSuccess('All createTwilioApiKeyAndSsmSecret operations complete');
}

import twilio from 'twilio';
import { getSSMParameter, saveSSMParameter } from '../helpers/ssm';
import { logDebug, logInfo, logSuccess, logWarning } from '../helpers/log';

export type CreateTwilioApiKeyAndSsmSecretOptions = {
  sidSsmParameterName: string;
  sidSsmParameterDescription: string;
  secretSsmParameterDescription: string;
};

export async function createTwilioApiKeyAndSsmSecret(
  twilioFriendlyName: string,
  secretSsmParameterName: string,
  helpline: string,
  environment: string,
  {
    sidSsmParameterName,
    sidSsmParameterDescription = `SID for Twilio API key '${twilioFriendlyName}, ${helpline} (${environment})'`,
    secretSsmParameterDescription = `Secret for Twilio API key '${twilioFriendlyName} ${helpline} (${environment})'`,
  }: Partial<CreateTwilioApiKeyAndSsmSecretOptions>,
) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const ssmParametersString = (
    sidSsmParameterName ? [secretSsmParameterName, sidSsmParameterName] : secretSsmParameterName
  ).toString();

  logDebug(
    `Checking if api key '${twilioFriendlyName}' and ssm key(s) ${ssmParametersString} already exist.`,
  );
  const apiKeyAlreadyExists = !!(await client.keys.list()).find(
    (k) => k.friendlyName === twilioFriendlyName,
  );
  logWarning('secretSsmParameterName', secretSsmParameterName);
  const ssmParamForSecretAlreadyExists = !!(await getSSMParameter(secretSsmParameterName));
  logWarning('sidSsmParameterName', sidSsmParameterName);
  const ssmParamForSidAlreadyExists = !!(
    sidSsmParameterName && (await getSSMParameter(sidSsmParameterName))
  );

  if (
    apiKeyAlreadyExists &&
    ssmParamForSecretAlreadyExists &&
    (!sidSsmParameterName || ssmParamForSidAlreadyExists)
  ) {
    logInfo(
      `API key '${twilioFriendlyName}' and ssm key(s) ${ssmParametersString} already exist, skipping creation. To recreate them, delete the ${ssmParametersString} SSM keys and they and the API key will be recreated`,
    );
    return;
  }

  if (
    apiKeyAlreadyExists &&
    !ssmParamForSecretAlreadyExists &&
    (!ssmParamForSidAlreadyExists || !sidSsmParameterName)
  ) {
    logWarning(
      `API key '${twilioFriendlyName}' already exists but ssm key(s) ${ssmParametersString} do not. Recreating all 3 since the secret cannot be read from an existing key`,
    );
  }

  if (!apiKeyAlreadyExists && (ssmParamForSecretAlreadyExists || ssmParamForSidAlreadyExists)) {
    let existingKeysDescription;
    if (ssmParamForSecretAlreadyExists && ssmParamForSidAlreadyExists) {
      existingKeysDescription = `${secretSsmParameterName} and ${sidSsmParameterName}`;
    } else if (ssmParamForSecretAlreadyExists) {
      existingKeysDescription = sidSsmParameterName;
    } else {
      existingKeysDescription = secretSsmParameterName;
    }
    throw new Error(
      `API key '${twilioFriendlyName}' does not exist but ssm key(s) (${existingKeysDescription} do. Cannot continue in this inconsistent state. Delete the ${existingKeysDescription} SSM parameters and try again.`,
    );
  }

  const key = await client.newKeys.create({ friendlyName: twilioFriendlyName });
  logSuccess(`Twilio API Key ${twilioFriendlyName} created.`);
  const { secret } = key;
  await saveSSMParameter(secretSsmParameterName, secret, secretSsmParameterDescription, [
    { Key: 'Helpline', Value: helpline },
    { Key: 'Environment', Value: environment },
  ]);
  logSuccess(`SSM parameter ${secretSsmParameterName} saved.`);
  if (sidSsmParameterName) {
    await saveSSMParameter(sidSsmParameterName, key.sid, sidSsmParameterDescription, [
      { Key: 'Helpline', Value: helpline },
      { Key: 'Environment', Value: environment },
    ]);
    logSuccess(`SSM parameter ${sidSsmParameterName} saved.`);
  }
  logSuccess('All createTwilioApiKeyAndSsmSecret operations complete');
}

import twilio from 'twilio';
import { getSSMParameter, saveSSMParameter } from '../helpers/ssm';
import { logDebug, logError, logInfo, logSuccess, logWarning } from '../helpers/log';

export type CreateTwilioApiKeyAndSsmSecretOptions = {
  sidSmmParameterName: string;
  sidSmmParameterDescription: string;
  secretSmmParameterDescription: string;
};

export async function createTwilioApiKeyAndSsmSecret(
  twilioFriendlyName: string,
  secretSsmParameterName: string,
  helpline: string,
  environment: string,
  {
    sidSmmParameterName,
    sidSmmParameterDescription = `SID for Twilio API key '${twilioFriendlyName}, ${helpline} (${environment})'`,
    secretSmmParameterDescription = `Secret for Twilio API key '${twilioFriendlyName} ${helpline} (${environment})'`,
  }: Partial<CreateTwilioApiKeyAndSsmSecretOptions>,
) {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const ssmParametersString = (
    sidSmmParameterName ? [secretSsmParameterName, sidSmmParameterName] : secretSsmParameterName
  ).toString();

  logDebug(
    `Checking if api key '${twilioFriendlyName}' and ssm key(s) ${ssmParametersString} already exist.`,
  );
  const apiKeyAlreadyExists = !!(await client.keys.list()).find(
    (k) => k.friendlyName === twilioFriendlyName,
  );
  const ssmParamForSecretAlreadyExists = !!(await getSSMParameter(secretSsmParameterName));
  const smmParamForSidAlreadyExists = !!(
    sidSmmParameterName && (await getSSMParameter(sidSmmParameterName))
  );

  if (
    apiKeyAlreadyExists &&
    ssmParamForSecretAlreadyExists &&
    (!sidSmmParameterName || smmParamForSidAlreadyExists)
  ) {
    logInfo(
      `API key '${twilioFriendlyName}' and ssm key(s) ${ssmParametersString} already exist, skipping creation. To recreate them, delete the ${ssmParametersString} SSM keys and they and the API key will be recreated`,
    );
    return;
  }

  if (
    apiKeyAlreadyExists &&
    !ssmParamForSecretAlreadyExists &&
    (!smmParamForSidAlreadyExists || !sidSmmParameterName)
  ) {
    logWarning(
      `API key '${twilioFriendlyName}' already exists but ssm key(s) ${ssmParametersString} do not. Recreating all 3 since the secret cannot be read from an existing key`,
    );
  }

  if (!apiKeyAlreadyExists && (ssmParamForSecretAlreadyExists || smmParamForSidAlreadyExists)) {
    let existingKeysDescription;
    if (ssmParamForSecretAlreadyExists && smmParamForSidAlreadyExists) {
      existingKeysDescription = `${secretSsmParameterName} and ${sidSmmParameterName}`;
    } else if (ssmParamForSecretAlreadyExists) {
      existingKeysDescription = sidSmmParameterName;
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
  await saveSSMParameter(secretSsmParameterName, secret, secretSmmParameterDescription, [
    { Key: 'Helpline', Value: helpline },
    { Key: 'Environment', Value: environment },
  ]);
  logSuccess(`SSM parameter ${secretSsmParameterName} saved.`);
  if (sidSmmParameterName) {
    await saveSSMParameter(sidSmmParameterName, key.sid, sidSmmParameterDescription, [
      { Key: 'Helpline', Value: helpline },
      { Key: 'Environment', Value: environment },
    ]);
    logSuccess(`SSM parameter ${sidSmmParameterName} saved.`);
  }
  logSuccess('All createTwilioApiKeyAndSsmSecret operations complete');
}

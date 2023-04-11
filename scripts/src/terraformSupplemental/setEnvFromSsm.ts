import { SSM, STS } from 'aws-sdk';
import { logWarning } from '../helpers/log';

export const setEnvFromSsm = async (keyIdentifier: String): Promise<void> => {
  const sts = new STS();

  const timestamp = new Date().getTime();
  const params = {
    RoleArn: 'arn:aws:iam::712893914485:role/tf-twilio-iac-ssm-read-only',
    RoleSessionName: `tf-supplemental-${timestamp}`,
  };

  try {
    const stsResponse = await sts.assumeRole(params).promise();

    if (!stsResponse.Credentials) {
      logWarning('No credentials found');
      return;
    }

    const ssm = new SSM({
      accessKeyId: stsResponse.Credentials.AccessKeyId,
      secretAccessKey: stsResponse.Credentials.SecretAccessKey,
      sessionToken: stsResponse.Credentials.SessionToken,
    });

    const result = await ssm
      .getParameter({
        Name: `/terraform/twilio-iac/${keyIdentifier}/secrets.json`,
        WithDecryption: true,
      })
      .promise();

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
    logWarning(e);
  }
};

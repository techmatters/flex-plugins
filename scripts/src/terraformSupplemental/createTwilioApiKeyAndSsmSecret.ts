import twilio from 'twilio';
import { config } from 'dotenv';
import { logError } from '../helpers/log';
import { saveSSMParameter } from '../helpers/ssm';

config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function main() {
  const key = await client.newKeys.create({ friendlyName: process.argv[2] });
  const { secret } = key;
  saveSSMParameter(
    process.argv[3],
    secret,
    process.argv[4] ?? `Secret for Twilio key '${process.argv[2]}'`,
    [
      { Key: 'Helpline', Value: process.argv[5] },
      { Key: 'Environment', Value: process.argv[6] },
    ],
  );
  if (process.argv[7]) {
    saveSSMParameter(
      process.argv[7],
      key.sid,
      process.argv[4] ?? `SID for Twilio API key '${process.argv[2]}'`,
      [
        { Key: 'Helpline', Value: process.argv[5] },
        { Key: 'Environment', Value: process.argv[6] },
      ],
    );
  }
}

/**
 * Script to create API keys in Twilio and save their details to AWS SSM
 * The CLI inputs are horrible right now, it is intended to be called from a terraform provisioner rather than directly, but still might make sense to make them a little nicer
 */
main().catch((err) => {
  logError('Script interrupted due to error.');
  logError(err);
  process.exitCode = 1;
});

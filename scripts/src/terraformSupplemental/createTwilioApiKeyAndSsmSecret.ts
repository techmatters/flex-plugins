import twilio from 'twilio';
import { config } from 'dotenv';
import { logError } from '../helpers/log';
import { saveSSMParameter } from '../helpers/ssm';

config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function main() {
  const key = await client.newKeys.create({ friendlyName: process.argv[1] });
  const { secret } = key;
  saveSSMParameter(
    process.argv[2],
    secret,
    process.argv[3] ?? `Secret for Twilio key '${process.argv[1]}'`,
    [
      { Key: 'Helpline', Value: process.argv[4] },
      { Key: 'Environment', Value: process.argv[5] },
    ],
  );
  if (process.argv[6]) {
    saveSSMParameter(
      process.argv[6],
      key.sid,
      process.argv[3] ?? `SID for Twilio API key '${process.argv[1]}'`,
      [
        { Key: 'Helpline', Value: process.argv[4] },
        { Key: 'Environment', Value: process.argv[5] },
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

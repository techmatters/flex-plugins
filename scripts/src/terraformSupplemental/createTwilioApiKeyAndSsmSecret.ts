import twilio from 'twilio';
import { logError } from '../helpers/log';
import { saveSSMParameter } from '../helpers/ssm';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function main() {
  const key = await client.newKeys.create({ friendlyName: process.argv[1] });
  const { secret } = key;
  saveSSMParameter(process.argv[2], secret, process.argv[3] ?? `Secret for key ${key.sid}`, [
    { Key: 'Helpline', Value: process.argv[4] },
    { Key: 'Environment', Value: process.argv[5] },
  ]);
  if (process.argv[6]) {
    saveSSMParameter(process.argv[6], key.sid, process.argv[3] ?? `SID for key ${key.sid}`, [
      { Key: 'Helpline', Value: process.argv[4] },
      { Key: 'Environment', Value: process.argv[5] },
    ]);
  }
}

main().catch((err) => {
  logError('Script interrupted due to error.');
  logError(err);
  process.exitCode = 1;
});

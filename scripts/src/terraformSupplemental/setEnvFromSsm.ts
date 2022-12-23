import { SSM } from 'aws-sdk';

export const setEnvFromSsm = async (accountDirectory: String): Promise<void> => {
    const ssm = new SSM();

    try {
        const result = await ssm.getParameter({
            Name: `/terraform/twilio-iac/${accountDirectory}/secrets.json`,
            WithDecryption: true,
        }).promise();

        if (!result.Parameter?.Value) {
            console.error('No secrets found');
            return;
        }

        const secrets = JSON.parse(result.Parameter.Value);

        if (secrets.twilio_account_sid && secrets.twilio_auth_token) {
            process.env.TWILIO_ACCOUNT_SID = secrets.twilio_account_sid;
            process.env.TWILIO_AUTH_TOKEN = secrets.twilio_auth_token;
        }
    } catch (e) {
        console.error(e);
        return;
    }
}
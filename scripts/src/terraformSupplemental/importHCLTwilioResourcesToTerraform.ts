import FS from 'fs';
import twilio from 'twilio';
import { logError } from '../helpers/log';
import { attemptTerraformImport } from './twilioToTerraformImporter';
import { fieldTypeValue } from './hclRegexPatterns';

const hclFile = '../twilio-iac/aselo-terraform/chatbots.tf';
const modulePrefix = '';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function processHCLFile(): Promise<void> {
  const chatbotHCL = FS.readFileSync('../twilio-iac/aselo-terraform/chatbots.tf', {
    encoding: 'utf-8',
  }).toString();

  type HCLMatches = {
    resourceName: string;
    assistantSid: string;
    fieldTypeSid: string;
  };

  const matches = chatbotHCL.matchAll(fieldTypeValue);
  if (!matches) {
    throw new Error(`Regex failed to parse any resources from ${hclFile}`);
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
      if (match.groups) {
        const fieldTypeValueHCL = <HCLMatches>match.groups;
        const resource = fieldTypeValueHCL.resourceName;
        // eslint-disable-next-line no-await-in-loop
        const assistant = await client.autopilot.assistants(fieldTypeValueHCL.assistantSid);
        // eslint-disable-next-line no-await-in-loop
        const assistantSid = await assistant.fetch();
        // eslint-disable-next-line no-await-in-loop
        const fieldTypeSid = await assistant.fieldTypes(fieldTypeValueHCL.fieldTypeSid).fetch();

        attemptTerraformImport(`${assistantSid}/${fieldTypeSid}`, `${modulePrefix}${resource}`);
      }
    }
  }
}

processHCLFile().catch((err) => {
  logError(err);
});

import FS from 'fs';
import twilio from 'twilio';
import { logError } from '../helpers/log';
import { attemptTerraformImport } from './twilioToTerraformImporter';
import { fieldType, fieldTypeValue } from './hclRegexPatterns';
import { findFieldTypeSids, findFieldValueSids } from './resourceSidLocators/chatbotSidLocators';

const account = 'aselo-terraform';
const hclFile = '../twilio-iac/aselo-terraform/chatbots.tf';
const modulePrefix = '';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

enum ResourceType {
  AssistantFieldValue = 'twilio_autopilot_assistants_field_types_field_values_v1',
  AssistantFieldType = 'twilio_autopilot_assistants_field_values_v1',
}

export type FieldValueParser = {
  pattern: RegExp;
  findResourceSids: (client: twilio.Twilio, captures: Record<string, string>) => Promise<string[]>;
};

const registry: Record<ResourceType, FieldValueParser> = {
  [ResourceType.AssistantFieldValue]: {
    pattern: fieldTypeValue,
    findResourceSids: findFieldValueSids,
  },
  [ResourceType.AssistantFieldType]: {
    pattern: fieldType,
    findResourceSids: findFieldTypeSids,
  },
};

async function processResourceTypeInHCLFile(resourceType: ResourceType): Promise<void> {
  const hcl = FS.readFileSync(`../twilio-iac/${account}/chatbots.tf`, {
    encoding: 'utf-8',
  }).toString();
  const { pattern, findResourceSids } = registry[resourceType];
  const matches = hcl.matchAll(pattern);
  if (!matches) {
    throw new Error(`Regex failed to parse any resources from ${hclFile}`);
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
      if (match.groups) {
        const captures = match.groups;
        const resource = captures.resourceName;

        // eslint-disable-next-line no-await-in-loop
        const resourceSids = await findResourceSids(client, captures);

        resourceSids.forEach((sid) =>
          attemptTerraformImport(sid, `${modulePrefix}${resource}`, account),
        );
      }
    }
  }
}

processResourceTypeInHCLFile(ResourceType.AssistantFieldValue).catch((err) => {
  logError(err);
});

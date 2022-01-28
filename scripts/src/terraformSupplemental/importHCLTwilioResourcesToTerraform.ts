import FS from 'fs';
import twilio from 'twilio';
import { attemptTerraformImport } from './twilioToTerraformImporter';
import { logSuccess, logWarning } from '../helpers/log';
import { FieldValueParser, ResourceType } from './resourceParsers';
import { assistant, fieldType, fieldTypeValue } from './hclRegexPatterns';
import {
  findAssistantSids,
  findFieldTypeSids,
  findFieldValueSids,
} from './resourceSidLocators/chatbotSidLocators';

const knownResourceSids: Record<string, string> = {};

export const registry: Record<ResourceType, FieldValueParser> = {
  [ResourceType.Assistant]: {
    pattern: assistant,
    findResourceSids: findAssistantSids,
  },
  [ResourceType.AssistantFieldType]: {
    pattern: fieldType,
    findResourceSids: findFieldTypeSids,
  },
  [ResourceType.AssistantFieldValue]: {
    pattern: fieldTypeValue,
    findResourceSids: findFieldValueSids,
  },
};

function formatFullyQualifiedTerraformResource(
  resourceType: string,
  resourceName: string,
  resourceKey: string | number | undefined,
): string {
  const withoutKey = `${resourceType}.${resourceName}`;

  switch (typeof resourceKey) {
    case 'number':
      return `${withoutKey}[${resourceKey}]`;
    case 'string':
      return `${withoutKey}["${resourceKey}"]`;
    default:
      return withoutKey;
  }
}

async function processResourceTypeInHCLFile(
  client: twilio.Twilio,
  resourceType: ResourceType,
  account: string,
  hcl: string,
  dryRun: boolean,
  tfvarsFile?: string,
): Promise<void> {
  const { pattern, findResourceSids } = registry[resourceType];
  const matches = hcl.matchAll(pattern);
  if (!matches) {
    logWarning(`Regex failed to parse any resources of '${resourceType}'`);
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (const match of matches) {
      if (match.groups) {
        const captures = match.groups;
        const resource = captures.resourceName;

        // eslint-disable-next-line no-await-in-loop
        const resourceIds = await findResourceSids(client, knownResourceSids, captures);

        resourceIds.forEach(({ sid, terraformId, knownSidKey }) => {
          const fqResourceName = formatFullyQualifiedTerraformResource(
            resourceType,
            resource,
            knownSidKey,
          );
          knownResourceSids[fqResourceName] = sid;
          attemptTerraformImport(terraformId, fqResourceName, account, { dryRun, tfvarsFile });
        });
      }
    }
  }
}

export type ImportResourcesOptions = {
  dryRun: boolean;
  resourceTypes: ResourceType[];
  tfvarsFile: string;
};

export default async function importResources(
  accountDirectory: string,
  tfFilePath: string,
  {
    resourceTypes = <ResourceType[]>Object.keys(registry),
    dryRun = false,
    tfvarsFile,
  }: Partial<ImportResourcesOptions>,
): Promise<void> {
  const tfFullFilePath = `../twilio-iac/${tfFilePath}`;
  logSuccess(`Loading from: ${tfFullFilePath}`);
  const hcl = FS.readFileSync(tfFullFilePath, {
    encoding: 'utf-8',
  }).toString();
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  logSuccess(`Processing these types in this order: ${resourceTypes}`);
  // eslint-disable-next-line no-restricted-syntax
  for (const resourceType of resourceTypes) {
    // eslint-disable-next-line no-await-in-loop
    await processResourceTypeInHCLFile(
      client,
      resourceType,
      accountDirectory,
      hcl,
      dryRun,
      tfvarsFile,
    );
  }
}

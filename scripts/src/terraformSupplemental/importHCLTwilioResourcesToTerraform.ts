import FS from 'fs';
import twilio from 'twilio';
import { attemptTerraformImport } from './twilioToTerraformImporter';
import { logDebug, logInfo, logWarning } from '../helpers/log';
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
  modulePrefix: string,
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
        logDebug(`Processing '${captures.resourceName}' (type: '${resourceType}')`);

        // eslint-disable-next-line no-await-in-loop
        const resourceIds = await findResourceSids(client, knownResourceSids, captures);

        resourceIds.forEach(({ sid, terraformId, knownSidKey }) => {
          const fqResourceName = formatFullyQualifiedTerraformResource(
            resourceType,
            resource,
            knownSidKey,
          );
          knownResourceSids[`${fqResourceName}.sid`] = sid;
          attemptTerraformImport(terraformId, `${modulePrefix}${fqResourceName}`, account, {
            dryRun,
            tfvarsFile,
          });
        });
      }
    }
  }
}

export type ImportResourcesOptions = {
  dryRun: boolean;
  resourceTypes: ResourceType[];
  tfvarsFile: string;
  sids: [name: string, value: string][];
  modulePath: string[];
};

export default async function importResources(
  accountDirectory: string,
  tfFilePath: string,
  {
    resourceTypes = <ResourceType[]>Object.keys(registry),
    dryRun = false,
    tfvarsFile,
    sids,
    modulePath = [],
  }: Partial<ImportResourcesOptions>,
): Promise<void> {
  if (dryRun) {
    logInfo('================== DRY RUN ==================');
    logInfo('No imports will be performed, command outputs are what would have been run.');
  }

  const tfFullFilePath = `../twilio-iac/${tfFilePath}`;
  logDebug(`Loading from: ${tfFullFilePath}`);
  const hcl = FS.readFileSync(tfFullFilePath, {
    encoding: 'utf-8',
  }).toString();

  logDebug('Prepopulating sids:', sids);
  Object.assign(knownResourceSids, Object.fromEntries(sids ?? []));
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const modulePrefix = `${modulePath.length ? 'module.' : ''}${modulePath?.join('.module.')}${
    modulePath.length ? '.' : ''
  }`;
  logDebug(`Prefixing imports with this module path: ${modulePrefix}`);
  logDebug(`Processing these types in this order: ${resourceTypes}`);
  // eslint-disable-next-line no-restricted-syntax
  for (const resourceType of resourceTypes) {
    // eslint-disable-next-line no-await-in-loop
    await processResourceTypeInHCLFile(
      client,
      resourceType,
      accountDirectory,
      hcl,
      dryRun,
      modulePrefix,
      tfvarsFile,
    );
  }
}

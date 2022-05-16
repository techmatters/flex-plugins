import yargs from 'yargs';
import { config } from 'dotenv';
import importResources from './importHCLTwilioResourcesToTerraform';
import { ResourceType } from './resourceParsers';
import { importDefaultResources } from './importDefaultTwilioResourcesToTerraform';
import {
  createTwilioApiKeyAndSsmSecret,
  CreateTwilioApiKeyAndSsmSecretOptions,
} from './createTwilioApiKeyAndSsmSecret';
import updateFlexServiceConfiguration from './updateFlexServiceConfiguration';

config();

async function main() {
  yargs(process.argv.slice(2))
    .option('d', {
      type: 'boolean',
      default: false,
      alias: 'dryRun',
      global: true,
      describe:
        'Do a dry run, it will log the terraform import commands it would have otherwise run to stdout instead for you to review / copy & run manually',
    })
    .option('v', {
      type: 'string',
      alias: 'varFile',
      global: true,
      describe: 'Specify a tfvars file relative to the account directory',
    })
    .command(
      'import-tf <accountDirectory>  <tfFilePath>',
      "Import the current state of all the resources specified in the provided .tf file from a Twilio Account into the provided terraform configuration's state. Requires Twilio account environment variable to be set, and AWS account variables to be set for anything other than a dry run.",
      (argv) => {
        argv.positional('accountDirectory', {
          describe:
            'The directory of the main.tf file for the target account, relative to the twilio-iac directory',
          type: 'string',
        });
        argv.positional('tfFilePath', {
          describe:
            'The path of the *.tf file with defines the resources you want to import, relative to the twilio-iac directory',
          type: 'string',
        });
        argv.option('t', {
          type: 'array',
          alias: 'type',
          describe:
            "Specify a resource type to scan for by its Terraform name, e.g. 'twilio_autopilot_assistants_field_types_v1'. Can be specified multiple times. Omitting this will scan for all supported resource types.",
        });
        argv.option('d', {
          type: 'boolean',
          alias: 'dryRun',
          describe:
            'Do a dry run, it will log the terraform import commands it would have otherwise run to stdout instead for you to review / copy & run manually',
        });
        argv.option('v', {
          type: 'string',
          alias: 'varFile',
          describe: 'Specify a tfvars file relative to the account directory',
        });
        argv.option('s', {
          type: 'array',
          alias: 'sid',
          describe:
            'Specify an sid referenced in the tf file which would otherwise come from an external source, e.g. a variable: --sid var.sid=1234 or the sid of a resource defined in another file in the same module: --sid twilio_taskrouter_workspaces_v1.from_other_tf_file.sid=4321',
        });
        argv.option('m', {
          type: 'string',
          alias: 'modulePath',
          describe:
            'Specify a dot separated path for the module, e.g. top_module1.sub_module2. Omit this if the .tf file is in the root module for this configuration',
        });
      },
      async (argv) => {
        const sidKvps = argv.sid as string[];
        const sids = sidKvps.map((kvp) => {
          const [name, ...valueBits] = kvp.split('=');
          return <[string, string]>[name, valueBits.join('=')];
        });

        const modulePath = ((argv.modulePath as string) ?? '').split('.');
        if (argv.type && (argv.type as string[]).length > 0) {
          const types = argv.type as string[];
          const unrecognisedTypes = types.filter((t) =>
            Object.values(ResourceType).includes(t as ResourceType),
          );
          if (unrecognisedTypes.length) {
            throw new Error(
              `The following specified resource types are not supported by this import tool: ${unrecognisedTypes}`,
            );
          } else {
            await importResources(argv.accountDirectory as string, argv.tfFilePath as string, {
              tfvarsFile: argv.varFile as string,
              dryRun: argv.dryRun as boolean,
              sids,
              modulePath,
              resourceTypes: types as ResourceType[],
            });
          }
        } else {
          await importResources(argv.accountDirectory as string, argv.tfFilePath as string, {
            tfvarsFile: argv.varFile as string,
            dryRun: argv.dryRun as boolean,
            modulePath,
            sids,
          });
        }
      },
    )
    .command(
      'import-account-defaults <accountDirectory>',
      "Import the current state of all the resources specified in the provided .tf file from a Twilio Account into the provided terraform configuration's state. Requires Twilio account environment variable to be set, and AWS account variables to be set for anything other than a dry run.",
      (argv) => {
        argv.positional('accountDirectory', {
          describe:
            'The directory of the main.tf file for the target account, relative to the twilio-iac directory',
          type: 'string',
        });
      },
      async (argv) => {
        await importDefaultResources(
          argv.accountDirectory as string,
          argv.varFile as string,
          argv.dryRun as boolean,
        );
      },
    )
    .command(
      'new-key-with-ssm-secret <twilioFriendlyName> <ssmSecretName> <helpline> <environment>',
      'Create a twilio API key and a AWS SSM parameter to hold the secret. Requires Twilio creds and AWS creds & region to be set up with standard account variables.',
      (argv) => {
        argv.positional('twilioFriendlyName', {
          describe: "The 'friendly name' for the API Key used in twilio",
          type: 'string',
        });
        argv.positional('ssmSecretName', {
          describe: 'The name for the SSM parameter used to hold the API secret in AWS',
          type: 'string',
        });
        argv.positional('helpline', {
          describe: 'Name of the helpline the api key is for, used as a tag in the SSM parameters',
          type: 'string',
        });
        argv.positional('environment', {
          describe:
            "Name of the environment the api key is for (i.e. 'Production' or 'Staging'), used as a tag in the SSM parameters",
          type: 'string',
        });
        argv.option('sd', {
          alias: 'ssmSecretDescription',
          describe:
            "Set a custom description for the secret's SSM parameter - 'Secret for Twilio Key *twilioFriendlyName*' is used if not set",
          type: 'string',
        });
        argv.option('an', {
          alias: 'ssmApiKeySidName',
          describe:
            'If the API Key SID needs storing as a SSM parameter alongside the secret, set the name to use with this parameter. No SSM key will be created for the API Key if this is not set',
          type: 'string',
        });
        argv.option('ad', {
          alias: 'ssmApiKeySidDescription',
          describe:
            'If the API Key SID needs storing as a SSM parameter alongside the secret, this option can be used to provide a description. Has no effect if ssmAPiKeyName is not set.',
          type: 'string',
        });
      },
      async (argv) => {
        await createTwilioApiKeyAndSsmSecret(
          argv.twilioFriendlyName as string,
          argv.ssmSecretName as string,
          argv.helpline as string,
          argv.environment as string,
          {
            sidSmmParameterDescription: argv.ssmApiKeySidDescription,
            sidSmmParameterName: argv.ssmApiKeySidName,
            secretSmmParameterDescription: argv.ssmSecretDescription,
          } as Partial<CreateTwilioApiKeyAndSsmSecretOptions>,
        );
      },
    )
    .command(
      'update-flex-configuration',
      'Make a POST call to the flex service configuration to update it. Rewquires Twilio creds to be set up on standard env vars, payload can be passed either as an argument or using the TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD environment variable',
      (argv) => {
        argv.option('p', {
          alias: 'payload',
          describe:
            'Can be used to specify the JSON payload that will be used to patch the flex service configuration for this account. Required if the TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD is not set and will override it if it is.',
          type: 'string',
        });
      },
      async (argv) => {
        const jsonPayload = argv.payload ?? process.env.TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD;
        if (typeof jsonPayload !== 'string') {
          throw new Error(
            'Flex Service configuration payload must be set either via the --payload argument or the TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD environment variable.',
          );
        }
        await updateFlexServiceConfiguration(JSON.parse(jsonPayload));
      },
    )
    .demandCommand()
    .help()
    .parse();
}

main().catch((err) => {
  throw err;
});

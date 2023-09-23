import yargs from 'yargs';
import { config } from 'dotenv';

import { checkArgv } from './checkArgv';
import { importDefaultResources } from './importDefaultTwilioResourcesToTerraform';
import {
  createTwilioApiKeyAndSsmSecret,
  CreateTwilioApiKeyAndSsmSecretOptions,
} from './createTwilioApiKeyAndSsmSecret';
import {
  patchFeatureFlags,
  updateFlexServiceConfiguration,
} from './updateFlexServiceConfiguration';
import { handleTerraformArgs } from './handleTerraformArgs';
import { handleSsmRoleArg } from './handleSsmRoleArg';
import { setEnvFromSsm } from './setEnvFromSsm';
import {
  forShortCodes,
  runAgainstAllAccountsForEnvironment,
  Strategy,
} from './runAgainstAllAccountsForEnvironment';

config();

async function main() {
  yargs(process.argv.slice(2))
    .check(checkArgv)
    .middleware(handleTerraformArgs)
    .middleware(handleSsmRoleArg)
    .option('helplineDirectory', {
      type: 'string',
      default: null,
      global: true,
      describe:
        'The directory of the main.tf file for the target account, relative to the twilio-iac directory - only used for terraform based commands',
    })
    .option('d', {
      type: 'boolean',
      default: false,
      alias: 'dryRun',
      global: true,
      describe:
        'Do a dry run, it will log the terraform import commands it would have otherwise run to stdout instead for you to review / copy & run manually',
    })
    .option('helplineShortCode', {
      type: 'string',
      default: null,
      global: true,
      describe:
        'Terragrunt Helpline short code - will use terragrunt instead of terraform, e.g. "as", "in", "ct"',
    })
    .option('ssmRole', {
      type: 'string',
      default: null,
      global: true,
      describe: 'The role to assume for SSM access',
    })
    .option('helplineEnvironment', {
      type: 'string',
      default: null,
      global: true,
      describe:
        'Terragrunt Helpline environment - will use terragrunt instead of terraform, e.g. "dev", "staging", "prod"',
    })
    .option('stage', {
      type: 'string',
      default: null,
      global: true,
      describe:
        'Terragrunt stage - will use terragrunt instead of terraform, e.g. "provision", "chatbot", "configure"',
    })
    .option('v', {
      type: 'string',
      alias: 'varFile',
      global: true,
      describe: 'Specify a tfvars file relative to the account directory',
    })
    .command(
      'import-account-defaults',
      "Import the current state of all the resources specified in the provided .tf file from a Twilio Account into the provided terraform configuration's state. Requires Twilio account environment variable to be set, and AWS account variables to be set for anything other than a dry run.",
      (argv) => {
        argv.option('requireTerraform', {
          type: 'boolean',
          default: true,
          hidden: true,
        });
      },
      async (argv) => {
        const account = argv.stage
          ? `${argv.helplineShortCode}-${argv.helplineEnvironment}-${argv.stage}`
          : (argv.accountDirectory as string);
        await importDefaultResources(account);
      },
    )
    .command(
      'new-key-with-ssm-secret <twilioFriendlyName> <ssmSecretName> <helpline> <environment>',
      'Create a twilio API key and a AWS SSM parameter to hold the secret. Requires Twilio creds and AWS creds & region to be set up with standard account variables. Or the accountDirectory for SSM param based twilio creds',
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
        let helplineDirectory: string;
        if (argv.helplineDirectory) {
          helplineDirectory = argv.helplineDirectory as string;
        } else if (argv.helplineShortCode && argv.helplineEnvironment) {
          helplineDirectory = `${argv.helplineEnvironment}/${argv.helplineShortCode}`;
        } else {
          throw new Error(
            'Either helplineDirectory or both helplineShortCode and helplineEnvironment must be provided',
          );
        }
        await setEnvFromSsm(helplineDirectory);
        await createTwilioApiKeyAndSsmSecret(
          argv.twilioFriendlyName as string,
          argv.ssmSecretName as string,
          argv.helpline as string,
          argv.environment as string,
          {
            sidSsmParameterDescription: argv.ssmApiKeySidDescription,
            sidSsmParameterName: argv.ssmApiKeySidName,
            secretSsmParameterDescription: argv.ssmSecretDescription,
          } as Partial<CreateTwilioApiKeyAndSsmSecretOptions>,
        );
      },
    )
    .command(
      'update-flex-configuration',
      'Make a POST call to the flex service configuration to update it. Requires Twilio creds to be set up on standard env vars or the accountDirectory for SSM params, payload can be passed either as an argument or using the TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD environment variable',
      (argv) => {
        argv.option('p', {
          alias: 'payload',
          describe:
            'Can be used to specify the JSON payload that will be used to patch the flex service configuration for this account. Required if the TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD is not set and will override it if it is.',
          type: 'string',
        });
        argv.option('requireTerraform', {
          type: 'boolean',
          default: true,
          hidden: true,
        });
      },
      async (argv) => {
        const jsonPayload = argv.payload ?? process.env.TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD;
        if (typeof jsonPayload !== 'string') {
          throw new Error(
            'Flex Service configuration payload must be set either via the --payload argument or the TWILIO_FLEX_SERVICE_CONFIGURATION_PAYLOAD environment variable.',
          );
        }
        await updateFlexServiceConfiguration(
          process.env.TWILIO_ACCOUNT_SID!,
          process.env.TWILIO_AUTH_TOKEN!,
          JSON.parse(jsonPayload),
        );
      },
    )
    .command(
      'patch-feature-flags',
      "GETs the current service configuration, updates the feature flags specified in the arguments (adding those that didn't exist previously)",
      (argv) => {
        argv.option('f', {
          alias: 'flag',
          describe:
            'Used to set the feature flags you want. The value must take the form {flag_name}:{flag_set}, e.g. -f my_flag:true. Can be specified multiple times',
          type: 'array',
        });
      },
      async (argv) => {
        const flagArgs = argv.flag;
        if (!Array.isArray(flagArgs) || flagArgs.length < 1) {
          throw new Error(
            "Flex Service flags must be set using the -f / --flag argument in the form '-f {flag_name}:{flag_set}', e.g. -f my_flag:true",
          );
        }
        const flagMap: Record<string, boolean> = Object.fromEntries(
          flagArgs.map((fa) => {
            const [flag, textSetting] = fa.split(':');
            return [flag, textSetting.toLowerCase() === 'true'];
          }),
        );
        if (argv.helplineEnvironment) {
          await runAgainstAllAccountsForEnvironment(
            argv.helplineEnvironment,
            async (twilioAccountSid, twilioAuthToken) => {
              await patchFeatureFlags(twilioAccountSid, twilioAuthToken, flagMap);
            },
            Strategy.CONCURRENT,
            argv.helplineShortCode ? forShortCodes(argv.helplineShortCode) : () => true,
          );
        } else {
          // Assumes the environment variables for a Twilio account are set
          await patchFeatureFlags(
            process.env.TWILIO_ACCOUNT_SID!,
            process.env.TWILIO_AUTH_TOKEN!,
            flagMap,
          );
        }
      },
    )
    .demandCommand()
    .help()
    .parse();
}

main().catch((err) => {
  throw err;
});

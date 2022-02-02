import yargs from 'yargs';
import importResources from './importHCLTwilioResourcesToTerraform';
import { ResourceType } from './resourceParsers';

async function main() {
  yargs(process.argv.slice(2))
    .command(
      'import-tf <accountDirectory>  <tfFilePath>',
      "Import the current state of all the resources specified in the provided .tf file from a Twilio Account into the provided terraform configuration's state. Requires Twilio account environment variable to ber set, and AWS account variables to be set for anything other than a dry run.",
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
            'Specify an sid referenced in the tf file which would otherwise come from an external source, e.g. --sid var.sid=1234 or --sid twilio_taskrouter_workspaces_v1.from_other_tf_file.sid=4321',
        });
        argv.option('m', {
          type: 'string',
          alias: 'modulePath',
          describe: 'Specify a dot separated path for the module, e.g. top_module1.sub_module2',
        });
      },
      async (argv) => {
        const sidKvps = argv.sid as string[];
        const sids = sidKvps.map((kvp) => {
          const [name, ...valueBits] = kvp.split('=');
          return <[string, string]>[name, valueBits.join('=')];
        });

        const modulePath = (argv.modulePath as string ?? '').split('.');
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
    .demandCommand()
    .help()
    .parse();
}

main().catch((err) => {
  throw err;
});

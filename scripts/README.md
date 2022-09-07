# Scripts

## Scripts index
- [generateDeploymentFiles](#generateDeploymentFiles)
- [copyFlow](#copyFlow)
- [generateNewHelplineFormDefinitions](#generateNewHelplineFormDefinitions)
- [twilioResources](#twilioResources)
  - [import-account-defaults](#import-account-defaults)
  - [import-tf](#import-tf)
  - [generate-chatbot-tf](#generate-chatbot-tf)
  - [patch-feature-flags](#patch-feature-flags)

## generateDeploymentFiles
This script generates deployment files for `flex-plugins` and `serverless` repos.
These files file be generated at the root folder:
- `new-flex-plugins-workflow.yml`
- `new-serverless-workflow.yml`

If the template files (files inside the `template/` folder) are out of sync with Aselo Development deployment workflow files, the script will abort in order to prevent generating old version of workflows (manually disable this check if you are sure that you want the template version).

To run the script:
- Create a `.env` file and fill it with the proper values (see next section).
- Install dependencies with `npm install`.
- Run `npm run generateDeploymentFiles` on the root folder.

To run this script we need to provide the following environment
| Variable               | Description |
|------------------------|-------------|
| HELPLINE               | Helpline's friendly name (e.g. South Africa Helpline) |
| SHORT_HELPLINE         | Short code for this helpline (e.g. ZA) |
| ENVIRONMENT            | Target environment, one of Development, Staging or Production |

## copyFlow
This script copies over the config of a studio flow from one account to another. Is mainly used to create Messaging Flow when setting up a new helpline, but it can be tweeked to support updating other workflows.

To run the script:
- Create a `.env` file and fill it with the proper values (see next section).
- Install dependencies with `npm install`.
- Run `npm run copyFlow` on the root folder.

To run this script we need to provide the following environment
| Variable               | Description |
|------------------------|-------------|
| TWILIO_ACCOUNT_SID_SOURCE | Twilio account sid of the account that contains the desired Studio Flow |
| TWILIO_AUTH_TOKEN_SOURCE  | Auth token of the account that contains the desired Studio Flow |
| FLOW_TO_COPY              | Studio Flow sid to be copied over |
| TWILIO_ACCOUNT_SID_DESTINATION | Twilio account sid of the account where the Flow should be copied to |
| TWILIO_AUTH_TOKEN_DESTINATION | Auth token of the account where the Flow should be copied to |


## generateNewHelplineFormDefinitions
This script will generate a new set of form definitions for a helpline with a sensible starting point of default JSON ready to be customised for a specific helpline

To run the script:
```shell
npm install
npm run generateNewHelplineFormDefinitions <helpline> [-f] [-r rootDirectory]
```

| Parameter | Description |
|-----------|-------------|
| helpline  | The helpline code, normally a 2 letter code, a dash and then the version prefixed by a 'v', e.g. `za-v1`. This is the name of the directory that will be created to put all the generated definitions under. |
| -r, --root | Root directory. If omitted it will put them in `[REPO ROOT]/hrm-form-definitions/form-definitions`, which is where they need to go to be used in the plugin. If you need to generate them elsewhere, for testing for example, specifiy a relative or absolute local path using this option |
| -f, --force | By default, if the script detects the helpline directory it's about to create already exists, it will warn you and ask permission to continue (because any files with the same name will be overwritten if you proceed). Specifying this option supresses that prompt and overwrites automatically, use with care! |

## twilioResources
A collection of commands to assist managing twilio resources in Terraform - primarily to assist in ensuring that the Terraform tfstate reflects the real state of the Twilio resources on the account.

Each command has --help docs for specific information about how to use each parameter, the descriptions here provide a more general context & describe typical use cases.

### import-account-defaults

Takes a hardcoded set of resources that normally get created by default when a new Twilio account is created, checks to see if they exist on the target account, and imports them if they are.

It is a required step prior to running `terraform apply` on a brand new account, because otherwise terraform will encounter a resources from its configuration that is not in the `tfstate` but does exist on the account (because we reuse these default resources in our Aselo configuration), which upsets Terraform. 
This script will line up the tfstate of a fresh account with the reality, allowing the first terraform apply to run correctly.

Using this script as part of setting up a new account is described in /twilio-iac/README.md

### import-tf

Takes a single *.tf Terraform configuration file and scans the resources defined in there. It will then search for those resources in the Twilio account you provide credentials for and if it finds them, imports them into the `tfstate` for this configuration.

Its use cases are those which involve trying to import large amounts of resources that are defined in configuration, already exist on the account, but aren't in the `tfstate`. 
Importing existing, non-terraform managed accounts into Terraform is one use case, but also importing significant additions made to staging accounts outside Terraform would be another (I used it to import the SafeSpot 'which district?' autopilot question, which would have been time-consuming otherwise).
In both of these use cases, the Terraform resources would need to have been configured in the `*.tf` files prior to using this command to update the state, naturally.

*Note:* You STILL need to pass any SIDs that come from variables in using an `--sid` parameter, even if they are defined in the `tfvars` file you pass in with `-v`or as a `TF_VARS_*` environment variable. 
The script doesn't scan provided terraform variables automatically for its own use, it just passes the `*.tfvars` file you specify down to the `terraform import` command. It could be enhanced to do this if needed, but doesn't right now.

#### Example

`npm run twilioResources -- import-tf a-helpline-staging ./terraform-modules/chatbots/terraform-modules/pre-survey-task/safespot/main.tf --sid var.bot_sid=UAxxx -m chatbots.custom_pre_survey_task[0] -v private.tfvars`

The above command was used in the following scenario:

The helpline required a specific chatbot custom behaviour. That behaviour was already created for the staging environment in Twilio console, and already defined in the helpline's staging environment.
It was not, however, imported into the Terraform state for this account. The above command was used to autopopulate the state based on the information in the tf file, and queried from the Twilio API for the account

The following environment variables needed to be present before running the script:

`AWS_ACCESS_KEY_ID` 
`AWS_SECRET_ACCESS_KEY`
`TWILIO_ACCOUNT_SID`
`TWILIO_AUTH_TOKEN`

_(these would typically be set anyway if you are running Aselo's Twilio terraform scripts)_

Parameters:

-------------------------------------------------
| Parameter                | Meaning            |
|--------------------------|--------------------|
| `a-helpline-staging` | The directory, located under `/twilio-iac/` where the helpline's configuration is located |
| `./terraform-modules/chatbots/terraform-modules/pre-survey-task/a-helpline/main.tf` | The *.tf file we are basing our imports on, relative to `/twilio-iac/`, not the CWD. |
| `--sid var.bot_sid=UAxxx` | The `--sid` parameter is a way of providing external variables required by the module. In this case, the `pre-survey-task` modules take a variable called `bot_sid` (`./terraform-modules/chatbots/terraform-modules/pre-survey-task/safespot/variables.tf`). This needs to be provided in the form `var.<variable_name>=<variable.value>`. The `--sid` parameter can be repeated as often as required, e.g. `--sid var.a=b --sid var.c=d --sid var.e=f ...` |
| `-m chatbots.custom_pre_survey_task[0]` | This is the path to the module within the configuration structure of the target helpline. Note that `custom_pre_survey_task` specifies index 0. This is because the idiomatic way to conditionally include a module is via the 'count' property of a module being set to 1 or 0 based on conditional logic. This technically turns it into a list of modules with a single element, rather than a single module. As such any modules included conditionally will need the `[0]` qualifier |
| `-v private.tfvars` | This specifies a tfvars file relative to the configuration directory specified in the first parameter (so this means `/twilio-iac/a-helpline/private.tfvars`). This is currently ONLY used to pass into the `terraform import` commands the script initiates, it is NOT a substitrute for `--sid` parameters. If a variable is used in the .tf file, it still needs an `--sid` parameter to specify if whether it is present in the tfvars file specified here or not |

#### --dryRun / -d

This flag can be used to test the automatic import logic generated by this script. It will output the `terraform import ...` commands to stdout rather than ruinning them

From here you can either C&P the commands and run them manually, or rerun the script without this parameter if all looks good with the grenerated commands

### generate-chatbot-tf

Given an already existing chatbot assistant, living in a Twilio account, will generate the `.tf` file that represents that definition.
It will create the file locally, so you need to grab it and drop it where it makes sense.

You need to have `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` environment variables set (either passed in the command itself or in a `.env` file).
You also must provide the following parameters to the script: 
  - `assistantSid`: Target chatbot's assistant sid to generate the .tf from.
  - `referenceName`: The reference name that will be used as the top level resource (the name of the assistant resource in the .tf file).
  - `serverlessUrl`: \[optional\] The serverless url of the account. If present, will replace it for the dynamic form in the .tf file.
Example: 
```
➜ npm run twilioResources -- generate-chatbot-tf --assistantSid=UAxxxxxxxxxxxx --referenceName=my_custom_bot --serverlessUrl=https://serverless-xxxx-production.twil.io
```
will create a new file `my_custom_bot.tf` that contains the definition of the bot with the sid `UAxxxxxxxxxxxx`, and will replace all the occurrences of `https://serverless-xxxx-production.twil.io` for the dynamic form we use in the terraform setup (`${var.serverless_url}`).

### patch-feature-flags

This script allows you to safely update the feature flags specified in a Twilio Account's Service Configuration without affecting other settings

You need to have `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` environment variables set (either passed in the command itself or in a `.env` file).
You also must provide the following parameters to the script:
- `-f / --flag`: Use this to specify a flag and what you wish to set it to. The value must take the form {flag_name}:{flag_set}, e.g. -f my_flag:true. Can be specified multiple times
  Example:
```
➜ npm run twilioResources patch-feature-flags -- -f enable_voice_recordings:false -f enable_transcripts:true
```
will set the `enable_voice_recordings` to false, and the `enable_transcripts` flag to true, creating them if they didn't previously exist, or overwriting their previous setting if they did.

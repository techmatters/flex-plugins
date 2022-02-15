# Scripts

## Scripts index
- [generateDeploymentFiles](#generateDeploymentFiles)
- [copyFlow](#copyFlow)

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

Takes a single *.tf Terraform configuration file and it scans the resources in there. It will then search for those resources in the Twilio account you provide credentials for and if it finds them, imports them into the `tfstate` for this configuration.

Its use cases are those which involve trying to import large amounts of resources that are defined in configuration, already exist on the account, but aren't in the `tfstate`. 
Importing existing, non-terraform managed accounts into Terraform is one use case, but also importing significant additions made to staging accounts outside Terraform would be another (I used it to import the SafeSpot 'which district?' autopilot question, which would have been time consuming otherwise).
In both of these use cases, the Terraform resources would need to have been configured in the `*.tf` files prior to using this command to update the state, naturally.

*Note:* You STILL need to pass any SIDs that come from variables in using an `--sid` parameter, even if they are defined in the `tfvars` file you pass in with `-v`or as a `TF_VARS_*` environment variable. 
The script doesn't scan provided terraform variables automatically for its own use, it just passes the `*.tfvars` file you specify down to the `terraform import` command. It could be enhanced to do this if needed, but doesn't right now.
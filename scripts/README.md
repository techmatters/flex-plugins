# Scripts

## Scripts index

- [generateNewHelplineFormDefinitions](#generateNewHelplineFormDefinitions)
- [twilioResources](#twilioResources)
  - [import-account-defaults](#import-account-defaults)
  - [patch-feature-flags](#patch-feature-flags)

## generateNewHelplineFormDefinitions

This script will generate a new set of form definitions for a helpline with a sensible starting point of default JSON ready to be customised for a specific helpline

To run the script:

```shell
npm install
npm run generateNewHelplineFormDefinitions <helpline> [-f] [-r rootDirectory]
```

| Parameter   | Description                                                                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| helpline    | The helpline code, normally a 2 letter code, a dash and then the version prefixed by a 'v', e.g. `za-v1`. This is the name of the directory that will be created to put all the generated definitions under.                                                                                                       |
| -r, --root  | Root directory. If omitted it will put them in `[REPO ROOT]/lambdas/packages/hrm-form-definitions/form-definitions`, which is where they need to go to be used in the plugin. If you need to generate them elsewhere, for testing for example, specifiy a relative or absolute local path using this option                         |
| -f, --force | By default, if the script detects the helpline directory it's about to create already exists, it will warn you and ask permission to continue (because any files with the same name will be overwritten if you proceed). Specifying this option supresses that prompt and overwrites automatically, use with care! |

## twilioResources

A collection of commands to assist managing twilio resources in Terraform - primarily to assist in ensuring that the Terraform tfstate reflects the real state of the Twilio resources on the account.

Each command has --help docs for specific information about how to use each parameter, the descriptions here provide a more general context & describe typical use cases.

### import-account-defaults

Takes a hardcoded set of resources that normally get created by default when a new Twilio account is created, checks to see if they exist on the target account, and imports them if they are.

It is a required step prior to running `terraform apply` on a brand new account, because otherwise terraform will encounter a resources from its configuration that is not in the `tfstate` but does exist on the account (because we reuse these default resources in our Aselo configuration), which upsets Terraform.
This script will line up the tfstate of a fresh account with the reality, allowing the first terraform apply to run correctly.

Using this script as part of setting up a new account is described in /twilio-iac/README.md

### patch-feature-flags

**THIS SCRIPT IS ONLY FOR USE IN DEVELOPMENT ACCOUNTS AND OTHER ACCOUNTS NOT MANAGED BY THE NEW TERRAFORM SYSTEM**

For accounts managed under the new terraform system, you should manage feature flags using the 'configuration' stage of that system.

This script allows you to safely update the feature flags specified in a Twilio Account's Service Configuration without affecting other settings

#### Providing Twilio Credentials

If you want to update feature flags for a single account and have their credentials handy, you can set them in your environment to use this tool:

You need to have `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` environment variables set (either passed in the command itself or in a `.env` file).

#### Using AWS credentials to look up accounts

If you have an AWS account with privileges to look up SSM parameters, you can set up your aws creds in the environment.

Then, to select a single account, you pass the `--helplineEnvironment` argument with either `development`, `staging` or `production` and `--helplineShortCode` with the helpline account (upper case, e.g. `AS`, `ZM`).

Alternatively you can just set the `--helplineEnvironment` and omit a `--helplineShortCode` to set the flags for all accounts in a given environment.

NB: **These parameters need to be specified ahead of the `patch-feature-flags` command, not after like the flags you want to set.**

#### Specifying the flags

Using either approach, you also must provide the following parameters to the script:

- `-f / --flag`: Use this to specify a flag and what you wish to set it to. The value must take the form {flag_name}:{flag_set}, e.g. -f my_flag:true. Can be specified multiple times

Examples:

1. Single account (Twilio credentials in environment):

```
➜ npm run twilioResources patch-feature-flags -- -f enable_voice_recordings:false -f enable_twilio_transcripts:true
```

will set the `enable_voice_recordings` to false, and the `enable_transcripts` flag to true, creating them if they didn't previously exist, or overwriting their previous setting if they did.

2. Single account (AWS credentials in environment):

```
➜ npm run twilioResources -- --helplineEnvironment development --helplineShortCode AS patch-feature-flags -f enable_voice_recordings:false -f enable_twilio_transcripts:true
```

This sets the same flags as the example above, but uses AWS to look up the Twilio credentials for the Aselo Development account. Note that the `--helplineShortCode` and the `--helplineEnvironment` arguments are passed in before the `patch-feature-flags` command, not after.


3. All accounts for environment (AWS credentials in environment):

```
➜ npm run twilioResources -- --helplineEnvironment development patch-feature-flags -f enable_voice_recordings:false -f enable_twilio_transcripts:true
```

This sets the same flags as the example above, but uses AWS to look up the Twilio credentials for all the accounts in the development environment and will set the flags for each of them.
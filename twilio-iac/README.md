# Twilio Terraform Scripts

These are scripts for provisioning some of the Aselo Twilio infrastructure.

- View docs on how to [generate matrix of the feature & config flags](Flags-Matrix.md) for all accounts

## Note

Try to keep track of the changes on the different accounts in [this spreadsheet](https://app.box.com/file/1109527438079) 🙏

## Prerequisites

### Requirements

You will need the following software installed:

- [Docker](https://docs.docker.com/get-docker/) 19.03.0+
- [Make on *nix](https://www.gnu.org/software/make/) or [MakeWin32 on Windows](http://gnuwin32.sourceforge.net/packages/make.htm) 3.81

### Environment Variables

You will require the following environment variables set in your local terminal:

* You need the following environment variables:
  - `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` set for your personal one user.
  - `GITHUB_TOKEN` - a personal access token with write access to the tech matters serverless & flex plugins repo.

You should *not* set these by running `export AWS_SECRET_ACCESS_KEY=xxx` in your terminal, as this will save the token to the bash/zsh history on your local machine in plain text. Reach out to a developer for suggestions on how to do set these tokens in a more secure way.

## Flex Service Configuration Manager

There is a system for managing the flex service_configuration via a command line tool.

See [here](./docs/service_configuration.md) for more information.

## Preparation

In order to set up the Aselo Terraform project:

* In the directory named for the account you are working on, run `make init` (you might need to run `make init tf_args=-reconfigure` if it complains)
* Run `make validate` - this should give the all clear.

## Running on a new environment

There are currently some gotchas which mean that, unfortunately, it's not a simple as running `make apply` when provisioning an environment for the first time (but hopefully should be good after that).

The process for a first run is as follows:

1. Create a new directory in `/twilio-iac/helplines` named using the helpline short code (lowercase). IE: `/twilio-iac/helplines/as`

2. Within that directory copy `common.hcl` and `<environment>.hcl` from a helpline that already exists. IE: `/twilio-iac/helplines/pl/common.hcl`, `/twilio-iac/helplines/pl/staging.hcl`

3. Update the `common.hcl` and `<environment>.hcl` files with the correct configuration for the helpline. PS: make sure that the `helpline_region` is set correctly.

> For the following steps, make sure to have the following env vars loaded in your terminal session:
> ```
> AWS_ACCESS_KEY_ID=xxx
> AWS_SECRET_ACCESS_KEY=xxx
> AWS_REGION=us-east-1
> GITHUB_TOKEN=xxx
> ```
> On MacOS/Unix you can export them or prepend those vars when running a command.
>
> Another possible way to do so (Unix) is composing a .env file like
> ```
> AWS_ACCESS_KEY_ID=xxx
> AWS_SECRET_ACCESS_KEY=xxx
> AWS_REGION=us-east-1
> GITHUB_TOKEN=xxx
> ```
> and load the content of the file in the terminal session like `➜ export $(grep -v '^#' .env | xargs)`.
>
> NOTE (!!)
>
> From now on, the above env vars are exported to this console session ~only~ (bash/powershell/whatever). Be sure you continue to use this session, or in case of opening a different one, you repeat the step to export the required variables.

5. Run `make HL=<helpline_short_code> HL_ENV=<environment> setup-new-environment` from the `/twilio-iac/stages/provision` directory.

> The first time you run this, you will need to enter the following secrets:
>
> *Twilio Account SID* - this is the account SID for the Twilio account you are working on. You can find this in the Twilio console, under the "Project Info" section.
>
> *Twilio Auth Token* - this is the auth token for the Twilio account you are working on. You can find this in the Twilio console, under the "Project Info" section.
>
> *Datadog App ID* - this is the Datadog App ID for the Datadog account you are working on. You can find this in the Datadog console, under the "API" section.
>
> *Datadog Access Token* - this is the Datadog Access Token for the Datadog account you are working on. You can find this in the Datadog console, under the "API" section.

6. Run `make HL=<helpline_short_code> HL_ENV=<environment> plan` from the `/twilio-iac/stages/provision` directory and verify that the plan looks correct. Modify the helpline configuration in `common.hcl` and `<environment>.hcl` if necessary. If the plan looks correct then run `make HL=<helpline_short_code> HL_ENV=<environment> apply` from the same directory.

7. Once the provision stage has been applied, run `make HL=<helpline_short_code> HL_ENV=<environment> apply` from the `/twilio-iac/stages/lex` and `/twilio-iac/stages/configure` directories making adjustments to the configuration as necessary.

8. Don't forget to raise a PR to merge the new configuration you created

## Importing a pre-existing environment

Not attempted this yet. If it's the same process as for the new environment, it could be difficult. A lot of the items could be imported alongside the existing ones, but not those that specify `unique_name`s. It's basically a choice between importing the existing resource (fiddly), creating new ones & then deleting old ones (not always possible) or deleting then creating (bit scary).

## Maintaining an environment already set up in Terraform

Once you have the environment created / imported, to make changes:

1. Make required changes to the terraform scripts
2. Raise a PR & get them reviewed & approved
3. Ensure the AWS, Twilio & Datadog environment variables are set correctly and you are in the right Terraform configuration directory:
4. Run:
```shell
terraform apply -var-file <helpline>-<environment>.tfvars
```

You can run `terraform plan ...` before the apply, but apply runs the plan first and prompts you to review & approve the changes anyway, so it's not necessary.

## Missing Bits

This Terraform project is currently incomplete, this is what isn't covered and needs creating with scripts or manually:

### What it should do but doesn't

* HRM process.env - not currently updated. Terraform isn't great at provisioning parts of files, refactoring this code to use SSM parameters which could be managed as terraform resources .
* Okta - doesn't set up anything in Twilio or Okta for this right now. No sign of any support for setting up single sign on in the Twilio provider, but there is an Okta provider.
* DataDog - it puts the keys you provide via tfvars in the AWS Parameter Store, but it won't provision the application in DataDog for you (but it could!).
* Default Studio Flows - it doesn't clean up the original 'Messaging Flow', because it's never under control of terraform. Could be removed with a provisioner possibly, but this might result in unexpected behaviour if somebody duplicates the terraform managed Messaging Flow to test with and then terraform goes and deletes it...
...

### What it shouldn't do

* Workflows - It won't generate new serverless & flex github workflows. The aim is to refactor these into single workflows, so in the meantime use the existing scripts in /scripts/setupNewAccount for these
* Deployments - Terraform isn't supposed to deploy, only provision, so this script will never deploy our plugin, serverless functions, the TwilioErrorReporter lambda or webchat.
* Upload Images - Seems more like deployment.

# Twilio Terraform Scripts

These are scripts for provisioning some of the Aselo Twilio infrastructure.

## Prerequisites

You will require the following installed locally:

* Terraform - https://www.terraform.io/downloads
* _You previously had to build & install the twilio-terraform-provider yourself, but they are being pushed up to the Terraform registry now: https://registry.terraform.io/providers/twilio/twilio_
* You need the following environment variables: 
  - AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY set for the script user
  - TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN set to the account you want to manage, and TF_VAR_account_sid to the same as TWILIO_ACCOUNT_SID (we need the account sid as a variable as well as a cred.)
  - TF_VAR_datadog_app_id & TF_VAR_datadog_access_token set for the RUM app that should already be created for the account
  - TF_VAR_serverless_url - once set, the production serverless environment's domain, once set, use a placeholder until then.

## Preparation

In order to set up the Aselo Terraform project:

* In the directory named for the account you are working on, run `terrafom init`
* Run `terraform validate` - this should give the all clear.

## Running on a new environment

There are currently some gotchas which mean that, unfortunately, it's not a simple as running `terraform apply` when provisioning an environment for the first time (but hopefully should be good after that).

The process for a first run is as follows:

1. Create a new directory in /twilio-iac named using the <helpline>-<environment> convention
2. Copy any .tf extension files from the 'terraform-poc-account' folder into the new folder (or if it is a production account, copy from the helpline's staging account, this will save a lot of time aligning them later)
3. In the 'backend "s3""' section modify the 'bucket' and 'dynamodb_table' to replace 'terraform-poc' with the account identifier convention we use for s3, i.e. <short_lowercase_helpline_code>.<full+_lowercase_environment_name> . For example, Aarambh Production would look like this:
```hcl
  backend "s3" {
    bucket         = "tl-terraform-state-twilio-in-production"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "twilio-terraform-in-production-locks"
    encrypt        = true
  }
```
4. Create an S3 bucket named after the one specified in the 'bucket' attribute you just set. You can copy the S3 settings from the `tl-terraform-state-twilio-terraform-poc`
5. Create a dynamo db table named after the 'dynamodb_table' attribute you just set. It needs a String partition key called `LockID` but otherwise the default settings are fine
6. Open the `variables.tf` file and update the defaults to ones appropriate to this helpline & environment
7. Run `terraform init` from your new folder (you might need to run `terraform init -reconfigure` if it complains.)
8. _Optional:_ You can create a private `.tfvars` for the sensitive variables you can't check in values for - if you name it something ending in `private.tfvars` it will be ignored by git - or you can use TF_VAR_* environment variables for these as instructed above.

For the following steps (9-13), make sure to have the following env vars loaded in your terminal session:
```shell
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
```
On MacOS/Unix you can export them or prepend those vars when running a command.
Another possible way to so (Unix) is composing a .env file like
```shell
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
```
and load the content of the file in the terminal session like `➜ export $(grep -v '^#' .env | xargs)`


9. Run the script below from flex-plugins/scrips/ folder. Twilio creates a bunch of default resources on a new account and Aselo uses some of them. We need to import them into terraform first, otherwise terraform assumes they don't exist and will try to create them, resulting in errors.
```shell
npm run twilioResources -- import-account-defaults <helpline>-<environment> [-v my-private.tfvars]]
```
10. Run and review the output of:
```shell
terraform plan [-var-file my-private.tfvars]
```
11. Run:
```shell
terraform apply [-var-file my-private.tfvars]
```
12. Go to the console for your environment, go into Functions > Services > serverless > environments and copy the domain for production (e.g. http://serverless-1234-production.twil.io) and set it as your `TF_VAR_serverless_url` environment variable.
13. Rerun
```shell
terraform apply [-var-file my-private.tfvars]
```
Unfortunately, a feature gap in the twilio terraform provider means the domain URL cannot be extracted from the resource. The easiest workaround is to put it in a variable after it has been generated initially

14. Go into Twilio Console and check if the 'redirect_function' task has the correct serverless url set. If it is not correct, update it manually in Twilio Console.
    Unfortunately due to this issue with the provider, it may not be updated as part of the second `terraform apply`: https://github.com/twilio/terraform-provider-twilio/issues/92
15. Don't forget to raise a PR to merge the new configuration you created


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

* Github Secrets - not currently added to serverless or flex (can be done though).
* HRM process.env - not currently updated. Terraform isn't great at provisioning parts of files, refactoring this code to use SSM parameters which could be managed as terraform resources .
* Okta - doesn't set up anything in Twilio or Okta for this right now. No sign of any support for setting up single sign on in the Twilio provider, but there is an Okta provider.
* DataDog - it puts the keys you provide via tfvars in the AWS Parameter Store, but it won't provision the application in DataDog for you (but it could!).
* Default Studio Flows - it doesn't clean up the original 'Messaging Flow', because it's never under control of terraform. Could be removed with a provisioner possibly, but this might result in unexpected behaviour if somebody duplicates the terraform managed Messaging Flow to test with and then terraform goes and deletes it...
* AWS Cloudwatch Alarms - now we have 'per account' alarms, they seem like a good candidate for managing in TF?
...

### What it shouldn't do

* Workflows - It won't generate new serverless & flex github workflows. The aim is to refactor these into single workflows, so in the meantime use the existing scripts in /scripts/setupNewAccount for these
* Deployments - Terraform isn't supposed to deploy, only provision, so this script will never deploy our plugin, serverless functions, the TwilioErrorReporter lambda or webchat.
* Upload Images - Seems more like deployment.

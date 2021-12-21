# Twilio Terraform Scripts

These are scripts for provisioning some of the Aselo Twilio infrastructure.

## Prerequisites

You will require the following installed locally:

* Terraform - https://www.terraform.io/downloads
* Go - https://go.dev/dl/. This is required to build the Twilio Terraform Plugin. You require version 17+ to build the plugin. Ubuntu users, do not use the version on the Debian package manager, it is too old to build the plugin, follow the instructions on the link instead
* Make - used to build the plugin (except on Windows, see next point)
* Clone, build & install the latest version of the Twilio Terraform Provider: https://www.terraform.io/downloads. Windows users - the projects `Makefile` contains bash specific commands, so will not run even if you install make, but the commands can be run manually: https://github.com/twilio/terraform-provider-twilio/blob/main/Makefile (should probably make a script).
* You need the following environment variables: 
  - AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY set for the script user
  - TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN set to the account you want to manage, and TF_VAR_account_sid to the same as TWILIO_ACCOUNT_SID (we need the account sid as a variable as well as a cred.)
  - TF_VAR_datadog_app_id & TF_VAR_datadog_access_token set for the RUM app that should already be created for the account
  - TF_VAR_serverless_url - once set, the production serverless environment's domain, once set, use a placeholder until then.

## Preparation

In order to set up the Aselo Terraform project:

* In this directory run `terrafom init`
* Run `terraform validate` - this should give the all clear.
* You will need a tfvars specific to your new environment, create one named `<helpline>-<environment>.tfvars` using `private.tfvars.example` as a guide. Leave `serverless_url` as the placeholder in the example if it's a brand new environment, or get it from the serverless environment URL for an existing one (see 'Running on a new environment') below.

## Running on a new environment

There are currently some gotchas which mean that, unfortunately, it's not a simple as running `terraform apply` when provisioning an environment for the first time (but hopefully should be good after that).

The process for a first run is as follows:

* Run the following to create a new workspace for your environment (this is required you can track state separately for each account)
```terraform new workspace <helpline>-<environment>```
*
* Run the script below. Twilio creates a bunch of default resources on a new account and Aselo uses some of them. We need to import them into terraform first, otherwise terraform assumes they don't exist and will try to create them, resulting in errors.
```
npm run importDefaultTwilioResourcesToTerraform <your tfvars file relative to /twilio-iac/aselo-terraform>
```
* Run and review the output of:
```terraform plan -var-file <helpline>-<environment>.tfvars```
 Run:
```terraform apply -var-file <helpline>-<environment>.tfvars```
* Go to the console for your environment, go into Functions > Services > serverless > environments and copy the domain for production (e.g. http://serverless-1234-production.twil.io) and set it as your `TF_VAR_serverless_url` environment variable.
* Rerun
```terraform apply -var-file <helpline>-<environment>.tfvars```

Unfortunately, a feature gap in the twilio terraform provider means the domain URL cannot be extracted from the resource. The easiest workaround is to put it in a variable after it has been generated initially

## Importing a pre-existing environment

Not attempted this yet. If it's the same process as for the new environment, it could be difficult. A lot of the items could be imported alongside the existing ones, but not those that specify `unique_name`s. It's basically a choice between importing the existing resource (fiddly), creating new ones & then deleting old ones (not always possible) or deleting then creating (bit scary).

## Maintaining an environment already set up in Terraform

Once you have the environment created / imported, to make changes:

1. Make required changes to the terraform scripts
2. Raise a PR & get them reviewed & approved
3. Ensure the AWS, Twilio & Datadog environment variables are set correctly and you are in the right Terraform workspace by running:
```shell
terraform workspace select <helpline>-<environment>
```
4. Run:
```shell
terraform apply -var-file <helpline>-<environment>.tfvars
```

You can run `terraform plan ...` before the apply, but apply runs the plan first and prompts you to review & approve the changes anyway, so it's not necessary.

## Missing Bits

This Terraform project is currently incomplete, this is what isn't covered and needs creating with scripts or manually:

### What it should do but doesn't

* Github Secrets - not currently added to serverless or flex (can be done though).
* HRM process.env - not currently updated. Terraform isn't great at provisioning parts of files.
* Service Configuration - not currently managed by the twilio provider. We can use a provisioner but currently you need still need to call the REST service manually
* API Keys - Whilst API Keys can be created using the twilio terraform provider, it's a bit useless because it provides no way of accessing the secret to record somewhere, so a key created in terraform can never be accessed as far as I can tell.
* Okta - doesn't set up anything in Twilio or Okta for this right now. No sign of any support for setting up single sign on in the Twilio provider, but there is an Okta provider.
* DataDog - it puts the keys you provide via tfvars in the AWS Parameter Store, but it won't provision the application in DataDog for you (but it could!).
* Default Studio Flows - it doesn't clean up the original 'Messaging Flow', because it's never under control of terraform. Could be removed with a provisioner possibly, but this might result in unexpected behaviour if somebody duplicates the terraform managed Messaging Flow to test with and then terraform goes and deletes it...
...

### What it shouldn't do

* Workflows - It won't generate new serverless & flex github workflows. The aim is to refactor these into single workflows, so in the meantime use the existing scripts in /scripts/setupNewAccount for these
* Deployments - Terraform isn't supposed to deploy, only provision, so this script will never deploy our plugin, serverless functions, the TwilioErrorReporter lambda or webchat.
* Upload Images - Seems more like deployment.

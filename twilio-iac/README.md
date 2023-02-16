# Twilio Terraform Scripts

These are scripts for provisioning some of the Aselo Twilio infrastructure.


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

## Preparation

In order to set up the Aselo Terraform project:

* In the directory named for the account you are working on, run `make init` (you might need to run `make init tf_args=-reconfigure` if it complains)
* Run `make validate` - this should give the all clear.

## Running on a new environment

There are currently some gotchas which mean that, unfortunately, it's not a simple as running `make apply` when provisioning an environment for the first time (but hopefully should be good after that).

The process for a first run is as follows:

1. Create a new directory in `/twilio-iac` named using the {helpline}-{environment} convention

2. Copy any `.tf` extension files from the `terraform-poc-account` folder into the new folder (or if it is a production account, copy from the helpline's staging account, this will save a lot of time aligning them later).
Important notes:
    - If you are copying over from `terraform-poc-account`, beware that in `main.tf`, under the `services` module, the flag `uses_conversation_service` is set to `false`. Remove this if you are working with a new Twilio account, as that is intended for compatibility with older setups of Flex.
    - Check under `flex` module, the poc account uses `hrm_url` to specify the target url for the Aselo backend. Remove this and rely on the naming convention to decide if it's staging or production (or specify the target one if the regular notation does not applies to this case).
    - Check under `flex` module, `permission_config` should be set to `var.permission_config` if you are describing it in the `variables.tf` file, or specify the correct one if not.
    - Review the `main.tf` to make sure there are no stuff being harcoded unless you are sure that's what you want. A few minutes on this step might save you much more time debugging a missconfigured account.

3. In the 'backend "s3""' section modify the 'key' to replace 'poc' with the account identifier convention we use for s3, i.e. {short_lowercase_helpline_code} . For example, Aarambh Production would look like this:
```hcl
  backend "s3" {
    bucket         = "tl-terraform-state-production"
    key            = "twilio/in/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
```

4. Open the `variables.tf` file and update the defaults to ones appropriate to this helpline & environment or modify locals within `main.tf`

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

5. Run `make setup-new-environment` from your new folder (you might need to run `make init tf_args=-reconfigure` if it complains after you set up the ssm secrets.)

> The first time you run this, you will need to enter the following secrets:
>
> *Twilio Account SID* - this is the account SID for the Twilio account you are working on. You can find this in the Twilio console, under the "Project Info" section.
>
> *Twilio Auth Token* - this is the auth token for the Twilio account you are working on. You can find this in the Twilio console, under the "Project Info" section.
>
> *Datadog App ID* - this is the Datadog App ID for the Datadog account you are working on. You can find this in the Datadog console, under the "API" section.
>
> *Datadog Access Token* - this is the Datadog Access Token for the Datadog account you are working on. You can find this in the Datadog console, under the "API" section.


Unfortunately, a feature gap in the twilio terraform provider means the domain URL cannot be extracted from the resource. The easiest workaround is to put it in a variable after it has been generated initially

6. Go into Twilio Console -> Autopilot -> demo_chatbot and check if the 'redirect_function' task has the correct serverless url set. If it is not correct, update it manually in Twilio Console.
    Unfortunately due to this issue with the provider, it may not be updated as part of the second `terraform apply`: https://github.com/twilio/terraform-provider-twilio/issues/92

7. Don't forget to raise a PR to merge the new configuration you created


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

/*
This is a legacy main.tf for managing those accounts where the state is managed as a workspace in a global state, rather than separately

Currently there are only 2 accounts in this state:

Aarambh Production
SafeSpot Staging

To migrate the state of an account:
1. Ensure you have a directory created & populated, and the required S3 bucket & dynamodb table created for the new account (instructions are in the README.md)
2. Ensure you have your AWS environment variables set up, and the twilio creds environment variables for the target account
3. Run the following sequence of commands

terraform init
terraform workspace select <workspace name for your account - if you don't know it you can see a list with `terraform workspace list`>
Linux / Mac -> terraform state pull > dump.tfstate
Windows (Powershell) -> terraform state pull | sc dump.tfstate
cd ../<new account directory>
terraform init
terraform state push ../aselo-terraform/dump.tfstate

Your existing state should now be in the new dedicated state S3 bucket that your account specific directory points at, under the default workspace
*/

terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.11.1"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "twilio-terraform-locks"
    encrypt        = true
  }
}

variable "account_sid" {}
variable "serverless_url" {}
variable "helpline" {}
variable "short_helpline" {}
variable "datadog_app_id" {}
variable "datadog_access_token" {}
variable "operating_info_key" {}
variable "environment" {}
variable "short_environment" {}


module "chatbots" {
  source = "../terraform-modules/chatbots/default"
  serverless_url = var.serverless_url
}

module "serverless" {
  source = "../terraform-modules/serverless/default"
}

module "services" {
  source = "../terraform-modules/services/default"
}

module "taskRouter" {
  source = "../terraform-modules/taskRouter/default"
  serverless_url = var.serverless_url
  helpline = var.helpline
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid = module.chatbots.pre_survey_bot_sid
}

module flex {
  source = "../terraform-modules/flex/default"
  flex_chat_service_sid = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module survey {
  source = "../terraform-modules/survey/default"
  helpline = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module aws {
  source = "../terraform-modules/aws/default"
  account_sid = var.account_sid
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  datadog_app_id = var.datadog_app_id
  datadog_access_token = var.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid = module.services.shared_state_sync_service_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  flex_proxy_service_sid = module.services.flex_proxy_service_sid
  post_survey_bot_sid = module.chatbots.post_survey_bot_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
}
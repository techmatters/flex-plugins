terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-development"
    key            = "twilio/e2e/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-development"
  }
}

provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "chatbots" {
  source         = "../terraform-modules/chatbots/default"
  serverless_url = module.serverless.serverless_environment_production_url
}

module "hrmServiceIntegration" {
  source            = "../terraform-modules/hrmServiceIntegration/default"
  local_os          = var.local_os
  helpline          = var.helpline
  short_helpline    = var.short_helpline
  environment       = var.environment
  short_environment = var.short_environment
}

module "serverless" {
  source             = "../terraform-modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
}

module "services" {
  source            = "../terraform-modules/services/default"
  local_os          = var.local_os
  helpline          = var.helpline
  short_helpline    = var.short_helpline
  environment       = var.environment
  short_environment = var.short_environment
}

module "taskRouter" {
  source         = "../terraform-modules/taskRouter/default"
  serverless_url = module.serverless.serverless_environment_production_url
  helplines      = ["Childline", ""]
}

module "studioFlow" {
  source                   = "../terraform-modules/studioFlow/default"
  master_workflow_sid      = module.taskRouter.master_workflow_sid
  chat_task_channel_sid    = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid       = module.chatbots.pre_survey_bot_sid
}

module "flex" {
  source                          = "../terraform-modules/flex/default"
  twilio_account_sid              = local.secrets.twilio_account_sid
  short_environment               = var.short_environment
  flex_chat_service_sid           = module.services.flex_chat_service_sid
  messaging_studio_flow_sid       = module.studioFlow.messaging_studio_flow_sid
  messaging_flow_contact_identity = "+12607821891"
}

module "survey" {
  source                             = "../terraform-modules/survey/default"
  helpline                           = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module "aws" {
  source                             = "../terraform-modules/aws/default"
  twilio_account_sid                 = local.secrets.twilio_account_sid
  twilio_auth_token                  = local.secrets.twilio_auth_token
  serverless_url                     = module.serverless.serverless_environment_production_url
  helpline                           = var.helpline
  short_helpline                     = var.short_helpline
  environment                        = var.environment
  short_environment                  = var.short_environment
  operating_info_key                 = var.operating_info_key
  datadog_app_id                     = local.secrets.datadog_app_id
  datadog_access_token               = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid                = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  post_survey_bot_sid                = module.chatbots.post_survey_bot_sid
  survey_workflow_sid                = module.survey.survey_workflow_sid
}

module "github" {
  source             = "../terraform-modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
  short_environment  = var.short_environment
  short_helpline     = var.short_helpline
  serverless_url     = module.serverless.serverless_environment_production_url
}

terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio-ph-staging"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-staging"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "secrets" {
  name     = "/terraform/twilio-iac/ecpat-staging/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "chatbots" {
  source = "../terraform-modules/chatbots/default"
  serverless_url = module.serverless.serverless_environment_production_url
}

module "custom_chatbots" {
  source = "../terraform-modules/chatbots/ecpat"
  serverless_url = module.serverless.serverless_environment_production_url
}

module "hrmServiceIntegration" {
  source = "../terraform-modules/hrmServiceIntegration/default"
  local_os = var.local_os
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
}

module "serverless" {
  source = "../terraform-modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
}

module "services" {
  source = "../terraform-modules/services/default"
  local_os = var.local_os
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
  uses_conversation_service = var.uses_conversation_service
}

module "taskRouter" {
  source = "../terraform-modules/taskRouter/ecpat"
  serverless_url = module.serverless.serverless_environment_production_url
  helpline = var.helpline
  custom_target_workers = var.custom_target_workers
  ecpat_messenger_number = var.ecpat_messenger_number
  eyca_messenger_number = var.eyca_messenger_number
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  custom_flow_definition = templatefile(
    "../terraform-modules/studioFlow/ecpat/Messaging Flow.tftpl",
    {
      master_workflow_sid = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      pre_survey_bot_sid = module.chatbots.pre_survey_bot_sid
      default_task_channel_sid = module.taskRouter.default_task_channel_sid
      language_bot_sid = module.custom_chatbots.language_bot_sid
      permission_bot_en_sid = module.custom_chatbots.permission_bot_en_sid
      permission_bot_fil_sid = module.custom_chatbots.permission_bot_fil_sid
      pre_survey_bot_fil_sid = module.custom_chatbots.pre_survey_bot_fil_sid
    })
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid = module.chatbots.pre_survey_bot_sid
}

module flex {
  source = "../terraform-modules/flex/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  definition_version = var.definition_version
  serverless_url = module.serverless.serverless_environment_production_url
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
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
  twilio_account_sid = local.secrets.twilio_account_sid
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  datadog_app_id = local.secrets.datadog_app_id
  datadog_access_token = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid = module.services.shared_state_sync_service_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  flex_proxy_service_sid = module.services.flex_proxy_service_sid
  post_survey_bot_sid = module.chatbots.post_survey_bot_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
}
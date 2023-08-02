terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-staging"
    key            = "twilio/zw/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-staging"
  }
}

provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(local.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
}

locals {
  helpline                  = "Childline Zimbabwe"
  task_language             = "en-US"
  voice_ivr_language        = "en-US"
  short_helpline            = "ZW"
  operating_info_key        = "zw"
  environment               = "Staging"
  short_environment         = "STG"
  target_task_name          = "greeting"
  twilio_numbers            = ["messenger:103260519220529"]
  channel                   = ""
  custom_channel_attributes = ""
  secrets                   = jsondecode(data.aws_ssm_parameter.secrets.value)
  twilio_channels = {
    "facebook" = { "contact_identity" = "messenger:103260519220529", "channel_type" = "facebook" },
    "webchat"  = { "contact_identity" = "", "channel_type" = "web" },
    "sms"      = { "contact_identity" = "+14322743110", "channel_type" = "sms" }
  }
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
  helpline          = local.helpline
  short_helpline    = local.short_helpline
  environment       = local.environment
  short_environment = local.short_environment
}

module "serverless" {
  source             = "../terraform-modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
}

module "services" {
  source            = "../terraform-modules/services/default"
  local_os          = var.local_os
  helpline          = local.helpline
  short_helpline    = local.short_helpline
  environment       = local.environment
  short_environment = local.short_environment
}

module "taskRouter" {
  source                                = "../terraform-modules/taskRouter/default"
  serverless_url                        = module.serverless.serverless_environment_production_url
  helpline                              = local.helpline
  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"
}

module "twilioChannel" {
  for_each                 = local.twilio_channels
  source                   = "../terraform-modules/channels/twilio-channel"
  channel_contact_identity = each.value.contact_identity
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/flow-zw/no-chatbot.tftpl",
    {
      master_workflow_sid   = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      channel_attributes    = templatefile("../terraform-modules/channels/twilio-channel/channel-attributes/${each.key}-attributes.tftpl", { task_language = local.task_language })
      flow_description      = "${title(each.key)} Messaging Flow"
  })
  pre_survey_bot_sid    = module.chatbots.pre_survey_bot_sid
  target_task_name      = local.target_task_name
  channel_name          = each.key
  channel_type          = each.value.channel_type
  janitor_enabled       = true
  master_workflow_sid   = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
}

module "survey" {
  source                             = "../terraform-modules/survey/default"
  helpline                           = local.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module "aws" {
  source                             = "../terraform-modules/aws/default"
  twilio_account_sid                 = local.secrets.twilio_account_sid
  twilio_auth_token                  = local.secrets.twilio_auth_token
  serverless_url                     = module.serverless.serverless_environment_production_url
  helpline                           = local.helpline
  short_helpline                     = local.short_helpline
  short_environment                  = local.short_environment
  environment                        = local.environment
  operating_info_key                 = local.operating_info_key
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

module "aws_monitoring" {
  source         = "../terraform-modules/aws-monitoring/default"
  helpline       = local.helpline
  short_helpline = local.short_helpline
  environment    = local.environment
}

module "github" {
  source             = "../terraform-modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
  short_environment  = local.short_environment
  short_helpline     = local.short_helpline
  serverless_url     = module.serverless.serverless_environment_production_url
}

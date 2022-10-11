terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio-th-staging"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "twilio-terraform-th-staging-locks"
    encrypt        = true
  }
}
locals {
  twilio_channels = {
    "facebook" = {"contact_identity" = "messenger:108893035300837" },
    "web" = {"contact_identity" = ""},
    "sms" = {"contact_identity" = "+17152201076" }
  }
  custom_channels=["twitter","instagram","line"]
}
module "custom_chatbots" {
  source = "../terraform-modules/chatbots/childline-th"
  serverless_url = var.serverless_url
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
}

module "services" {
  source = "../terraform-modules/services/default"
  local_os = var.local_os
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
}

module "taskRouter" {
  source = "../terraform-modules/taskRouter/default"
  serverless_url = var.serverless_url
  helpline = var.helpline
}


module flex {
  source = "../terraform-modules/flex/service-configuration"
  account_sid = var.account_sid
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  permission_config = var.permission_config
  definition_version = var.definition_version
  serverless_url = var.serverless_url
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
}

module twilioChannel {
  for_each = local.twilio_channels
  source = "../terraform-modules/channels/twilio-channel"
  channel_contact_identity = each.value.contact_identity
  pre_survey_bot_sid = module.custom_chatbots.pre_survey_bot_sid
  target_task_name = var.target_task_name
  channel_name = "${each.key}"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
}

module customChannel {
  for_each = toset(local.custom_channels)
  source = "../terraform-modules/channels/custom-channel"
  channel_name = "${each.key}"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  short_helpline = var.short_helpline
  short_environment = var.short_environment
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
  post_survey_bot_sid = module.custom_chatbots.post_survey_bot_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
}

module aws_monitoring {
  source = "../terraform-modules/aws-monitoring/default"
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  aws_account_id = var.aws_account_id
}

module github {
  source = "../terraform-modules/github/default"
  twilio_account_sid = var.account_sid
  twilio_auth_token = var.auth_token
  short_environment = var.short_environment
  short_helpline = var.short_helpline
}

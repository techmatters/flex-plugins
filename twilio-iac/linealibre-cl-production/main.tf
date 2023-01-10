terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-production"
    key            = "twilio/cl/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

locals {
  helpline = "Linea Libre"
  short_helpline = "CL"
  operating_info_key = "cl"
  environment = "Production"
  short_environment = "PROD"
  definition_version = "cl-v1"
  permission_config = "cl"
  helpline_language = "es-CL"
  enable_post_survey = false
  multi_office = false
  target_task_name = "greeting"
  twilio_numbers = [""]
  channel = ""
  custom_channel_attributes = ""
  messaging_flow_contact_identity = ""
  feature_flags = {
    "enable_fullstory_monitoring": false,
    "enable_upload_documents": true,
    "enable_post_survey": local.enable_post_survey,,
    "enable_case_management": true,
    "enable_offline_contact": true,
    "enable_filter_cases": true,
    "enable_sort_cases": true,
    "enable_transfers": true,
    "enable_manual_pulling": true,
    "enable_csam_report": true,
    "enable_canned_responses": true,
    "enable_dual_write": false,
    "enable_save_insights": true,
    "enable_contact_editing": true,
    "enable_twilio_transcripts": false,
    "enable_voice_recordings": false,
    "enable_previous_contacts": true

  }
  twilio_channels = {
    "webchat" = {"contact_identity" = "", "channel_type" ="web"  }
  }
  custom_channels=[]
}

module "chatbots" {
  source = "../terraform-modules/chatbots/default"
  serverless_url = var.serverless_url
}

module "hrmServiceIntegration" {
  source = "../terraform-modules/hrmServiceIntegration/default"
  local_os = var.local_os
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  short_environment = local.short_environment
}

module "serverless" {
  source = "../terraform-modules/serverless/default"
}

module "services" {
  source = "../terraform-modules/services/default"
  local_os = var.local_os
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  short_environment = local.short_environment
}

module "taskRouter" {
  source = "../terraform-modules/taskRouter/default"
  serverless_url = var.serverless_url
  helpline = local.helpline
  custom_task_routing_filter_expression = "channelType ==\"web\" OR isContactlessTask == true OR  phone=='+16602359810' OR phone=='+48800012935'"
}

module flex {
  source = "../terraform-modules/flex/service-configuration"
  account_sid = var.account_sid
  short_environment = local.short_environment
  operating_info_key = local.operating_info_key
  permission_config = local.permission_config
  definition_version = local.definition_version
  serverless_url = var.serverless_url
  multi_office_support = local.multi_office
  feature_flags = local.feature_flags
}

module twilioChannel {
  for_each = local.twilio_channels
  source = "../terraform-modules/channels/twilio-channel"
  channel_contact_identity = each.value.contact_identity
  channel_type = each.value.channel_type
  pre_survey_bot_sid = module.chatbots.pre_survey_bot_sid
  target_task_name = local.target_task_name
  channel_name = "${each.key}"
  janitor_enabled = !local.enable_post_survey
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
  short_helpline = local.short_helpline
  short_environment = local.short_environment
}

module survey {
  source = "../terraform-modules/survey/default"
  helpline = local.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module aws {
  source = "../terraform-modules/aws/default"
  account_sid = var.account_sid
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  short_environment = local.short_environment
  operating_info_key = local.operating_info_key
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

module aws_monitoring {
  source = "../terraform-modules/aws-monitoring/default"
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
}

module github {
  source = "../terraform-modules/github/default"
  twilio_account_sid = var.account_sid
  twilio_auth_token = var.auth_token
  short_environment = local.short_environment
  short_helpline = local.short_helpline
  serverless_url = var.serverless_url
}

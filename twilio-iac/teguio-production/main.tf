terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio-co-production"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "twilio-terraform-co-production-locks"
    encrypt        = true
  }
}

locals {
  helpline = "Te Guío"
  helpline_language = "es-CO"
  task_language = "es-CO"
  short_helpline = "CO"
  operating_info_key = "co"
  environment = "Production"
  short_environment = "PROD"
  serverless_function_sid = "ZHb7ef5682d731ce326be6d61c8a2b2fcf"
  definition_version = "co-v1"
  permission_config = "co"
  multi_office = false
  enable_post_survey = false
  target_task_name = "execute_initial_flow"
  twilio_numbers = ["messenger:103538615719253","twitter:1532353002387931139","instagram:]
  channel = ""
  custom_channel_attributes = ""
  feature_flags = {
    "enable_fullstory_monitoring": false,
    "enable_upload_documents": true,
    "enable_post_survey": local.enable_post_survey,
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
    "enable_previous_contacts": true,
    "enable_contact_editing": true
  }
  twilio_channels = {
    "facebook" = {"contact_identity" = "messenger:103538615719253" },
    "web" = {"contact_identity" = "" }
  }
  custom_channels=["twitter","instagram"]
  strings= jsondecode(file("${path.module}/../translations/${local.helpline_language}/strings.json"))
}

module "custom_chatbots" {
  source = "../terraform-modules/chatbots/te-guio-co"
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
  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}]"
}

module twilioChannel {
  for_each = local.twilio_channels
  source = "../terraform-modules/channels/twilio-channel"
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/opening-hours/with-chatbot.tftpl",
    {
      channel_name = "${each.key}"
      serverless_url=var.serverless_url
      serverless_service_sid = module.serverless.serverless_service_sid
      serverless_environment_sid = module.serverless.serverless_environment_production_sid
      serverless_function_sid = local.serverless_function_sid
      master_workflow_sid = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      channel_attributes = templatefile("../terraform-modules/channels/twilio-channel/channel-attributes/${each.key}-attributes.tftpl",{task_language=local.task_language})
      flow_description = "${title(each.key)} Messaging Flow"
      pre_survey_bot_sid = module.custom_chatbots.pre_survey_bot_es_sid
      target_task_name = local.target_task_name
      operating_hours_holiday = local.strings.operating_hours_holiday
      operating_hours_closed = local.strings.operating_hours_closed

    })
  channel_contact_identity = each.value.contact_identity
  pre_survey_bot_sid = module.custom_chatbots.pre_survey_bot_es_sid
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
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/opening-hours/no-chatbot.tftpl",
    {
      channel_name = "${each.key}"
      serverless_url=var.serverless_url
      serverless_service_sid = module.serverless.serverless_service_sid
      serverless_environment_sid = module.serverless.serverless_environment_production_sid
      serverless_function_sid = local.serverless_function_sid
      master_workflow_sid = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      channel_attributes = templatefile("../terraform-modules/channels/custom-channel/channel-attributes/${each.key}-attributes.tftpl",{task_language=local.task_language})
      flow_description = "${title(each.key)} Messaging Flow"
      operating_hours_holiday = local.strings.operating_hours_holiday
      operating_hours_closed = local.strings.operating_hours_closed

    })
  channel_name = "${each.key}"
  janitor_enabled = true
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  short_helpline = local.short_helpline
  short_environment = local.short_environment
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
  helpline_language = local.helpline_language
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
  post_survey_bot_sid = module.custom_chatbots.post_survey_bot_es_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
}

module aws_monitoring {
  source = "../terraform-modules/aws-monitoring/default"
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  aws_account_id = var.aws_account_id
}

module github {
  source = "../terraform-modules/github/default"
  twilio_account_sid = var.account_sid
  twilio_auth_token = var.auth_token
  short_environment = local.short_environment
  short_helpline = local.short_helpline
  serverless_url = var.serverless_url
}

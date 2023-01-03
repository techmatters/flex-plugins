terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio-co-staging"
    key            = "twilio/terraform.tfstate"
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
  name     = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  helpline = "Te Guío"
  helpline_language = "es-CO"
  task_language = "es-CO"
  voice_ivr_language = "es-MX"
  short_helpline = "CO"
  operating_info_key = "co"
  environment = "Staging"
  short_environment = "STG"
  operating_hours_function_sid = "ZH5fcc5dee5089c176acd0bd24e7fa873e"
  definition_version = "co-v1"
  permission_config = "co"
  multi_office = false
  enable_post_survey = false
  target_task_name = "execute_initial_flow"
  twilio_numbers = ["messenger:103574689075106","twitter:1540032139563073538","instagram:17841454586132629","whatsapp:+12135834846"]
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
    "facebook" = {"contact_identity" = "messenger:103574689075106", "channel_type" ="facebook" },
    "webchat" = {"contact_identity" = "", "channel_type" ="web"  },
    "whatsapp" = {"contact_identity" = "whatsapp:+12135834846", "channel_type" ="whatsapp" }
  }
  custom_channels=["twitter","instagram"]
  strings= jsondecode(file("${path.module}/../translations/${local.helpline_language}/strings.json"))
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "custom_chatbots" {
  source = "../terraform-modules/chatbots/te-guio-co"
  serverless_url = module.serverless.serverless_environment_production_url
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
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
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
  serverless_url = module.serverless.serverless_environment_production_url
  helpline = local.helpline
  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", local.twilio_numbers))}] OR to IN [\"+17752526377\",\"+578005190671\"]"
}

module twilioChannel {
  for_each = local.twilio_channels
  source = "../terraform-modules/channels/twilio-channel"
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/operating-hours/with-chatbot.tftpl",
    {
      channel_name = "${each.key}"
      serverless_url=module.serverless.serverless_environment_production_url
      serverless_service_sid = module.serverless.serverless_service_sid
      serverless_environment_sid = module.serverless.serverless_environment_production_sid
      operating_hours_function_sid = local.operating_hours_function_sid
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
  channel_type = each.value.channel_type
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
    "../terraform-modules/channels/flow-templates/operating-hours/no-chatbot.tftpl",
    {
      channel_name = "${each.key}"
      serverless_url=module.serverless.serverless_environment_production_url
      serverless_service_sid = module.serverless.serverless_service_sid
      serverless_environment_sid = module.serverless.serverless_environment_production_sid
      operating_hours_function_sid = local.operating_hours_function_sid
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

module voiceChannel {
  source = "../terraform-modules/channels/voice-channel"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  voice_task_channel_sid = module.taskRouter.voice_task_channel_sid
  voice_ivr_language = local.voice_ivr_language
  voice_ivr_greeting_message = local.strings.voice_ivr_greeting_message
}

module flex {
  source = "../terraform-modules/flex/service-configuration"
  twilio_account_sid = local.secrets.twilio_account_sid
  short_environment = local.short_environment
  operating_info_key = local.operating_info_key
  permission_config = local.permission_config
  definition_version = local.definition_version
  serverless_url = module.serverless.serverless_environment_production_url
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
  twilio_account_sid = local.secrets.twilio_account_sid
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  short_environment = local.short_environment
  operating_info_key = local.operating_info_key
  datadog_app_id = local.secrets.datadog_app_id
  datadog_access_token = local.secrets.datadog_access_token
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
}

# module github {

#   source = "../terraform-modules/github/default"
#   twilio_account_sid = local.secrets.twilio_account_sid
#   twilio_auth_token = local.secrets.twilio_auth_token
#   short_environment = local.short_environment
#   short_helpline = local.short_helpline
# }

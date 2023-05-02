terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-staging"
    key            = "twilio/cl/terraform.tfstate"
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
 helpline = "Linea Libre"
 short_helpline = "CL"
 operating_info_key = "cl"
 environment = "Staging"
 short_environment = "STG"
 definition_version = "cl-v1"
 permission_config = "cl"
 helpline_language = "es-CL"
 task_language = "es-CL"
 voice_ivr_language = "es-MX"
 operating_hours_function_sid = "ZH3474ae11ae0fcd34edf418930a4abdaf"
 enable_post_survey = true
 multi_office = false
 twilio_numbers = [""]
 channel = ""
 custom_channel_attributes = ""
 feature_flags = {
   "enable_fullstory_monitoring": true,
   "enable_upload_documents": true,
   "enable_post_survey": local.enable_post_survey,
   "enable_contact_editing": true,
   "enable_case_management": true,
   "enable_offline_contact": true,
   "enable_filter_cases": true,
   "enable_sort_cases": true,
   "enable_transfers": true,
   "enable_manual_pulling": false,
   "enable_csam_report": false,
   "enable_canned_responses": true,
   "enable_dual_write": false,
   "enable_save_insights": false,
   "enable_previous_contacts": true,
   "enable_voice_recordings": false,
   "enable_twilio_transcripts": true,
   "enable_external_transcripts": true,
   "post_survey_serverless_handled": true,
   "enable_csam_clc_report": false,
   "enable_counselor_toolkits": false,
   "enable_resources": false,
   "enable_emoji_picker": true

 }
 secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
 twilio_channels = {
   "webchat" = {"contact_identity" = "", "channel_type" ="web"  }
 }
 custom_channels=[]
 strings= jsondecode(file("${path.module}/../translations/${local.helpline_language}/strings.json"))
 slack_error_webhook = "https://hooks.slack.com/services/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"
 //serverless
 ui_editable = true
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
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
  ui_editable = local.ui_editable
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
  custom_task_routing_filter_expression = "channelType ==\"web\" OR channelType ==\"voice\" OR isContactlessTask == true OR  phone=='+16602359810' OR phone=='+48800012935'"
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

module twilioChannel {
  for_each = local.twilio_channels
  channel_type = each.value.channel_type
  source = "../terraform-modules/channels/twilio-channel"
  channel_contact_identity = each.value.contact_identity
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
      channel_attributes = templatefile("../terraform-modules/channels/twilio-channel/channel-attributes/${each.key}-attributes.tftpl",{task_language=local.task_language})
      flow_description = "${title(each.key)} Messaging Flow"
      chat_greeting_message = local.strings.chat_greeting_message
      helpline = local.helpline
      environment = local.environment
      task_language=local.task_language
      slack_error_webhook = local.slack_error_webhook
    })
  channel_name = "${each.key}"
  janitor_enabled = !local.enable_post_survey
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
}

module voiceChannel {
  source = "../terraform-modules/channels/voice-channel"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  voice_task_channel_sid = module.taskRouter.voice_task_channel_sid
  voice_ivr_language = local.voice_ivr_language
  voice_ivr_greeting_message = local.strings.voice_ivr_greeting_message
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/operating-hours/voice-ivr.tftpl",
    {
      master_workflow_sid = module.taskRouter.master_workflow_sid
      voice_task_channel_sid = module.taskRouter.voice_task_channel_sid
      channel_attributes =  templatefile("../terraform-modules/channels/voice-channel/channel-attributes/voice-attributes.tftpl",{task_language=local.task_language})
      flow_description = "Voice IVR Flow"
      voice_ivr_greeting_message = local.strings.voice_ivr_greeting_message
      voice_ivr_language = local.voice_ivr_language
      operating_hours_function_sid = local.operating_hours_function_sid
      serverless_url=module.serverless.serverless_environment_production_url
      serverless_service_sid = module.serverless.serverless_service_sid
      serverless_environment_sid = module.serverless.serverless_environment_production_sid
      helpline = local.helpline
      environment = local.environment
      task_language = local.task_language
      slack_error_webhook = local.slack_error_webhook

    })
}


module survey {
  source = "../terraform-modules/survey/default"
  helpline = local.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}
module aws {
  source = "../terraform-modules/aws/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  serverless_url = module.serverless.serverless_environment_production_url
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
  post_survey_bot_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
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
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  short_environment = local.short_environment
  short_helpline = local.short_helpline
  serverless_url = module.serverless.serverless_environment_production_url
}

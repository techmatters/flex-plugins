terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
     bucket         = "tl-terraform-state-production"
     key            = "twilio/as/terraform.tfstate"
     dynamodb_table = "terraform-locks"
     encrypt        = true
     role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-production"
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
  helpline = "Aselo Production"
  short_helpline = "AS"
  operating_info_key = "as"
  environment = "Production"
  short_environment = "PROD"
  definition_version = "demo-v1"
  permission_config = "demo"
  enable_post_survey = true
  multi_office = false
  target_task_name = "greeting"
  twilio_numbers = []
  channel = ""
  feature_flags = {
    "enable_fullstory_monitoring": false,
    "enable_upload_documents": true,
    "enable_post_survey": local.enable_post_survey,
    "enable_contact_editing": true,
    "enable_case_management": true,
    "enable_offline_contact": true,
    "enable_filter_cases": true,
    "enable_sort_cases": true,
    "enable_transfers": true,
    "enable_manual_pulling": true,
    "enable_csam_report": false,
    "enable_canned_responses": true,
    "enable_dual_write": false,
    "enable_save_insights": false,
    "enable_previous_contacts": true,
    "enable_voice_recordings": false,
    "enable_twilio_transcripts": true,
    "enable_external_transcripts": false,
    "post_survey_serverless_handled": true,
    "enable_csam_clc_report": false,
    "enable_emoji_picker": true
  }
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  twilio_channels = {
    "webchat" = {"contact_identity" = "", "channel_type" ="web"  }
  }
  custom_channels=[]
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "chatbots" {
  source = "../terraform-modules/chatbots/default"
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
  custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true"
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
  post_survey_bot_sid = module.chatbots.post_survey_bot_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
  assets_bucket_url = "https://assets-${lower(var.environment)}.tl.techmatters.org"
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

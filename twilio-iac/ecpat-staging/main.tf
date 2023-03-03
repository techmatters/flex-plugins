terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-staging"
    key            = "twilio/ph/terraform.tfstate"
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
  helpline = "ECPAT"
  short_helpline = "PH"
  operating_info_key = "mt"
  environment = "Staging"
  short_environment = "STG"
  definition_version = "ph-v1"
  helpline_language = "en-US"
  permission_config = "ph"
  multi_office = false
  enable_post_survey = false
  target_task_name = "greeting"
  twilio_numbers = ["messenger:106378571968698"]
  channel = ""
  custom_channel_attributes = ""
  feature_flags = {
    "enable_fullstory_monitoring": true,
    "enable_upload_documents": true,
    "enable_post_survey": local.enable_post_survey,
    "enable_case_management": true,
    "enable_offline_contact": true,
    "enable_filter_cases": true,
    "enable_sort_cases": true,
    "enable_transfers": true,
    "enable_manual_pulling": true,
    "enable_csam_report": false,
    "enable_canned_responses": true,
    "enable_dual_write": false,
    "enable_save_insights": true,
    "enable_previous_contacts": true,
    "enable_contact_editing": true,
    "enable_twilio_transcripts": true
  }
  twilio_channels = {
    "facebook" = {"contact_identity" = "messenger:106378571968698", "channel_type" ="facebook"  }
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
  custom_task_routing_filter_expression = "isContactlessTask==true"
}
/*
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
*/

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
}

module aws_monitoring {
  source = "../terraform-modules/aws-monitoring/default"
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  cloudwatch_region = "us-east-1"
}

module github {
  source = "../terraform-modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  short_environment = local.short_environment
  short_helpline = local.short_helpline
  serverless_url = module.serverless.serverless_environment_production_url
}

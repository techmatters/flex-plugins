terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio-hu-production"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    region = "us-east-1"
    encrypt        = true
  }
}

data "aws_ssm_parameter" "secrets" {
  name     = "/terraform/twilio-iac/kek-vonal-production/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  helpline  = "Kék Vonal"
  short_helpline = "HU"
  operating_info_key = "hu"
  environment = "Production"
  short_environment = "PROD"
  definition_version = "hu-v1"
  permission_config = "hu"
  multi_office  = false

  feature_flags = {
    "enable_fullstory_monitoring": false,
    "enable_upload_documents": true,
    "enable_post_survey": false,
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
    "enable_previous_contacts": true
  }

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
  custom_task_routing_filter_expression = "phone=='+3680984590' OR phone=='+3612344587' OR channelType=='web'"
  serverless_url = local.secrets.serverless_url
  skip_timeout_expression = "1==1"
  include_default_filter = true
  helpline = "Kék Vonal"
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
  custom_flow_definition = templatefile(
    "./flow.tftpl",
    {
      master_workflow_sid = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      default_task_channel_sid = module.taskRouter.default_task_channel_sid
      chatbot_default_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
      chatbot_ru_HU_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
      chatbot_ukr_HU_sid = twilio_autopilot_assistants_v1.chatbot_ukr_HU.sid
    })
}

module flex {
  source = "../terraform-modules/flex/default"
  account_sid = local.secrets.twilio_account_sid
  short_environment = local.short_environment
  operating_info_key = local.operating_info_key
  permission_config = "demo"
  definition_version = local.definition_version
  serverless_url = local.secrets.serverless_url
  hrm_url = "https://hrm-production-eu.tl.techmatters.org"
  multi_office_support = local.multi_office
  feature_flags = local.feature_flags
  messaging_flow_contact_identity = "+12014821989"
  flex_chat_service_sid = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module survey {
  source = "../terraform-modules/survey/default"
  helpline = local.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module aws {
  source = "../terraform-modules/aws/default"
  account_sid = local.secrets.twilio_account_sid
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
  post_survey_bot_sid = twilio_autopilot_assistants_v1.chatbot_postsurvey.sid
  survey_workflow_sid = module.survey.survey_workflow_sid
  bucket_region = "us-east-1"
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
  serverless_url = local.secrets.serverless_url
}

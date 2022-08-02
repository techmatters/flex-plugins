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
    dynamodb_table = "twilio-terraform-co-staging-locks"
    encrypt        = true
  }
}

module "custom_chatbots" {
  source = "../terraform-modules/chatbots/te-guio-co"
  serverless_url = var.serverless_url
}
/*
module "chatbots" {
  source = "../terraform-modules/chatbots/default"
  serverless_url = var.serverless_url
}
*/
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
  custom_task_routing_filter_expression = var.custom_task_routing_filter_expression
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid = module.custom_chatbots.pre_survey_bot_es_sid
}

module flex {
  source = "../terraform-modules/flex/default"
  account_sid = var.account_sid
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  permission_config = "co"
  definition_version = var.definition_version
  serverless_url = var.serverless_url
  hrm_url = "https://hrm-test.tl.techmatters.org"
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
  flex_chat_service_sid = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
  messaging_flow_contact_identity = var.messaging_flow_contact_identity
  custom_flex_messaging_flow_enabled = var.custom_flex_messaging_flow_enabled
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
  post_survey_bot_sid = module.custom_chatbots.post_survey_bot_es_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
}

module aws_monitoring {
  source = "../terraform-modules/aws-monitoring/default"
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  aws_account_id = var.aws_account_id
}

# module github {

#   source = "../terraform-modules/github/default"
#   twilio_account_sid = var.account_sid
#   twilio_auth_token = var.auth_token
#   short_environment = var.short_environment
#   short_helpline = var.short_helpline
# }

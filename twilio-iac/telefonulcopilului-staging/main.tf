terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-staging"
    key            = "twilio/ro/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    region         = "us-east-1"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-staging"
  }
}

provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "secrets" {
  name     = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "chatbots" {
  source = "../modules/chatbots/default"
  serverless_url = module.serverless.serverless_environment_production_url
}

module "hrmServiceIntegration" {
  source = "../modules/hrmServiceIntegration/default"
  local_os = var.local_os
  helpline = var.helpline
  short_code = var.short_code
  environment = var.environment
  short_environment = var.short_environment
}

module "serverless" {
  source = "../modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
}

module "services" {
  source = "../modules/services/default"
  local_os = var.local_os
  helpline = var.helpline
  short_code = var.short_code
  environment = var.environment
  short_environment = var.short_environment
}

module "taskRouter" {
  source = "../modules/taskRouter/default"
  serverless_url = module.serverless.serverless_environment_production_url
  helpline = "Telefonul Copilului Romania"
  custom_target_workers = "1==1"
}

module studioFlow {
  source = "../modules/studioFlow/default"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid = module.chatbots.pre_survey_bot_sid
}

module flex {
  source = "../modules/flex/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  permission_config = "demo"
  definition_version = var.definition_version
  serverless_url = module.serverless.serverless_environment_production_url
  hrm_url = "https://hrm-staging-eu.tl.techmatters.org"
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
  messaging_flow_contact_identity = "+19094742490"
  flex_chat_service_sid = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module survey {
  source = "../modules/survey/default"
  helpline = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module aws {
  source = "../modules/aws/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  serverless_url = module.serverless.serverless_environment_production_url
  helpline = var.helpline
  short_code = var.short_code
  environment = var.environment
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  datadog_app_id = local.secrets.datadog_app_id
  datadog_access_token = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid = module.services.shared_state_sync_service_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  flex_proxy_service_sid = module.services.flex_proxy_service_sid
  post_survey_bot_sid = module.chatbots.post_survey_bot_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
  bucket_region = "eu-west-1"
}

module aws_monitoring {
  source = "../modules/aws-monitoring/default"
  helpline = var.helpline
  short_code = var.short_code
  environment = var.environment
  cloudwatch_region = "eu-west-1"
}

module github {

  source = "../modules/github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  short_environment = var.short_environment
  short_code = var.short_code
  serverless_url = module.serverless.serverless_environment_production_url
}
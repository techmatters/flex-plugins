data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${var.environment}/${var.short_helpline}/secrets.json"
}

data "aws_ssm_parameter" "datadog_app_key" {
  name ="/terraform/infrastructure-config/datadog/app_key"
}

data "aws_ssm_parameter" "datadog_api_key" {
  name ="/terraform/infrastructure-config/datadog/api_key"
}

provider "datadog" {
  api_key = data.aws_ssm_parameter.datadog_api_key.value
  app_key = data.aws_ssm_parameter.datadog_app_key.value
}
data "aws_caller_identity" "current" {}

locals {
  secrets                               = jsondecode(data.aws_ssm_parameter.secrets.value)
  aws_account_id                        = data.aws_caller_identity.current.account_id
  provision_config                      = data.terraform_remote_state.provision.outputs
  serverless_url                        = local.provision_config.serverless_url
  serverless_service_sid                = local.provision_config.serverless_service_sid
  serverless_environment_production_sid = local.provision_config.serverless_environment_production_sid
  task_router_master_workflow_sid       = local.provision_config.task_router_master_workflow_sid
  task_router_chat_task_channel_sid     = local.provision_config.task_router_chat_task_channel_sid
  task_router_voice_task_channel_sid    = local.provision_config.task_router_voice_task_channel_sid
  services_flex_chat_service_sid        = local.provision_config.services_flex_chat_service_sid
  task_router_workflow_sids             = local.provision_config.task_router_workflow_sids
  task_router_task_channel_sids         = local.provision_config.task_router_task_channel_sids


  stage = "configure"
}

data "terraform_remote_state" "provision" {
  backend = "s3"

  config = {
    bucket   = "tl-terraform-state-${var.environment}"
    key      = "twilio/${var.short_helpline}/provision/terraform.tfstate"
    region   = "us-east-1"
    role_arn = "arn:aws:iam::${local.aws_account_id}:role/tf-twilio-iac-${var.environment}"
  }
}


provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "channel" {
  source                     = "../../channels/v1"
  flex_chat_service_sid      = local.services_flex_chat_service_sid
  workflow_sids              = local.task_router_workflow_sids
  task_channel_sids          = local.task_router_task_channel_sids
  channel_attributes         = var.channel_attributes
  channels                   = var.channels
  enable_post_survey         = var.enable_post_survey
  environment                = var.environment
  flow_vars                  = var.flow_vars
  short_environment          = var.short_environment
  task_language              = var.task_language
  helpline                   = var.helpline
  short_helpline             = upper(var.short_helpline)
  twilio_account_sid                         = local.secrets.twilio_account_sid
  serverless_url                             = local.serverless_url
  get_profile_flags_for_identifiers_base_url = var.get_profile_flags_for_identifiers_base_url == "" ? local.serverless_url : var.get_profile_flags_for_identifiers_base_url
  serverless_service_sid                     = local.serverless_service_sid
  serverless_environment_sid                 = local.serverless_environment_production_sid
  region                                     = var.helpline_region
  base_priority                              = 500
}

module "datadog" {
  source = "../../datadog/v1"
  enable_datadog_monitoring = var.enable_datadog_monitoring
  short_helpline    = upper(var.short_helpline)
  short_environment = var.short_environment
  channel_studio_flow_sids = module.channel.channel_studio_flows_sids
}

resource "aws_ssm_parameter" "permission_config" {
  name        = "/${lower(var.environment)}/config/${nonsensitive(local.secrets.twilio_account_sid)}/permission_config"
  type        = "SecureString"
  value       = var.permission_config
  description = "Twilio account - permission config to use for the given account"

  tags = {
    Environment = lower(var.environment)
    Name        = "/${lower(var.environment)}/config/${nonsensitive(local.secrets.twilio_account_sid)}/permission_config"
    Terraform   = true
  }
}

resource "aws_ssm_parameter" "transcript_retention_override" {
  count = var.hrm_transcript_retention_days_override >= 0 ? 1 : 0

  name  = "/${var.environment}/hrm/${local.secrets.twilio_account_sid}/transcript_retention_days"
  type  = "String"
  value = var.hrm_transcript_retention_days_override
}

resource "aws_ssm_parameter" "case_status_transition" {
  count       = var.case_status_transition_rules != null ? 1 : 0
  name        = "/${lower(var.environment)}/${var.helpline_region}/hrm/scheduled-task/case-status-transitionrules/${nonsensitive(local.secrets.twilio_account_sid)}"
  type        = "SecureString"
  value       = jsonencode(var.case_status_transition_rules)
  description = "Automated case status transition rules configuration"

  tags = {
    environment = var.environment
    helpline    = var.short_helpline
    env         = var.environment
    Terraform   = true
  }
}

data "aws_ssm_parameter" "hrm_static_api_key_legacy" {
  name     = "${var.short_environment}_TWILIO_${upper(var.short_helpline)}_HRM_STATIC_KEY"
  #depends_on = [ module.hrmServiceIntegration.null_resource.hrm_static_api_key]
}

resource "aws_ssm_parameter" "hrm_static_api_key_v2" {
  name        = "/${lower(var.environment)}/twilio/${local.secrets.twilio_account_sid}/static_key"
  type        = "SecureString"
  value       = data.aws_ssm_parameter.hrm_static_api_key_legacy.value
  description = "Twilio API Key"

  tags = {
    Environment = lower(var.environment)
    Name        = "/${lower(var.environment)}/twilio/${local.secrets.twilio_account_sid}/static_key"
    Terraform   = true
  }
}


module event {
  source              = "../../events/v1"
  default_webhook_url = "https://hrm-${lower(var.environment)}.tl.techmatters.org/lambda/twilioEventStreams" 
  subscriptions       = var.subscriptions
  short_helpline      = var.short_helpline
  short_environment   = var.short_environment
}
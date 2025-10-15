data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${var.environment}/${var.short_helpline}/secrets.json"
}
data "aws_ssm_parameter" "webhook_url_studio_errors" {
  name = "/${lower(var.environment)}/slack/webhook_url_studio_errors"
}
data "aws_caller_identity" "current" {}

locals {
  secrets                               = jsondecode(data.aws_ssm_parameter.secrets.value)
  aws_account_id                        = data.aws_caller_identity.current.account_id
  provision_config                      = data.terraform_remote_state.provision.outputs
  serverless_url                        = local.provision_config.serverless_url
  serverless_service_sid                = local.provision_config.serverless_service_sid
  serverless_environment_production_sid = local.provision_config.serverless_environment_production_sid
  stage = "system-down"
  webhook_url_studio_errors = nonsensitive(data.aws_ssm_parameter.webhook_url_studio_errors.value)
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


resource "twilio_studio_flows_v2" "system_down_studio_subflow" {
  friendly_name = "System Down Studio SubFlow"
  status        = "published"
  definition = templatefile(
    var.system_down_templatefile,
    {
      flow_description                           = "System Down Studio SubFlow",
      helpline                                   = var.helpline,
      short_helpline                             = var.short_helpline,
      short_environment                          = var.short_environment,
      environment                                = var.environment,
      serverless_service_sid                     = local.serverless_service_sid,
      serverless_environment_sid                 = local.serverless_environment_production_sid,
      serverless_url                             = local.serverless_url,
      system_down_flow_vars                      = var.system_down_flow_vars
    }
  )
}


resource "twilio_studio_flows_v2" "debug_studio_subflow" {
  friendly_name = "Debug Studio SubFlow"
  status        = "published"
  debug_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/debug-studio-subflow.tftpl"
  definition = templatefile(
    var.system_down_templatefile,
    {
      flow_description                           = "Debug SubFlow",
      helpline                                   = var.helpline,
      short_helpline                             = var.short_helpline,
      short_environment                          = var.short_environment,
      environment                                = var.environment,
      debug_mode                                 = var.debug_mode,
      webhook_url_studio_errors                  = local.webhook_url_studio_errors
    }
  )
}


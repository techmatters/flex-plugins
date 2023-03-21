data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${lower(var.environment)}/${var.short_helpline}/secrets.json"
}

locals {
  secrets                               = jsondecode(data.aws_ssm_parameter.secrets.value)
  provision_config                      = data.terraform_remote_state.provision.outputs
  serverless_url                        = local.provision_config.serverless_url
  serverless_service_sid                = local.provision_config.serverless_service_sid
  serverless_environment_production_sid = local.provision_config.serverless_environment_production_sid
  task_router_master_workflow_sid       = local.provision_config.task_router_master_workflow_sid
  task_router_chat_task_channel_sid     = local.provision_config.task_router_chat_task_channel_sid
  services_flex_chat_service_sid        = local.provision_config.services_flex_chat_service_sid

  short_env_map = {
    "Development" = "DEV"
    "Staging"     = "STG"
    "Production"  = "PROD"
  }
  short_environment = local.short_env_map[var.environment]
}

data "terraform_remote_state" "provision" {
  backend = "s3"

  config = {
    bucket = "tl-terraform-state-${lower(var.environment)}"
    key    = "twilio/${var.short_helpline}/provision/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

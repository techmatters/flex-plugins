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

  twilio_account_sid = nonsensitive(local.secrets.twilio_account_sid)

  // Default chatbot SIDs can be overwriten by custom chatbot SIDs included from the helpline's additional.chatbot.tf file
  default_chatbot_sids = {
    post_survey = var.default_autopilot_chatbot_enabled ? module.chatbots[0].post_survey_chatbot_sid : ""
  }
  chatbot_sids = merge(local.chatbot_sids, local.custom_chatbot_sids)
  post_survey_chatbot_url = "https://channels.autopilot.twilio.com/v1/${local.twilio_account_sid}/${local.chatbot_sids["post_survey"]}/twilio-chat"
}

data "terraform_remote_state" "provision" {
  backend = "s3"

  config = {
    bucket = "tl-terraform-state-${var.environment}"
    key    = "twilio/${var.short_helpline}/provision/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "chatbots" {
  count = var.default_autopilot_chatbot_enabled ? 1 : 0

  source = "../../chatbots/default"
  serverless_url = local.serverless_url
}

moved {
  from = module.chatbots
  to   = module.chatbots[0]
}

resource "aws_ssm_parameter" "twilio_post_survey_bot_chat_url_old" {
  # Deserialise the JSON used for the keys - this way we can have multiple values per key
  # note: this can also be accomplished in a more "tf native" way by using an array of objects and a `for` loop.
  # see: https://github.com/techmatters/flex-plugins/blob/1edf877bba4760370af16f41045fa14956d5620f/twilio-iac/terraform-modules/aws/default/main.tf#L206
  name        = "${var.short_environment}_${jsondecode(each.value)[0]}_${var.short_helpline}_${each.key}"
  type        = "SecureString"
  value       = local.post_survey_chatbot_url
  description = "Twilio account - Post Survey bot chat url"
}

resource "aws_ssm_parameter" "twilio_post_survey_bot_chat_url" {
  name  = "/${lower(var.environment)}/twilio/${local.twilio_account_sid}/post_survey_bot_chat_url"
  type  = "SecureString"
  value = local.post_survey_chatbot_url
  description = "Twilio account - Post Survey Bot Chat URL"

  tags = {
    Environment = lower(var.environment)
    Name = "/${lower(var.environment)}/twilio/${local.twilio_account_sid}/post_survey_bot_chat_url"
    Terraform = true
  }
}

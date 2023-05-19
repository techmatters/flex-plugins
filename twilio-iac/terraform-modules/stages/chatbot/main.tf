data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${lower(var.environment)}/${var.short_helpline}/secrets.json"
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
  services_flex_chat_service_sid        = local.provision_config.services_flex_chat_service_sid

  twilio_account_sid = nonsensitive(local.secrets.twilio_account_sid)
  // I'm modifying this just for now, I'll probably refactor these modules as well later on.
  // I want to stick with the idea that terraform modules should be "blind" or not having a notion of what is a default
  // configuration. For the same reason I'm thinking that the output of this  module should just be a map of chatbot objects.
  // Mainly because for autopilot we need the sids, but for amazon lex we might need something else.

  // Default chatbot SIDs can be overwriten by custom chatbot SIDs included from the helpline's additional.chatbot.tf file
  default_chatbots = {
    // UGH, this is a dirty hack to get a value from outputs of a module behind count without getting and empty tuple error.
    pre_survey : {
      sid = var.default_autopilot_chatbot_enabled ? join("", module.chatbots.*.pre_survey_bot_sid) : ""
    }
    post_survey : {
      sid = var.default_autopilot_chatbot_enabled ? join("", module.chatbots.*.post_survey_bot_sid) : ""
    }
  }
  chatbots                = merge(local.default_chatbots, local.custom_chatbots)
  post_survey_chatbot_url = "https://channels.autopilot.twilio.com/v1/${local.twilio_account_sid}/${local.chatbots.post_survey["sid"]}/twilio-chat"
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

module "chatbots" {
  count = var.default_autopilot_chatbot_enabled ? 1 : 0

  source         = "../../chatbots/default"
  serverless_url = local.serverless_url
}

moved {
  from = module.chatbots
  to   = module.chatbots[0]
}

resource "aws_ssm_parameter" "twilio_post_survey_bot_chat_url_old" {
  name        = "${var.short_environment}_TWILIO_${upper(var.short_helpline)}_POST_SURVEY_BOT_CHAT_URL"
  type        = "SecureString"
  value       = local.post_survey_chatbot_url
  description = "Twilio account - Post Survey bot chat url"
}

resource "aws_ssm_parameter" "twilio_post_survey_bot_chat_url" {
  name        = "/${lower(var.environment)}/twilio/${local.twilio_account_sid}/post_survey_bot_chat_url"
  type        = "SecureString"
  value       = local.post_survey_chatbot_url
  description = "Twilio account - Post Survey Bot Chat URL"

  tags = {
    Environment = lower(var.environment)
    Name        = "/${lower(var.environment)}/twilio/${local.twilio_account_sid}/post_survey_bot_chat_url"
    Terraform   = true
  }
}

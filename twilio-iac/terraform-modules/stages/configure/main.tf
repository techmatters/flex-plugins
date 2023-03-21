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

  chatbot_config = data.terraform_remote_state.chatbot.outputs
  chatbot_sids  = local.chatbot_config.chatbot_sids

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

data "terraform_remote_state" "chatbot" {
  backend = "s3"

  config = {
    bucket = "tl-terraform-state-${lower(var.environment)}"
    key    = "twilio/${var.short_helpline}/chatbot/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

// TODO: remove this module when we remove the old flex plugin. Just here for reference
module "flex" {
  source               = "../../flex/service-configuration"
  twilio_account_sid   = local.secrets.twilio_account_sid
  short_environment    = local.short_environment
  operating_info_key   = var.operating_info_key
  permission_config    = var.short_helpline
  definition_version   = var.definition_version
  serverless_url       = local.serverless_url
  multi_office_support = var.multi_office
  feature_flags        = var.feature_flags
  hrm_url              = "https://hrm-staging-eu.tl.techmatters.org"
}

module "twilioChannel" {
  for_each = local.twilio_channels
  source   = "../../channels/twilio-channel"
  custom_flow_definition = templatefile(
    # "../../channels/flow-templates/operating-hours/with-chatbot.tftpl",
    var.twilio_channel_custom_flow_template,
    {
      channel_name                 = "${each.key}"
      serverless_url               = local.serverless_environment_production_url
      serverless_service_sid       = local.serverless_service_sid
      serverless_environment_sid   = local.serverless_environment_production_sid
      operating_hours_function_sid = local.operating_hours_function_sid
      master_workflow_sid          = local.task_router_master_workflow_sid
      chat_task_channel_sid        = local.task_router_chat_task_channel_sid
      channel_attributes           = templatefile("../../channels/twilio-channel/channel-attributes/${each.key}-attributes.tftpl", { task_language = local.task_language })
      flow_description             = "${title(each.key)} Messaging Flow"
      pre_survey_bot_sid           = module.custom_chatbots.pre_survey_bot_es_sid
      target_task_name             = local.target_task_name
      operating_hours_holiday      = local.strings.operating_hours_holiday
      operating_hours_closed       = local.strings.operating_hours_closed

  })
  channel_contact_identity = each.value.contact_identity
  channel_type             = each.value.channel_type
  pre_survey_bot_sid       = var.chatbot_pre_survey_bot_es_sid
  target_task_name         = local.target_task_name
  channel_name             = each.key
  janitor_enabled          = !local.enable_post_survey
  master_workflow_sid      = local.task_router_master_workflow_sid
  chat_task_channel_sid    = local.task_router_chat_task_channel_sid
  flex_chat_service_sid    = module.services.flex_chat_service_sid
}

module "customChannel" {
  for_each = toset(local.custom_channels)
  source   = "../../channels/custom-channel"
  custom_flow_definition = templatefile(
    # "../../channels/flow-templates/operating-hours/no-chatbot.tftpl",
    var.custom_channel_custom_flow_template,
    {
      channel_name                 = "${each.key}"
      serverless_url               = local.serverless_environment_production_url
      serverless_service_sid       = local.serverless_service_sid
      serverless_environment_sid   = local.serverless_environment_production_sid
      operating_hours_function_sid = local.operating_hours_function_sid
      master_workflow_sid          = local.task_router_master_workflow_sid
      chat_task_channel_sid        = local.task_router_chat_task_channel_sid
      channel_attributes           = templatefile("../../channels/custom-channel/channel-attributes/${each.key}-attributes.tftpl", { task_language = local.task_language })
      flow_description             = "${title(each.key)} Messaging Flow"
      operating_hours_holiday      = local.strings.operating_hours_holiday
      operating_hours_closed       = local.strings.operating_hours_closed

  })
  channel_name          = each.key
  janitor_enabled       = true
  master_workflow_sid   = local.task_router_master_workflow_sid
  chat_task_channel_sid = local.task_router_chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  short_helpline        = local.short_helpline
  short_environment     = local.short_environment
}

module "voiceChannel" {
  source = "../../channels/voice-channel"

  count = local.enable_voice_channel ? 1 : 0

  master_workflow_sid        = local.task_router_master_workflow_sid
  voice_task_channel_sid     = module.taskRouter.voice_task_channel_sid
  voice_ivr_language         = local.voice_ivr_language
  voice_ivr_greeting_message = local.strings.voice_ivr_greeting_message
}

moved {
  from = module.voiceChannel
  to   = module.voiceChannel[0]
}

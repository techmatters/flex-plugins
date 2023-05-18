data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${var.environment}/${var.short_helpline}/secrets.json"
}

locals {
  secrets                               = jsondecode(data.aws_ssm_parameter.secrets.value)
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

  permission_config = var.permission_config == "" ? var.short_helpline : var.permission_config

  chatbot_config = data.terraform_remote_state.chatbot.outputs
  chatbots       = local.chatbot_config.chatbots
  hrm_url_map = {
    "development" = {
      "us-east-1" = "https://hrm-development.tl.techmatters.org"
    }
    "staging" = {
      "us-east-1" = "https://hrm-staging.tl.techmatters.org"
      "us-west-1" = "https://hrm-staging-eu.tl.techmatters.org"
    }
    "production" = {
      "us-east-1"    = "https://hrm-production.tl.techmatters.org"
      "eu-west-1"    = "https://hrm-production-eu.tl.techmatters.org"
      "ca-central-1" = "https://hrm-production-ca.tl.techmatters.org"
    }
  }
  

  hrm_url = local.hrm_url_map[var.environment][var.helpline_region]

  stage = "configure"
}

data "terraform_remote_state" "provision" {
  backend = "s3"

  config = {
    bucket = "tl-terraform-state-${var.environment}"
    key    = "twilio/${var.short_helpline}/provision/terraform.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "chatbot" {
  backend = "s3"

  config = {
    bucket = "tl-terraform-state-${var.environment}"
    key    = "twilio/${var.short_helpline}/chatbot/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

// TODO: this module should be moved into its own after_hook that can be called individually.
module "flex" {
  source                    = "../../flex/service-configuration"
  environment               = var.environment
  short_helpline            = var.short_helpline
  stage                     = local.stage
  helpline_language         = var.helpline_language
  twilio_account_sid        = local.secrets.twilio_account_sid
  short_environment         = var.short_environment
  operating_info_key        = var.operating_info_key
  permission_config         = local.permission_config
  definition_version        = var.definition_version
  serverless_url            = local.serverless_url
  multi_office_support      = var.multi_office
  feature_flags             = var.feature_flags
  contacts_waiting_channels = var.contacts_waiting_channels
  #tODO: this needs to be a configuration option
  hrm_url            = local.hrm_url
  resources_base_url = var.resources_base_url
}

module "channel" {
  source                = "../../channels/v1"
  flex_chat_service_sid = local.services_flex_chat_service_sid
  workflow_sids         = local.task_router_workflow_sids
  task_channel_sids     = local.task_router_task_channel_sids
  channel_attributes    = var.channel_attributes
  channels              = var.channels
  chatbots              = local.chatbots
  enable_post_survey    = var.enable_post_survey
  flow_vars             = var.flow_vars
  short_environment     = var.short_environment
  task_language         = var.task_language
  short_helpline        = upper(var.short_helpline)
}



module "twilioChannel" {
  for_each = var.twilio_channels
  source   = "../../channels/twilio-channel"
  /**
   * The big change to make this module configuration driven is that the template file name is passed in as an argument.
   * We then pass in every possible variable that the template file could use. It isn't pretty, but it will work.
   * The underlying template files will need to be refactored to use maps with keys for things like chatbot_sids and `strings` instead
   * of using the variable names directly which will take some work, but should be achievable.
   *
   * We can, eventually, do some more work to the underlying modules to make them a bit more "natively configuration driven",
   * but for the initial pass, this should be sufficient.
   **/
  custom_flow_definition = var.twilio_channel_custom_flow_template != "" ? templatefile(
    var.twilio_channel_custom_flow_template,
    {
      channel_name                 = "${each.key}"
      serverless_url               = local.serverless_url
      serverless_service_sid       = local.serverless_service_sid
      serverless_environment_sid   = local.serverless_environment_production_sid
      operating_hours_function_sid = var.operating_hours_function_sid
      master_workflow_sid          = local.task_router_master_workflow_sid
      chat_task_channel_sid        = local.task_router_chat_task_channel_sid
      channel_attributes           = var.channel_attributes[each.key]
      flow_description             = "${title(each.key)} Messaging Flow"
      pre_survey_bot_sid           = local.chatbots.pre_survey["sid"]
      target_task_name             = var.target_task_name
      operating_hours_holiday      = var.strings["operating_hours_holiday"]
      operating_hours_closed       = var.strings["operating_hours_closed"]
  }) : ""
  channel_contact_identity = each.value.contact_identity
  channel_type             = each.value.channel_type
  pre_survey_bot_sid       = local.chatbots.pre_survey["sid"]
  target_task_name         = var.target_task_name
  channel_name             = each.key
  janitor_enabled          = var.janitor_enabled
  master_workflow_sid      = local.task_router_master_workflow_sid
  chat_task_channel_sid    = local.task_router_chat_task_channel_sid
  flex_chat_service_sid    = local.services_flex_chat_service_sid
}

module "customChannel" {
  for_each = toset(var.custom_channels)
  source   = "../../channels/custom-channel"
  custom_flow_definition = var.custom_channel_custom_flow_template != "" ? templatefile(
    var.custom_channel_custom_flow_template,
    {
      channel_name                 = "${each.key}"
      serverless_url               = local.serverless_url
      serverless_service_sid       = local.serverless_service_sid
      serverless_environment_sid   = local.serverless_environment_production_sid
      operating_hours_function_sid = var.operating_hours_function_sid
      master_workflow_sid          = local.task_router_master_workflow_sid
      chat_task_channel_sid        = local.task_router_chat_task_channel_sid
      channel_attributes           = var.custom_channel_attributes[each.key]
      flow_description             = "${title(each.key)} Messaging Flow"
      operating_hours_holiday      = var.strings["operating_hours_holiday"]
      operating_hours_closed       = var.strings["operating_hours_closed"]

  }) : ""
  channel_name          = each.key
  janitor_enabled       = var.janitor_enabled
  master_workflow_sid   = local.task_router_master_workflow_sid
  chat_task_channel_sid = local.task_router_chat_task_channel_sid
  flex_chat_service_sid = local.services_flex_chat_service_sid
  short_helpline        = upper(var.short_helpline)
  short_environment     = var.short_environment
}

module "voiceChannel" {
  source = "../../channels/voice-channel"

  count = var.enable_voice_channel ? 1 : 0

  master_workflow_sid        = local.task_router_master_workflow_sid
  voice_task_channel_sid     = local.task_router_voice_task_channel_sid
  voice_ivr_language         = var.voice_ivr_language
  voice_ivr_greeting_message = var.strings["voice_ivr_greeting_message"]
}

moved {
  from = module.voiceChannel
  to   = module.voiceChannel[0]
}

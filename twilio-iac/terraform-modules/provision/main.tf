data "aws_ssm_parameter" "secrets" {
  name     = "/terraform/twilio-iac/${var.environment}/${var.short_helpline}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)

  short_env_map = {
    "Development" = "DEV"
    "Staging" = "STG"
    "Production" = "PROD"
  }
  short_environment = local.short_env_map[var.environment]
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}

module "chatbots" {
  source = "../chatbots/default"
  serverless_url = module.serverless.serverless_environment_production_url
}

module "hrmServiceIntegration" {
  source = "../hrmServiceIntegration/default"
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = local.short_environment
}

module "serverless" {
  source = "../serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
}

module "services" {
  source = "../services/default"
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = local.short_environment
}

module "taskRouter" {
  source = "../taskRouter/default"
  serverless_url = module.serverless.serverless_environment_production_url
  helpline = var.helpline
  custom_task_routing_filter_expression = var.custom_task_routing_filter_expression
}

module twilioChannel {
  for_each = var.twilio_channels
  source = "../channels/twilio-channel"
  channel_contact_identity = each.value.contact_identity
  channel_type = each.value.channel_type
  custom_flow_definition = templatefile(
    "../channels/flow-templates/language-mt/with-chatbot.tftpl",
    {
      channel_name = "${each.key}"
      serverless_url=module.serverless.serverless_environment_production_url
      serverless_service_sid = module.serverless.serverless_service_sid
      serverless_environment_sid = module.serverless.serverless_environment_production_sid
      master_workflow_sid = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      chatbot_en_sid = twilio_autopilot_assistants_v1.chatbot_en.sid
      chatbot_mt_sid = twilio_autopilot_assistants_v1.chatbot_mt.sid
      chatbot_ukr_sid = twilio_autopilot_assistants_v1.chatbot_ukr.sid
      chatbot_language_selector_sid = twilio_autopilot_assistants_v1.chatbot_language_selector.sid
      channel_attributes_EN = templatefile("../channels/twilio-channel/channel-attributes-mt/${each.key}-attributes.tftpl",{chatbot_language ="chatbot_EN"})
      channel_attributes_MT = templatefile("../channels/twilio-channel/channel-attributes-mt/${each.key}-attributes.tftpl",{chatbot_language ="chatbot_MT"})
      channel_attributes_UKR = templatefile("../channels/twilio-channel/channel-attributes-mt/${each.key}-attributes.tftpl",{chatbot_language ="chatbot_UKR"})
      flow_description = "${title(each.key)} Messaging Flow"
    })
  target_task_name = var.target_task_name
  channel_name = "${each.key}"
  janitor_enabled = !var.enable_post_survey
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
}

module customChannel {
  for_each = toset(var.custom_channels)
  source = "../channels/custom-channel"
  channel_name = "${each.key}"
  janitor_enabled = true
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  short_helpline = var.short_helpline
  short_environment = local.short_environment
}

# TODO: remove this module when we remove the old flex plugin. Just here for reference
# module flex {
#   source = "../flex/service-configuration"
#   twilio_account_sid = local.secrets.twilio_account_sid
#   short_environment = local.short_environment
#   operating_info_key = var.operating_info_key
#   permission_config = var.short_helpline
#   definition_version = var.definition_version
#   serverless_url = module.serverless.serverless_environment_production_url
#   multi_office_support = var.multi_office
#   feature_flags = var.feature_flags
#   hrm_url = "https://hrm-staging-eu.tl.techmatters.org"
# }

module survey {
  source = "../survey/default"
  helpline = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module aws {
  source = "../aws/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  serverless_url = module.serverless.serverless_environment_production_url
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = local.short_environment
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
  source = "../aws-monitoring/default"
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  cloudwatch_region = "us-east-1"
}

module github {
  source = "../github/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token = local.secrets.twilio_auth_token
  short_environment = local.short_environment
  short_helpline = var.short_helpline
  serverless_url = module.serverless.serverless_environment_production_url
}

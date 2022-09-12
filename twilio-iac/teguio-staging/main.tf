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
locals {
  strings= jsondecode(file("${path.module}/../translations/${var.language}/strings.json"))
  twilio_channels = {
    "facebook" = {"contact_identity" = "messenger:103574689075106" },
    "web" = {"contact_identity" = "" }
  }
  custom_channels=["twitter","instagram"]
}


module "custom_chatbots" {
  source = "../terraform-modules/chatbots/te-guio-co"
  serverless_url = var.serverless_url
}

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
  custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true OR  twilioNumber IN [${join(", ", formatlist("'%s'", var.twilio_numbers))}]"
}

module twilioChannel {
  for_each = local.twilio_channels
  source = "../terraform-modules/channels/twilio-channel"
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/opening-hours/with-chatbot.tftpl",
    {
      channel_name = "${each.key}"
      serverless_url=var.serverless_url
      serverless_environment_sid = var.serverless_environment_sid
      serverless_function_sid = var.serverless_function_sid
      serverless_service_sid = var.serverless_service_sid
      master_workflow_sid = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      channel_attributes = var.custom_channel_attributes != "" ? var.custom_channel_attributes : file("../terraform-modules/channels/twilio-channel/channel-attributes/${each.key}-attributes.tftpl")
      flow_description = "${title(each.key)} Messaging Flow"
      pre_survey_bot_sid = module.custom_chatbots.pre_survey_bot_es_sid
      target_task_name = var.target_task_name
      operating_hours_holiday = local.strings.operating_hours_holiday
      operating_hours_closed = local.strings.operating_hours_closed

    })
  channel_contact_identity = each.value.contact_identity
  pre_survey_bot_sid = module.custom_chatbots.pre_survey_bot_es_sid
  target_task_name = var.target_task_name
  channel_name = "${each.key}"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
}


module customChannel {
  for_each = toset(local.custom_channels)
  source = "../terraform-modules/channels/custom-channel"
  custom_flow_definition = templatefile(
    "../terraform-modules/channels/flow-templates/opening-hours/no-chatbot.tftpl",
    {
      channel_name = "${each.key}"
      serverless_url=var.serverless_url
      serverless_environment_sid = var.serverless_environment_sid
      serverless_function_sid = var.serverless_function_sid
      serverless_service_sid = var.serverless_service_sid
      master_workflow_sid = module.taskRouter.master_workflow_sid
      chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
      channel_attributes = var.custom_channel_attributes != "" ? var.custom_channel_attributes : file("../terraform-modules/channels/custom-channel/channel-attributes/${each.key}-attributes.tftpl")
      flow_description = "${title(each.key)} Messaging Flow"
      operating_hours_holiday = local.strings.operating_hours_holiday
      operating_hours_closed = local.strings.operating_hours_closed

    })
  channel_name = "${each.key}"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  short_helpline = var.short_helpline
  short_environment = var.short_environment
}

module flex {
  source = "../terraform-modules/flex/service-configuration"
  account_sid = var.account_sid
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  permission_config = "co"
  definition_version = var.definition_version
  serverless_url = var.serverless_url
  hrm_url = "https://hrm-test.tl.techmatters.org"
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
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

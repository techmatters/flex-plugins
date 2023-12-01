terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  flow_definition = var.custom_flow_definition != "" ? var.custom_flow_definition : templatefile(
    "${path.module}/../flow-templates/default/with-chatbot.tftpl",
    {
      master_workflow_sid   = var.master_workflow_sid
      chat_task_channel_sid = var.chat_task_channel_sid
      pre_survey_bot_sid    = var.pre_survey_bot_sid
      channel_attributes    = var.custom_channel_attributes != "" ? var.custom_channel_attributes : templatefile("${path.module}/channel-attributes/${var.channel_name}-attributes.tftpl", { task_language = var.task_language })
      flow_description      = "${title(var.channel_name)} Messaging Flow"
      target_task_name      = var.target_task_name
  })
}

resource "twilio_studio_flows_v2" "channel_messaging_flow" {
  friendly_name = "${title(var.channel_name)} Messaging Flow"
  status        = "published"
  definition    = local.flow_definition
}

resource "twilio_flex_flex_flows_v1" "channel_flow" {
  channel_type         = var.channel_type
  chat_service_sid     = var.flex_chat_service_sid
  friendly_name        = "Flex ${title(var.channel_name)} Channel Flow"
  integration_type     = "studio"
  janitor_enabled      = var.janitor_enabled
  contact_identity     = var.channel_contact_identity
  integration_flow_sid = twilio_studio_flows_v2.channel_messaging_flow.sid
  enabled              = true
}

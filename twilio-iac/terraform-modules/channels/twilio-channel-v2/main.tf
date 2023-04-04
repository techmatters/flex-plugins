terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  flow_definition = var.custom_flow_definition !=""? var.custom_flow_definition : templatefile(
    "${path.module}/../flow-templates/default/with-chatbot-v2.tftpl",
    {
      master_workflow_sid = var.master_workflow_sid
      chat_task_channel_sid = var.chat_task_channel_sid
      pre_survey_bot_sid = var.pre_survey_bot_sid
      channel_attributes = var.custom_channel_attributes != "" ? var.custom_channel_attributes : templatefile("${path.module}/channel-attributes/${var.channel_name}-attributes.tftpl",{task_language=var.task_language,address=var.address})
      flow_description = "${title(var.channel_name)} Messaging Flow v2"
      target_task_name = var.target_task_name
    })
}

  resource "twilio_studio_flows_v2" "channel_messaging_flow" {
    friendly_name = "${title(var.channel_name)} Messaging Flow v2"
    status = "published"
    definition = local.flow_definition
  }


  resource "twilio_conversations_configuration_addresses_v1" "conversations_address" {
    type = "${var.channel_type}"
    address = "${var.address}"
    friendly_name = "Flex ${title(var.channel_name)} Conversation Address"
    auto_creation_enabled = true
    auto_creation_type = "studio"
    auto_creation_conversation_service_sid = var.flex_chat_service_sid
    auto_creation_studio_flow_sid = twilio_studio_flows_v2.channel_messaging_flow.sid
  }

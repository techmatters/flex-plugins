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
    "${path.module}/../flow-templates/default/with-chatbot.tftpl",
    {
      master_workflow_sid = var.master_workflow_sid
      chat_task_channel_sid = var.chat_task_channel_sid
      pre_survey_bot_sid = var.pre_survey_bot_sid
      channel_attributes = var.custom_channel_attributes != "" ? var.custom_channel_attributes : file("${path.module}/channel-attributes.tftpl")
      flow_description = "Web Messaging Flow"
      target_task_name = var.target_task_name
    })
}

  resource "twilio_studio_flows_v2" "web_messaging_flow" {
    friendly_name = "Web Messaging Flow"
    status = "published"
    definition = local.flow_definition
  }

  resource "twilio_flex_flex_flows_v1" "web_flow" {
    channel_type  = "web"
    chat_service_sid = var.flex_chat_service_sid
    friendly_name = "Flex Web Channel Flow"
    integration_type = "studio"
    integration_flow_sid = twilio_studio_flows_v2.web_messaging_flow.sid
    enabled = true
  }

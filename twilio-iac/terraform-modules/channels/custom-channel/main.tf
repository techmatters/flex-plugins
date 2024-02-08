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
    "${path.module}/../flow-templates/default/no-chatbot.tftpl",
    {
      master_workflow_sid = var.master_workflow_sid
      chat_task_channel_sid = var.chat_task_channel_sid
      channel_attributes = var.custom_channel_attributes != "" ? var.custom_channel_attributes : templatefile("${path.module}/channel-attributes/${var.channel_name}-attributes.tftpl",{task_language=var.task_language})
      flow_description = "${title(var.channel_name)} Messaging Flow"
    })
}

  resource "twilio_studio_flows_v2" "channel_messaging_flow" {
    friendly_name = "${title(var.channel_name)} Messaging Flow"
    status = "published"
    definition = local.flow_definition
  }

  resource "twilio_flex_flex_flows_v1" "channel_flow" {
    channel_type  = "custom"
    chat_service_sid = var.flex_chat_service_sid
    friendly_name = "Flex ${title(var.channel_name)} Channel Flow"
    integration_type = "studio"
    janitor_enabled = var.janitor_enabled
    contact_identity     = "${var.channel_name}"
    integration_flow_sid = twilio_studio_flows_v2.channel_messaging_flow.sid
    enabled = true
  }

  resource "aws_ssm_parameter" "channel_flex_flow_sid_parameter" {
    name  = "${var.short_environment}_TWILIO_${var.short_helpline}_${upper(var.channel_name)}_FLEX_FLOW_SID"
    type  = "SecureString"
    value = twilio_flex_flex_flows_v1.channel_flow.sid
    description = "${title(var.channel_name)} Flex Flow SID"
  }

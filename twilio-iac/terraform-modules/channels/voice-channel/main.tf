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
    "${path.module}/../flow-templates/default/voice-ivr.tftpl",
    {
      master_workflow_sid = var.master_workflow_sid
      voice_task_channel_sid = var.voice_task_channel_sid
      voice_ivr_language = var.voice_ivr_language
      voice_ivr_greeting_message = var.voice_ivr_greeting_message
      flow_description = "Voice Call Flow"
      channel_attributes = var.custom_channel_attributes != "" ? var.custom_channel_attributes : templatefile("${path.module}/channel-attributes/voice-attributes.tftpl",{})
    })
}

  resource "twilio_studio_flows_v2" "voice_call_flow" {
    friendly_name = "Voice Call Flow"
    status = "published"
    definition = local.flow_definition
  }

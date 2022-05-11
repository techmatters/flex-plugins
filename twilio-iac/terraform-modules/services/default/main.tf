terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.11.1"
    }
  }
}

locals {
  sync_key_provisioner_interpreter = var.local_os == "Windows" ? ["PowerShell", "-Command"] : null
}

resource "twilio_chat_services_v2" "flex_chat_service" {
  friendly_name = var.uses_conversations_service == true ? "Flex Conversation Service" : "Flex Chat Service"
}

resource "twilio_proxy_services_v1" "flex_proxy_service" {
  unique_name = "Flex Proxy Service"
}

resource "twilio_sync_services_v1" "shared_state_service" {
  friendly_name                   = "Shared State Service"
}

resource "null_resource" "sync_api_key" {
  provisioner "local-exec" {
    working_dir = "${path.module}/../../../../scripts"
    command = "npm run twilioResources -- new-key-with-ssm-secret \"Shared State Service\" ${var.short_environment}_TWILIO_${var.short_helpline}_SECRET ${var.helpline} ${var.environment} --an=${var.short_environment}_TWILIO_${var.short_helpline}_API_KEY"
    interpreter = local.sync_key_provisioner_interpreter
  }
}
terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  sync_key_provisioner_interpreter = var.local_os == "Windows" ? ["PowerShell", "-Command"] : null

  cmd_args = var.stage == "" ? "-hd=${basename(abspath(path.root))}" : "-h=${basename(abspath(path.root))} -st=${var.stage} -hl=${var.helpline} -hle=${var.environment}"
}

resource "twilio_chat_services_v2" "flex_chat_service" {
  friendly_name = var.uses_conversation_service == true ? "Flex Conversation Service" : "Flex Chat Service"
}

resource "twilio_proxy_services_v1" "flex_proxy_service" {
  unique_name = "Flex Proxy Service"
}

resource "twilio_sync_services_v1" "shared_state_service" {
  friendly_name = "Shared State Service"
}

resource "null_resource" "sync_api_key" {
  triggers = {
    helpline          = var.helpline
    short_helpline    = var.short_helpline
    environment       = var.environment
    short_environment = var.short_environment
  }
  provisioner "local-exec" {
    working_dir = "${path.module}/../../../../scripts"
    #TODO: this needs to support terragrunt or terraform
    command     = "npm run twilioResources -- new-key-with-ssm-secret ${cmd_args} \"Shared State Service\" ${var.short_environment}_TWILIO_${var.short_helpline}_SECRET \"${var.helpline}\" ${var.environment} --an=${var.short_environment}_TWILIO_${var.short_helpline}_API_KEY"
    interpreter = local.sync_key_provisioner_interpreter
  }
}

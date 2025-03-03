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

  // This cmd_args hackery is temporary until all helplines are migrated to terragrunt or until these scripts are moved to post-apply/after hooks.
  cmd_args = var.stage == "" ? "--helplineDirectory=${basename(abspath(path.root))}" : "--stage=${var.stage} --helplineShortCode=${lower(var.short_helpline)} --helplineEnvironment=${lower(var.environment)}"
}

resource "twilio_chat_services_v2" "flex_chat_service" {
  friendly_name    = var.uses_conversation_service == true ? "Flex Conversation Service" : "Flex Chat Service"
}

resource "twilio_proxy_services_v1" "flex_proxy_service" {
  unique_name                 = "Flex Proxy Service"
  out_of_session_callback_url = ""
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
    working_dir = "/app/scripts"
    #TODO: this needs to support terragrunt or terraform
    command     = "npm run twilioResources -- new-key-with-ssm-secret --ssmRole=\"arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}\" ${local.cmd_args} \"Shared State Service\" ${var.short_environment}_TWILIO_${upper(var.short_helpline)}_SECRET \"${var.helpline}\" ${var.environment} --an=${var.short_environment}_TWILIO_${upper(var.short_helpline)}_API_KEY"
    interpreter = local.sync_key_provisioner_interpreter
    environment = {
      LOG_LEVEL = "debug"
    }
  }
}

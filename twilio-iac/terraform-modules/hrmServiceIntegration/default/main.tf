locals {
  sync_key_provisioner_interpreter = var.local_os == "Windows" ? ["PowerShell", "-Command"] : null

  cmd_args = var.stage == "" ? "--helplineDirectory=${basename(abspath(path.root))}" : "--stage=${var.stage} --helplineShortCode=${var.helpline} --helplineEnvironment=${var.environment}"
}

resource "null_resource" "hrm_static_api_key" {
  triggers = {
    helpline          = var.helpline
    short_helpline    = var.short_helpline
    environment       = var.environment
    short_environment = var.short_environment
  }
  provisioner "local-exec" {
    working_dir = "${path.module}/../../../../scripts"
    command     = "npm run twilioResources -- new-key-with-ssm-secret ${local.cmd_args} hrm-static-key ${var.short_environment}_TWILIO_${var.short_helpline}_HRM_STATIC_KEY \"${var.helpline}\" ${var.environment}"
    interpreter = local.sync_key_provisioner_interpreter
  }
}

locals {
  sync_key_provisioner_interpreter = var.local_os == "Windows" ? ["PowerShell", "-Command"] : null
}

resource "null_resource" "hrm_static_api_key" {
  triggers = {
    helpline = var.helpline
    short_code = var.short_code
    environment = var.environment
    short_environment = var.short_environment
  }
  provisioner "local-exec" {
    working_dir = "${path.module}/../../../../scripts"
    command = "npm run twilioResources -- new-key-with-ssm-secret hrm-static-key ${var.short_environment}_TWILIO_${var.short_code}_HRM_STATIC_KEY \"${var.helpline}\" ${var.environment} ${basename(abspath(path.root))}"
    interpreter = local.sync_key_provisioner_interpreter
  }
}

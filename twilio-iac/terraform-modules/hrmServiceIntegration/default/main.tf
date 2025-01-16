locals {
  sync_key_provisioner_interpreter = var.local_os == "Windows" ? ["PowerShell", "-Command"] : null

  // This cmd_args hackery is temporary until all helplines are migrated to terragrunt or until these scripts are moved to post-apply/after hooks.
  cmd_args = var.stage == "" ? "--helplineDirectory=${basename(abspath(path.root))}" : "--stage=${var.stage} --helplineShortCode=${lower(var.short_helpline)} --helplineEnvironment=${lower(var.environment)}"
}

resource "null_resource" "hrm_static_api_key" {
  triggers = {
    helpline          = var.helpline
    short_helpline    = var.short_helpline
    environment       = var.environment
    short_environment = var.short_environment
  }
  provisioner "local-exec" {
    working_dir = "/app/scripts"
    command     = "npm run twilioResources -- new-key-with-ssm-secret --ssmRole=\"arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}\" ${local.cmd_args} hrm-static-key ${var.short_environment}_TWILIO_${var.short_helpline}_HRM_STATIC_KEY \"${var.helpline}\" ${var.environment}"
    interpreter = local.sync_key_provisioner_interpreter
    environment = {
      LOG_LEVEL = "debug"
    }
  }
}

data "aws_ssm_parameter" "hrm_static_api_key_legacy" {
  name     = "${var.short_environment}_TWILIO_${var.short_helpline}_HRM_STATIC_KEY"
  depends_on = null_resource.hrm_static_api_key
}

resource "aws_ssm_parameter" "hrm_static_api_key_v2" {
  name        = "/${lower(var.environment)}/twilio/${var.twilio_account_sid}/static_key"
  type        = "SecureString"
  value       = data.aws_ssm_parameter.hrm_static_api_key_legacy
  description = "Twilio API Key"

  tags = {
    Environment = lower(var.environment)
    Name        = "/${lower(var.environment)}/twilio/${var.twilio_account_sid}/static_key"
    Terraform   = true
  }
}

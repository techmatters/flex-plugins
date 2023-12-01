
data "aws_ssm_parameter" "twilio_account_sid" {
  name = "/${var.environment}/twilio/${upper(var.short_helpline)}/account_sid"
}

data "aws_ssm_parameter" "docs_bucket_name" {
  name = "/${lower(var.environment)}/s3/${nonsensitive(local.twilio_account_sid)}/docs_bucket_name"
}

locals {
  twilio_account_sid = data.aws_ssm_parameter.twilio_account_sid.value
  bucket_name        = data.aws_ssm_parameter.docs_bucket_name.value
}

module "external_recordings" {
  count = var.enable_external_recordings ? 1 : 0

  source             = "../../external-recordings"
  short_helpline     = upper(var.short_helpline)
  short_environment  = var.short_environment
  environment        = var.environment
  bucket_name        = local.bucket_name
  twilio_account_sid = local.twilio_account_sid
}

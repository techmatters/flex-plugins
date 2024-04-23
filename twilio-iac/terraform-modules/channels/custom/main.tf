

provider "aws" {
  alias  = "bucket"
  region = var.ssm_region
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "alb_http_listener_arn" {
  provider = aws.bucket
  name = "/${var.environment}/hrm/http/${var.region}/alb-listener-https-arn"
}

module "message_lambdas" {
  source = "../message-handler-lambda"
  for_each = toset(var.message_handler_lambdas)
  channel = var.channel
  name = each.value
  environment = var.environment
  region = var.region
  short_region = var.short_region
  policy_template = ""
}
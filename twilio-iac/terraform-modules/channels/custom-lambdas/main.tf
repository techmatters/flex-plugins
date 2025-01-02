data "aws_ssm_parameter" "alb_http_listener_arn" {
  name = "/${var.environment}/hrm/http/${var.region}/alb-listener-https-arn"
}

module "message_lambdas" {
  source           = "../message-handler-lambda"
  for_each         = toset(var.message_handler_lambdas)
  channel          = var.channel
  name             = each.value
  environment      = var.environment
  region           = var.region
  short_helpline   = var.short_helpline
  policy_template  = ""
  alb_listener_arn = data.aws_ssm_parameter.alb_http_listener_arn.value
  priority         = var.base_priority + index(var.message_handler_lambdas, each.value)
}
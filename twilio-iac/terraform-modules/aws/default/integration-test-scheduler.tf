data "aws_caller_identity" "current" {}

data "terraform_remote_state" "microservices" {
  backend = "s3"

  config = {
    bucket   = "tl-terraform-state-${lower(var.environment)}"
    key      = "infrastructure-config/${var.helpline_region}/microservices/terraform.tfstate"
    region   = "us-east-1"
    role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/tf-twilio-iac-${lower(var.environment)}"
  }
}

locals {
  integration_test_lambda_name = data.terraform_remote_state.microservices.outputs.twilio_global_lambda_functions["integrationTestRunner"].function_name
  integration_test_lambda_arn  = data.terraform_remote_state.microservices.outputs.twilio_global_lambda_functions["integrationTestRunner"].function_arn
}

resource "aws_cloudwatch_event_rule" "integration_test_event_rule" {
  count               = var.enable_integration_tests ? 1 : 0
  name                = "${local.integration_test_lambda_name}-event-rule-${lower(var.short_helpline)}"
  schedule_expression = var.integration_test_lambda_schedule
}

resource "aws_cloudwatch_event_target" "integration_test_event_target_job" {
  count    = var.enable_integration_tests ? 1 : 0
  arn      = local.integration_test_lambda_arn
  rule     = aws_cloudwatch_event_rule.integration_test_event_rule[0].name
  input    = jsonencode({
    "testFilter" = "tests/${lower(var.short_helpline)}"
  })
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_integration_test_lambda" {
  count         = var.enable_integration_tests ? 1 : 0
  statement_id  = "AllowExecutionFromCloudWatchIntegrationTest"
  action        = "lambda:InvokeFunction"
  function_name = local.integration_test_lambda_name
  principal     = "events.amazonaws.com" // use default bus
  source_arn    = aws_cloudwatch_event_rule.integration_test_event_rule[0].arn
}

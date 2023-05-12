terraform {
  required_providers {
    awscc = {
      source  = "hashicorp/awscc"
      version = "0.52.0"
    }
  }
}

data "aws_caller_identity" "current" {}

resource "awscc_lex_bot" "this" {
  name = "${var.environment}-${var.helpline}"
  # role_arn = aws_iam_service_linked_role.lex_service_role.arn
  role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-service-role/lexv2.amazonaws.com/AWSServiceRoleForLexV2Bots"
  data_privacy = {
    child_directed = var.lex_config.child_directed
  }
  idle_session_ttl_in_seconds = var.lex_config.idle_session_ttl_in_seconds
  bot_locales                 = var.lex_config.bot_locales
}

output "lex_config" {
  value = var.lex_config
}

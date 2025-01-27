terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.84.0"
    }
  }
}

locals {
  name_prefix = "${var.environment}_${var.short_helpline}_${var.language}"
}

data "aws_iam_role" "role-lex-v2-bot" {
  name = "role-lex-v2-bot"
}

resource "aws_lexv2models_bot" "test_bot" {
  for_each = var.bots
  name     = replace("${local.name_prefix}_${each.key}", "2", "")
  description = "Example description"
  data_privacy {
    child_directed = true
  }
  idle_session_ttl_in_seconds = 60
  role_arn                    = data.aws_iam_role.role-lex-v2-bot.arn
  type                        = "Bot"

  tags = {
    foo = "bar"
  }
}

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
  name = "lex-v2-bot"
}

resource "aws_lexv2models_bot" "this" {
  for_each = var.bots
  name     = replace("${local.name_prefix}_${each.key}", "2", "")
  description = each.value.description
  data_privacy {
    child_directed = true
  }
  idle_session_ttl_in_seconds = 60
  role_arn                    = data.aws_iam_role.role-lex-v2-bot.arn
  type                        = "Bot"

  tags = {
    foo = "terraform"
  }
}

resource "aws_lexv2models_bot_locale" "this" {
  for_each                         = var.bots
  bot_id                           = aws_lexv2models_bot.this["${each.key}"].id
  bot_version                      = "DRAFT"
  locale_id                        = "en_US"
  n_lu_intent_confidence_threshold = 0.70
}

resource "aws_lexv2models_bot_version" "this" {
  bot_id = aws_lexv2models_bot.this["${each.key}"].id
  locale_specification = {
    "en_US" = {
      source_bot_version = "DRAFT"
    }
  }
}

resource "aws_lexv2models_intent" "this" {
  bot_id      = aws_lexv2models_bot.this["${each.key}"].id
  bot_version = aws_lexv2models_bot_locale.this.bot_version
  name        = "${each.key}_intent"
  locale_id   = aws_lexv2models_bot_locale.this.locale_id
}

resource "aws_lexv2models_slot" "this" {
  bot_id      = aws_lexv2models_bot.this["${each.key}"].id
  bot_version = aws_lexv2models_bot_version.this["${each.key}"].bot_version
  intent_id   = aws_lexv2models_intent.this["${each.key}"].id
  locale_id   = aws_lexv2models_bot_locale.this["${each.key}"].locale_id
  name        = "${each.key}_slot"
}
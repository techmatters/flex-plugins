terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = [aws.hl-region]
    }

  }
}

data "aws_caller_identity" "current" {}

locals {
  name_prefix = "${var.environment}_${var.short_helpline}_${var.language}"
}

resource "aws_lex_slot_type" "this" {
  for_each = var.slot_types

  provider = aws.hl-region

  name                     = "${local.name_prefix}_${each.key}"
  description              = each.value.description
  value_selection_strategy = each.value.value_selection_strategy

  dynamic "enumeration_value" {
    for_each = each.value.values
    content {
      value    = enumeration_value.key
      synonyms = enumeration_value.value.synonyms
    }
  }
}

resource "aws_lex_intent" "this" {
  for_each = var.intents

  provider = aws.hl-region

  name        = "${local.name_prefix}_${each.key}"
  description = each.value.description

  sample_utterances = each.value.sample_utterances

  conclusion_statement {
    message {
      content      = each.value.conclusion_statement.content
      content_type = each.value.conclusion_statement.content_type
    }
  }

  fulfillment_activity {
    type = each.value.fulfillment_activity.type
  }

  ## rejection statement requires confirmation_prompt, and I don't think we really want either
  # rejection_statement {
  #   message {
  #     content      = each.value.rejection_statement.content
  #     content_type = each.value.rejection_statement.content_type
  #   }
  # }

  dynamic "slot" {
    for_each = each.value.slots

    content {
      description = slot.value.description
      name        = slot.key
      priority    = slot.value.priority

      slot_constraint   = slot.value.slot_constraint
      slot_type         = "${local.name_prefix}_${slot.value.slot_type}"
      slot_type_version = aws_lex_slot_type.this[slot.value.slot_type].version

      value_elicitation_prompt {
        max_attempts = slot.value.value_elicitation_prompt.max_attempts

        message {
          content      = slot.value.value_elicitation_prompt.content
          content_type = slot.value.value_elicitation_prompt.content_type
        }
      }
    }
  }
}


resource "aws_lex_bot" "this" {
  for_each = var.bots

  provider = aws.hl-region

  name                        = "${local.name_prefix}_${each.key}"
  description                 = each.value.description
  locale                      = each.value.locale
  process_behavior            = each.value.process_behavior
  create_version              = false
  idle_session_ttl_in_seconds = each.value.idle_session_ttl_in_seconds

  #   By specifying true to child_directed, you confirm that your use of Amazon Lex is related to a website,
  #   program, or other application that is directed or targeted, in whole or in part, to
  #   children under age 13 and subject to COPPA.
  #   https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lex_bot#child_directed
  child_directed = each.value.child_directed

  abort_statement {
    message {
      content      = each.value.abort_statement.content
      content_type = each.value.abort_statement.content_type
    }
  }


  clarification_prompt {
    max_attempts = 2

    message {
      content      = each.value.clarification_prompt.content
      content_type = each.value.clarification_prompt.content_type
    }
  }

  dynamic "intent" {
    for_each = each.value.intents
    content {
      intent_name    = "${local.name_prefix}_${each.key}_${intent.value}"
      intent_version = aws_lex_intent.this[intent.value].version
    }
  }
}

resource "aws_lex_bot_alias" "this" {
  for_each = var.bots

  provider    = aws.hl-region
  bot_name    = "${local.name_prefix}_${each.key}"
  bot_version = "$LATEST"
  description = "Bot alias"
  name        = "latest"
}

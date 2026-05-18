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

  # AWS Lex requires intent names to match a specific regular expression 
  # that doesn’t allow numbers or certain special characters. Unfortunately, this restriction is imposed by AWS, 
  # and I cannot directly override it. AWS Lex has specific naming requirements for intents, slots, and bot names 
  # and Terraform enforces these requirements when you create resources.
  # So a work-around for the e2e account was to replace the "[0-9]" with the no space "" 

  name                     = replace("${local.name_prefix}_${each.key}", "/[0-9]/", "")
  description              = each.value.description
  value_selection_strategy = each.value.value_selection_strategy

  dynamic "enumeration_value" {
    for_each = {
      for idx, value in each.value.values :
      idx => value if(length(value.synonyms) != 0)
    }
    content {
      value    = enumeration_value.key
      synonyms = enumeration_value.value.synonyms
    }
  }
  dynamic "enumeration_value" {
    for_each = {
      for idx, value in each.value.values :
      idx => value if(length(value.synonyms) == 0)
    }
    content {
      value    = enumeration_value.key
    }
  }

}

resource "aws_lex_intent" "this" {
  for_each = var.intents

  provider = aws.hl-region

  name        = replace("${local.name_prefix}_${each.key}", "2", "")
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
      slot_type         = !startswith(slot.value.slot_type, "AMAZON.") ? replace("${local.name_prefix}_${slot.value.slot_type}", "2", "") : slot.value.slot_type
      slot_type_version = !startswith(slot.value.slot_type, "AMAZON.") ? aws_lex_slot_type.this[slot.value.slot_type].version : null
     

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

  name                        = replace("${local.name_prefix}_${each.key}", "2", "")
  description                 = each.value.description
  locale                      = each.value.locale
  process_behavior            = each.value.process_behavior
  create_version              = false
  idle_session_ttl_in_seconds = each.value.idle_session_ttl_in_seconds
  enable_model_improvements   = each.value.enable_model_improvements

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
    max_attempts = each.value.clarification_prompt.max_attempts

    message {
      content      = each.value.clarification_prompt.content
      content_type = each.value.clarification_prompt.content_type
    }
  }

  dynamic "intent" {
    for_each = each.value.intents
    content {
      intent_name    = replace("${local.name_prefix}_${intent.value}", "2", "")
      intent_version = aws_lex_intent.this[intent.value].version
    }
  }
}

resource "aws_lex_bot_alias" "this" {
  for_each = var.bots

  provider    = aws.hl-region
  bot_name    = aws_lex_bot.this[each.key].name
  bot_version = "$LATEST"
  description = "Bot alias for ${aws_lex_bot.this[each.key].name}"
  name        = "latest"
}

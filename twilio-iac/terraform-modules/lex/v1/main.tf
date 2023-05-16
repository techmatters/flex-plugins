data "aws_caller_identity" "current" {}

resource "aws_lex_slot_type" "this" {
  for_each = var.slot_types

  name                     = "${var.name}_${each.key}"
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
  for_each    = var.intents
  name        = "${var.name}_${each.key}"
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
      slot_type         = slot.value.slot_type
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


resource "aws_lex_bot" "aselo_development_bot" {
  name                        = var.name
  description                 = var.description
  locale                      = var.locale
  process_behavior            = var.process_behavior
  create_version              = true
  idle_session_ttl_in_seconds = var.idle_session_ttl_in_seconds

  #   By specifying true to child_directed, you confirm that your use of Amazon Lex is related to a website,
  #   program, or other application that is directed or targeted, in whole or in part, to
  #   children under age 13 and subject to COPPA.
  #   https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lex_bot#child_directed
  child_directed = var.child_directed

  abort_statement {
    message {
      content      = var.abort_statement.content
      content_type = var.abort_statement.content_type
    }
  }


  clarification_prompt {
    max_attempts = 2

    message {
      content      = var.clarification_prompt.content
      content_type = var.clarification_prompt.content_type
    }
  }

  dynamic "intent" {
    for_each = var.intents
    content {
      intent_name    = intent.key
      intent_version = aws_lex_intent.this[intent.key].version
    }
  }
}

# resource "aws_lex_bot_alias" "aselo_development" {
#   bot_name    = "AseloDevSurvey"
#   bot_version = "1"
#   description = "Aselo Development Version of the Wechat Bot."
#   name        = "AseloDevSurveyBot"
# }

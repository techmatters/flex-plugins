resource "aws_lex_intent" "post_survey_intent" { 

  name           = "post_survey"
  description    = "Intent for aselo development post_survey webchat"
  version        = "$LATEST"

  sample_utterances = [
    "The counsellor has left the chat. Thank you for reaching out. Please contact us again if you need more help.",
  ]

  slot {
    description = "answerQuestions"
    name        = "answerQuestions"
    priority    = 1

    slot_constraint   = "Required"
    slot_type         = aws_lex_slot_type.yes_no
    slot_type_version = aws_lex_slot_type.yes_no.version

    value_elicitation_prompt {
      max_attempts = 2

      message {
        content      = "Before you leave, would you be willing to answer a few questions about the service you received today? Please answer Yes or No."
        content_type = "PlainText"
      }
    }
  }

  slot {
    description = "wasHelpful"
    name        = "wasHelpful"
    priority    = 2

    slot_constraint   = "Required"
    slot_type         = aws_lex_slot_type.yes_no
    slot_type_version = aws_lex_slot_type.yes_no.version

    value_elicitation_prompt {
      max_attempts = 2

      message {
        content      = "Did you find this conversation helpful? Please answer Yes or No."
        content_type = "PlainText"
      }
    }
  }

  slot {
    description = "wouldRecommend"
    name        = "wouldRecommend"
    priority    = 3

    slot_constraint   = "Required"
    slot_type         = aws_lex_slot_type.yes_no
    slot_type_version = aws_lex_slot_type.yes_no.version

    value_elicitation_prompt {
      max_attempts = 2

      message {
        content      = "Based on this conversation, would you recommend that someone in a similar situation contact us? Please answer Yes or No."
        content_type = "PlainText"
      }
    }
  }

  closing_response {
    max_attempts = 2

    message {
      content      = "Thank you for reaching out. Please contact us again if you need more help."
      content_type = "PlainText"
    }
  }
}
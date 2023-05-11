resource "aws_lex_intent" "survey_intent" { 

  name           = "Survey"
  description    = "Intent for aselo development webchat"
  version        = "$LATEST"

  sample_utterances = [
    "H",
    "Hi",
    "Hello",
    "Help",
    "I need help",
    "Pls",
    "Please",
    "Life",
    "Not safe",
    "Kill",
    "Hurt",
    "Me",
    "Incoming webchat contact",
  ]

  initial_response {
    max_attempts = 2

    message {
      content      = "Welcome to the helpline. To help us better serve you, please answer the following three questions."
      content_type = "PlainText"
    }
  }

  fulfillment_activity {
    type = "ReturnIntent"
  }

  rejection_statement {
    message {
      content      = "Okay, I will not place your order."
      content_type = "PlainText"
    }
  }

  slot {
    description = "Caller is calling for self or not"
    name        = "callerType"
    priority    = 1

    slot_constraint   = "Required"
    slot_type         = aws_lex_slot_type.caller_types.name
    slot_type_version = aws_lex_slot_type.caller_types.version

    value_elicitation_prompt {
      max_attempts = 2

      message {
        content      = "Are you calling about yourself? Please answer Yes or No."
        content_type = "PlainText"
      }
    }
  }

  slot {
    description = "Caller's age"
    name        = "age"
    priority    = 2

    slot_constraint   = "Required"
    slot_type         = aws_lex_slot_type.age.name
    slot_type_version = aws_lex_slot_type.age.version

    value_elicitation_prompt {
      max_attempts = 2

      message {
        content      = "Thank you. You can say ‘prefer not to answer’ (or type X) to any question."
        content_type = "PlainText"
      }

      message {
        content      = "How old are you?"
        content_type = "PlainText"
      }
    }
  }

  slot {
    description = "Caller's gender"
    name        = "gender"
    priority    = 3

    slot_constraint   = "Required"
    slot_type         = aws_lex_slot_type.gender.name
    slot_type_version = aws_lex_slot_type.gender.version

    value_elicitation_prompt {
      max_attempts = 2

      message {
        content      = "What is your gender?"
        content_type = "PlainText"
      }
    }
  }

  closing_response {
    max_attempts = 2

    message {
      content      = "We'll transfer you now. Please hold for a counsellor."
      content_type = "PlainText"
    }
  }
}
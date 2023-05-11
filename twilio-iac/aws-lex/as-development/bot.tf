resource "aws_lex_bot" "aselo_development_bot" {
  abort_statement {
    message {
      content      = "Sorry, I didn't understand that. Please try again."
      content_type = "PlainText"
    }
  }

#   By specifying true to child_directed, you confirm that your use of Amazon Lex is related to a website, 
#   program, or other application that is directed or targeted, in whole or in part, to 
#   children under age 13 and subject to COPPA. 
#   https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lex_bot#child_directed

  child_directed = true

  clarification_prompt {
    max_attempts = 2

    message {
      content      = "Sorry, I didn't understand that. Please try again."
      content_type = "PlainText"
    }
  }

  create_version              = false
  description                 = "Bot for contacting helplines via webchat"
  idle_session_ttl_in_seconds = 600

  intent {
    intent_name    = aws_lex_intent.survey_intent.name
    intent_version = aws_lex_intent.survey_intent.version
  }

  locale           = "en-US"
  name             = "Survey"
  process_behavior = "BUILD"
}
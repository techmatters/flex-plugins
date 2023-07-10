variable "environment" {
  description = "The environment for the helpline."
  type        = string
}

variable "helpline_region" {
  type        = string
  description = "The region for the helpline."
}

variable "short_helpline" {
  description = "The short code for the helpline."
  type        = string
}

variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "lex_bot_languages" {
  description = "The configuration for the lex bots."
  type = map(object({

    slot_types = optional(map(object({
      description              = string
      value_selection_strategy = string
      values = map(object({
        synonyms = optional(list(string), []),
      }))
    })), null)

    intents = optional(map(object({
      description       = string
      sample_utterances = list(string)
      fulfillment_activity = object({
        type = string
      })
      conclusion_statement = object({
        content      = string
        content_type = string
      })
      rejection_statement = object({
        content      = string
        content_type = string
      })
      slots = map(object({
        priority        = number
        description     = string
        slot_constraint = string
        slot_type       = string
        value_elicitation_prompt = object({
          max_attempts = number
          content      = string
          content_type = string
        })
      }))
    })), null)

    bots = optional(map(object({
      description                 = string
      locale                      = optional(string, "en-US")
      process_behavior            = optional(string, "BUILD")
      child_directed              = optional(bool, true)
      idle_session_ttl_in_seconds = optional(number, 600)
      enable_model_improvements   = optional(bool, true)
      abort_statement = object({
        content      = string
        content_type = string
      })
      clarification_prompt = object({
        max_attempts = number
        content      = string
        content_type = string
      })
      intents = list(string)
    })), null)

  }))
}

// Used for lex v2 via awscc leaving here for now
variable "lex_v2_config" {
  type = object({
    child_directed              = optional(bool, true),
    idle_session_ttl_in_seconds = optional(number, 1500),
    bot_locales = list(object({
      locale_id                = string,
      nlu_confidence_threshold = number,
      slot_types = list(object({
        name = string,
        slot_type_values = list(object({
          sample_value = optional(object({
            value    = string
            synonyms = optional(list(string), null)
          }), null),
        })),
        value_selection_setting = object({
          resolution_strategy = string
        })
      })),
      intents = list(object({
        name        = string,
        description = string,
        sample_utterances = list(object({
          utterance = string
        })),
        slot_priorities = list(object({
          priority  = number,
          slot_name = string
        })),
        slots = list(object({
          name           = string,
          description    = optional(string, null),
          slot_type_name = string,
          obfuscation_setting = optional(object({
            obfuscation_setting_type = string,
          }), null),
          value_elicitation_setting = optional(object({
            slot_constraint = string,
            prompt_specification = optional(object({
              max_retries = number,
              message_groups_list = list(object({
                message = object({
                  plain_text_message = object({
                    value = string
                  })
                })
              }))
            }), null)
          }), null)
        }))
      }))
    }))
  })

  default = null
}

variable "environment" {
  description = "The environment for the helpline."
  type        = string
}

variable "short_helpline" {
  description = "The short code for the helpline."
  type        = string
}

variable "helpline" {
  description = "The human readable helpline name."
  type        = string
}

variable "lex_config" {
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
}

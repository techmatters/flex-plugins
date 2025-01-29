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

variable "language" {
  description = "The language for the lex bot."
  type        = string
}

variable "slot_types" {
  description = "The slot types for the helpline."
  type = map(object({
    description              = string
    value_selection_strategy = string
    values = map(object({
      synonyms = optional(list(string), []),
    }))
  }))
}

variable "intents" {
  description = "The intents for the helpline."
  type = map(object({
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
  }))
}

variable "lex_v2_bots" {
  description = "The bots for the helpline."
  type = map(object({
    description                 = string
    locale                      = optional(string, "en-US")
    child_directed              = optional(bool, true)
    idle_session_ttl_in_seconds = optional(number, 300)
    type                        = optional(string, "Bot")
  }))
  default = null
  }

variable "lex_v2_intents" {
  description = "The intents for the helpline."
  type = map(object({
    description       = string
    sampleUtterances = list(string)
    slotPriorities = list(object({
      priority  = number
      slotName = string
    }))
    intentClosingSetting = object({
      closingResponse = object({
        messageGroups = object({
          message = object({
            plainTextMessage = object({
              value = string
            })
          })
        })
        allowInterrupt = bool
      })
      active = bool
      nextStep = object({
        dialogAction = object({
          type = string
        })
      
      })
    })
    initialResponseSetting = object({
      initialResponse = object({
        messageGroups = object({
          message = object({
            plainTextMessage = object({
              value = string
            })
          })
        })
        allowInterrupt = bool
      })
      nextStep = object({
        dialogAction = object({
          type = string
        })
      })
      codeHook = object({
        enableCodeHookInvocation = bool
        active = bool
        postCodeHookSpecification = object({
          successNextStep = object({
            dialogAction = object({
              type = string
              slotToElicit = string
            })
          })
        })
        failureNextStep = object({
          dialogAction = object({
            type = string
          })
        })
        timeoutNextStep = object({
          dialogAction = object({
            type = string
          })
        })
      })
    })

  }))
}

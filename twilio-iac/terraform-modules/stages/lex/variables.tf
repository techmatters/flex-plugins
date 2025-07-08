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
  type    = map(list(string))
  default = {}
}
variable "lex_v2_bot_languages" {
  type    = map(list(string))
  default = {}
}

variable "lex_slot_types" {
  description = "The slot types for the helpline."
  type = map(map(object({
    description              = string
    value_selection_strategy = string
    values = map(object({
      synonyms = optional(list(string), []),
    }))
  })))
}

variable "lex_intents" {
  description = "The intents for the helpline."
  type = map(map(object({
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
  })))
}

variable "lex_bots" {
  description = "The bots for the helpline."
  type = map(map(object({
    description                 = string
    locale                      = optional(string, "en-US")
    process_behavior            = optional(string, "BUILD")
    child_directed              = optional(bool, true)
    idle_session_ttl_in_seconds = optional(number, 300)
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
  })))
}

variable "enable_lex_v2" {
  description = "Flag to enable or disable the lex_v2 module"
  type        = bool
  default     = false
}

variable "lex_v2_bots" {
  description = "The bots for the helpline."
  type = map(map(object({
    description                 = string
    locale                      = optional(string, "en-US")
    child_directed              = optional(bool, true)
    idle_session_ttl_in_seconds = optional(number, 300)
    type                        = optional(string, "Bot")
    production_bot_alias_id     = optional(string, "TSTALIASID")
    staging_bot_alias_id        = optional(string, "TSTALIASID")
  })))
  default = null
  }

  variable "lex_v2_slot_types" {
  description = "The slot types for the helpline."
  type = map(list(
   object({
      bot_name = string
      config = object({
        slotTypeName = string,
        parentSlotTypeSignature = optional(string)
        valueSelectionSetting = object({
          resolutionStrategy = string
          regexFilter = optional(object({
            pattern = string
          }))
        })
        slotTypeValues = list( object({
          sampleValue = object({
            value    = string
          })
          synonyms = optional(list(object(
              {
                value = string
              }
            )), null)
        }))
      })  
    })
    ))
}
variable "lex_v2_intents" {
  description = "The intents for the helpline."
  default = {}
  type = map(list(
    object({
      bot_name = string
      config = object({
        intentName             = string
        description       = string
        sampleUtterances = optional(list(object( {utterance = string})))
        slotPriorities = optional(list(object({
          priority  = number
          slotName = string
        })))
        fulfillmentCodeHook = optional(object({
          enabled = bool
          active = optional(bool)
          postFulfillmentStatusSpecification = optional(object({
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
            successNextStep = object({
            dialogAction = object({
              type = string
            })
          })
          }))
          
        }))
        intentClosingSetting = object({
          closingResponse = optional(object({
            messageGroups = list(object({
              message = object({
                plainTextMessage = object({
                  value = string
                })
              })
            }))
            allowInterrupt = bool
          })
          )
          active = bool
          nextStep = optional(object({
            dialogAction = object({
              type = string
            })
          
          }))
        })
        initialResponseSetting = optional(object({
          initialResponse = optional(object({
            messageGroups = list(object({
              message = object({
                plainTextMessage = object({
                  value = string
                })
              })
            }))
            allowInterrupt = bool
          }))
          nextStep = optional(object({
            dialogAction = object({
              type = string
            })
          }))
          codeHook = optional(object({
            enableCodeHookInvocation = bool
            active = bool
            postCodeHookSpecification = object({
              successNextStep = object({
                dialogAction = object({
                  type = string
                  slotToElicit = string
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
          }))
        })
      )
      })
  })))
}


variable "lex_v2_slots" {
  description = "List of Lex V2 slots"
  type = map(list(
    object({
      bot_name = string
      config = object({
      slotName     = string
      slotTypeName = string
      description  = string
      intentName   = string
      valueElicitationSetting = object({
        slotConstraint = string
        promptSpecification = optional(object({
          messageGroups = list(object({
            message = object({
              plainTextMessage = object({
                value = string
              })
            })
             variations = optional(list(object({
              plainTextMessage = object({
                value = string
              })
            })), [])
          }))
          maxRetries                 = number
          allowInterrupt             = bool
          messageSelectionStrategy   = string
          promptAttemptsSpecification = optional(map(object({
            allowInterrupt = bool
            allowedInputTypes = object({
              allowAudioInput = bool
              allowDTMFInput  = bool
            })
            audioAndDTMFInputSpecification = optional(object({
              startTimeoutMs = number
              audioSpecification = optional(object({
                maxLengthMs = number
                endTimeoutMs = number
              }))
              dtmfSpecification = optional(object({
                maxLength          = number
                endTimeoutMs       = number
                deletionCharacter  = string
                endCharacter       = string
              }))
            }))
            textInputSpecification = optional(object({
              startTimeoutMs = number
            }))
          })))
        }))
       slotCaptureSetting = optional(object({
          captureNextStep = object({
            dialogAction = map(any)
            intent = optional(map(string))
          })
          failureResponse = optional(object({
            messageGroups = list(object({
              message = object({
                plainTextMessage = object({
                  value = string
                })
              })
            }))
            allowInterrupt = bool
          }))
          failureNextStep = object({
            dialogAction = map(any)
            intent = optional(map(string)) 
          })
          elicitationCodeHook = optional(object({
            enableCodeHookInvocation = bool
          }))
        }))
      })
    })
}))
  )

}
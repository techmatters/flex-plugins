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

variable "lex_v2_slot_types" {
  description = "The slot types for the helpline."
  type = list(
   object({
      bot_name = string
      config = object({
        slotTypeName = string,
        valueSelectionSetting = object({
          resolutionStrategy = string
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
    )
}

variable "lex_v2_intents" {
  description = "The intents for the helpline."
  type = list(
    object({
      bot_name = string
      config = object({
        intentName             = string
        description       = string
        sampleUtterances = optional(list(object( {utterance = string})))
        /*slotPriorities = list(object({
          priority  = number
          slotName = string
        }))*/
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
        initialResponseSetting =optional(object({
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
        }))
      })
    

  }))
}

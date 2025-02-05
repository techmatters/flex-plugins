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
        slotPriorities = optional(list(object({
          priority  = number
          slotName = string
        })))
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
        fulfillmentCodeHook = optional(object({
          enabled = bool
          active = bool
          postFulfillmentStatusSpecification = object({
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
          successNextStep = object({
            dialogAction = object({
              type = string
            })
          })
        }))
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
    

  }))
}


variable "lex_v2_slots" {
  description = "List of Lex V2 slots"
  type = list(
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
            dialogAction = object({
              type = string
            })
            intent = optional(map(string)) # Placeholder for intent object
          })
          failureResponse = object({
            messageGroups = list(object({
              message = object({
                plainTextMessage = object({
                  value = string
                })
              })
            }))
            allowInterrupt = bool
          })
          failureNextStep = object({
            dialogAction = object({
              type         = string
              slotToElicit = optional(string)
            })
            intent = optional(map(string)) # Placeholder for intent object
          })
          elicitationCodeHook = optional(object({
            enableCodeHookInvocation = bool
          }))
        }))
      })
    })
})

)
}
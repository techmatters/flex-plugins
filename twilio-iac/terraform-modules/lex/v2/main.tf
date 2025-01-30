terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "5.84.0"
    }
  }
}

locals {
  name_prefix = "${var.environment}_${var.short_helpline}_${var.language}"
}

data "aws_iam_role" "role-lex-v2-bot" {
  name = "lex-v2-bot"
}

resource "aws_lexv2models_bot" "this" {
  for_each = var.lex_v2_bots
  name     = replace("${local.name_prefix}_${each.key}", "2", "")
  description = each.value.description
  data_privacy {
    child_directed = each.value.child_directed
  }
  idle_session_ttl_in_seconds = each.value.idle_session_ttl_in_seconds
  role_arn                    = data.aws_iam_role.role-lex-v2-bot.arn
  type                        = each.value.type

  tags = {
    foo = "terraform"
  }
}

resource "aws_lexv2models_bot_locale" "this" {
  for_each                         = var.lex_v2_bots
  bot_id                           = aws_lexv2models_bot.this["${each.key}"].id
  bot_version                      = "DRAFT"
  locale_id                        = each.value.locale
  n_lu_intent_confidence_threshold = 0.70
}

resource "aws_lexv2models_bot_version" "this" {
  for_each                         = var.lex_v2_bots
  bot_id = aws_lexv2models_bot.this["${each.key}"].id
  locale_specification = {
    "en_US" = {
      source_bot_version = "DRAFT"
    }
  }
}

resource "aws_lexv2models_slot_type" "this" {
  for_each = {
    for idx, slot_type in var.lex_v2_slot_types :
    "${slot_type.bot_name}_${slot_type.config.slotTypeName}" => slot_type
  }
  bot_id                           = aws_lexv2models_bot.this["${each.value.bot_name}"].id
  bot_version                      = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].bot_version
  name                             = "${each.value.config.slotTypeName}"
  locale_id                        = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].locale_id

  value_selection_setting {
    resolution_strategy = each.value.config.valueSelectionSetting.resolutionStrategy
  }

  dynamic "slot_type_values" {
    for_each = each.value.config.slotTypeValues
    content {
      sample_value {
        value = slot_type_values.value.sampleValue.value
      }
      
      dynamic "synonyms" {
        for_each =  slot_type_values.value.synonyms != null ? slot_type_values.value.synonyms : []
        content {
          value = synonyms.value.value
        }
      }
    }
  }

}

output "slot_types" {
    value = {
        for_each = {
        for idx, slot_type in var.lex_v2_slot_types :
        "${slot_type.bot_name}_${slot_type.config.slotTypeName}" => slot_type
    }     
  }
}




resource "aws_lexv2models_intent" "this" {
  for_each = {
    for idx, intent in var.lex_v2_intents :
    "${intent.bot_name}_${intent.config.name}" => intent
  }
  bot_id         = aws_lexv2models_bot.this["${each.value.bot_name}"].id
  bot_version    = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].bot_version
  name           = "${each.value.config.name}"
  locale_id      = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].locale_id
  
  dynamic "sample_utterance" {
  for_each = each.value.config.sampleUtterances
  content {
      utterance = sample_utterance.value

  }
}
  

  /*
  dynamic "slot_priorities" {
    for_each = each.value.config.slotPriorities
      slot_priority {
        priority = slot_priorities.value.priority
        slot_id = aws_lexv2models_slot.this["${slot_priorities.value.slot_name}"].id
      }
  }
*/

  closing_setting {
    active = each.value.config.intentClosingSetting.active
    closing_response {
      allow_interrupt = each.value.config.intentClosingSetting.closingResponse.allowInterrupt
      message_group {
        message {
          plain_text_message {
            value = each.value.config.intentClosingSetting.closingResponse.messageGroups.message.plainTextMessage.value
          }
        } 
      }
    }
    next_step {
      dialog_action {
        type = each.value.config.intentClosingSetting.nextStep.dialogAction.type
      }
    }
  }
  initial_response_setting {
    initial_response {
      allow_interrupt = each.value.config.initialResponseSetting.initialResponse.allowInterrupt
      message_group {
        message {
          plain_text_message {
            value = each.value.config.initialResponseSetting.initialResponse.messageGroups.message.plainTextMessage.value
          }
        }
      }
    }
    next_step {
      dialog_action {
        type = each.value.config.initialResponseSetting.nextStep.dialogAction.type
      }
    }
    code_hook {
      enable_code_hook_invocation = each.value.config.initialResponseSetting.codeHook.enableCodeHookInvocation
      active = each.value.config.initialResponseSetting.codeHook.active
      post_code_hook_specification {
        success_next_step {
          dialog_action {
            type = each.value.config.initialResponseSetting.codeHook.postCodeHookSpecification.successNextStep.dialogAction.type
          }
        }
        failure_next_step {
          dialog_action {
            type = each.value.config.initialResponseSetting.codeHook.postCodeHookSpecification.failureNextStep.dialogAction.type
          }
        }
        timeout_next_step {
          dialog_action {
            type = each.value.config.initialResponseSetting.codeHook.postCodeHookSpecification.timeoutNextStep.dialogAction.type
          }
        }
      }
    }

  }




}
/*
resource "aws_lexv2models_slot" "this" {
  for_each                         = var.lex_v2_bots
  bot_id      = aws_lexv2models_bot.this["${each.key}"].id
  bot_version = aws_lexv2models_bot_locale.this["${each.key}"].bot_version
  intent_id   = split(":", aws_lexv2models_intent.this["${each.key}"].id)[0] 
  locale_id   = aws_lexv2models_bot_locale.this["${each.key}"].locale_id
  name        = "${each.key}_slot"

  value_elicitation_setting {
    slot_constraint = "Required"
    prompt_specification {
      allow_interrupt            = true
      max_retries                = 1
      message_selection_strategy = "Random"

      message_group {
        message {
          plain_text_message {
            value = "What is your favorite color?"
          }
        }
      }

      prompt_attempts_specification {
        allow_interrupt = true
        map_block_key   = "Initial"

        allowed_input_types {
          allow_audio_input = true
          allow_dtmf_input  = true
        }

        audio_and_dtmf_input_specification {
          start_timeout_ms = 4000
          audio_specification {
            max_length_ms = 15000
            end_timeout_ms = 640
          }
          dtmf_specification {
            max_length = 513
            end_timeout_ms = 5000
            deletion_character = "*"
            end_character = "#"
          }
          
        }
        text_input_specification {
          start_timeout_ms = 30000
        }
      }

      prompt_attempts_specification {
        allow_interrupt = true
        map_block_key   = "Retry1"

       allowed_input_types {
          allow_audio_input = true
          allow_dtmf_input  = true
        }

        audio_and_dtmf_input_specification {
          start_timeout_ms = 4000
          audio_specification {
            max_length_ms = 15000
            end_timeout_ms = 640
          }
          dtmf_specification {
            max_length = 513
            end_timeout_ms = 5000
            deletion_character = "*"
            end_character = "#"
          }
          
        }

        text_input_specification {
          start_timeout_ms = 30000
        }
      }

    }
  }
}
*/


/*
aws lexv2-models describe-bot --bot-id C6HUSTIFBR

{
    "botId": "C6HUSTIFBR",
    "botName": "PreSurveyBot-test",
    "roleArn": "arn:aws:iam::712893914485:role/aws-service-role/lexv2.amazonaws.com/AWSServiceRoleForLexV2Bots_3KBQGRB7KCE",
    "dataPrivacy": {
        "childDirected": true
    },
    "idleSessionTTLInSeconds": 43200,
    "botStatus": "Available",
    "creationDateTime": 1677858700.336,
    "lastUpdatedDateTime": 1683820369.397,
    "botType": "Bot"
}

aws lexv2-models describe-bot-locale --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US
{
    "botId": "C6HUSTIFBR",
    "botVersion": "DRAFT",
    "localeId": "en_US",
    "localeName": "English (US)",
    "nluIntentConfidenceThreshold": 0.4,
    "voiceSettings": {
        "voiceId": "Ivy",
        "engine": "neural"
    },
    "intentsCount": 2,
    "slotTypesCount": 3,
    "botLocaleStatus": "Built",
    "creationDateTime": 1677858910.877,
    "lastUpdatedDateTime": 1677858914.677,
    "lastBuildSubmittedDateTime": 1686174053.068
}



aws lexv2-models describe-intent --intent-id PBKSDSQGK0 --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US

{
    "intentId": "PBKSDSQGK0",
    "intentName": "Survey",
    "sampleUtterances": [
        {
            "utterance": "Hi"
        },
        {
            "utterance": "Hello"
        },
        {
            "utterance": "H"
        },
        {
            "utterance": "I need help"
        },
        {
            "utterance": "help"
        },
        {
            "utterance": "Incoming webchat contact"
        },
        {
            "utterance": "pls"
        },
        {
            "utterance": "Please"
        },
        {
            "utterance": "kill"
        },
        {
            "utterance": "hurt"
        },
        {
            "utterance": "me"
        }
    ],
    "fulfillmentCodeHook": {
        "enabled": false,
        "active": false
    },
    "slotPriorities": [
        {
            "priority": 1,
            "slotId": "SRUIBWMLXU"
        },
        {
            "priority": 2,
            "slotId": "1WMLGAXGMT"
        },
        {
            "priority": 3,
            "slotId": "QG013POPRB"
        }
    ],
    "intentClosingSetting": {
        "closingResponse": {
            "messageGroups": [
                {
                    "message": {
                        "plainTextMessage": {
                            "value": "We'll transfer you now. Please hold for a counsellor."
                        }
                    }
                }
            ],
            "allowInterrupt": true
        },
        "active": true,
        "nextStep": {
            "dialogAction": {
                "type": "EndConversation"
            },
            "intent": {}
        }
    },
    "botId": "C6HUSTIFBR",
    "botVersion": "DRAFT",
    "localeId": "en_US",
    "creationDateTime": 1683614725.968,
    "lastUpdatedDateTime": 1686174051.879,
    "initialResponseSetting": {
        "initialResponse": {
            "messageGroups": [
                {
                    "message": {
                        "plainTextMessage": {
                            "value": "Welcome to the helpline. To help us better serve you, please answer the following three questions."
                        }
                    }
                }
            ],
            "allowInterrupt": true
        },
        "nextStep": {
            "dialogAction": {
                "type": "InvokeDialogCodeHook"
            },
            "intent": {}
        },
        "codeHook": {
            "enableCodeHookInvocation": true,
            "active": true,
            "postCodeHookSpecification": {
                "successNextStep": {
                    "dialogAction": {
                        "type": "ElicitSlot",
                        "slotToElicit": "CallerType"
                    },
                    "intent": {}
                },
                "failureNextStep": {
                    "dialogAction": {
                        "type": "EndConversation"
                    },
                    "intent": {}
                },
                "timeoutNextStep": {
                    "dialogAction": {
                        "type": "EndConversation"
                    },
                    "intent": {}
                }
            }
        }
    }
}
aws lexv2-models describe-slot --intent-id PBKSDSQGK0 --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US
{
    "slotId": "1WMLGAXGMT",
    "slotName": "age",
    "slotTypeId": "UMWO7VEHGT",
    "valueElicitationSetting": {
        "slotConstraint": "Required",
        "promptSpecification": {
            "messageGroups": [
                {
                    "message": {
                        "plainTextMessage": {
                            "value": "Thank you. You can say ‘prefer not to answer’ (or type X) to any question."
                        }
                    }
                },
                {
                    "message": {
                        "plainTextMessage": {
                            "value": "How old are you? "
                        }
                    },
                    "variations": []
                }
            ],
            "maxRetries": 4,
            "allowInterrupt": true,
            "messageSelectionStrategy": "Random",
            "promptAttemptsSpecification": {
                "Initial": {
                    "allowInterrupt": true,
                    "allowedInputTypes": {
                        "allowAudioInput": true,
                        "allowDTMFInput": true
                    },
                    "audioAndDTMFInputSpecification": {
                        "startTimeoutMs": 4000,
                        "audioSpecification": {
                            "maxLengthMs": 15000,
                            "endTimeoutMs": 640
                        },
                        "dtmfSpecification": {
                            "maxLength": 513,
                            "endTimeoutMs": 5000,
                            "deletionCharacter": "*",
                            "endCharacter": "#"
                        }
                    },
                    "textInputSpecification": {
                        "startTimeoutMs": 30000
                    }
                },
                "Retry1": {
                    "allowInterrupt": true,
                    "allowedInputTypes": {
                        "allowAudioInput": true,
                        "allowDTMFInput": true
                    },
                    "audioAndDTMFInputSpecification": {
                        "startTimeoutMs": 4000,
                        "audioSpecification": {
                            "maxLengthMs": 15000,
                            "endTimeoutMs": 640
                        },
                        "dtmfSpecification": {
                            "maxLength": 513,
                            "endTimeoutMs": 5000,
                            "deletionCharacter": "*",
                            "endCharacter": "#"
                        }
                    },
                    "textInputSpecification": {
                        "startTimeoutMs": 30000
                    }
                },
                "Retry2": {
                    "allowInterrupt": true,
                    "allowedInputTypes": {
                        "allowAudioInput": true,
                        "allowDTMFInput": true
                    },
                    "audioAndDTMFInputSpecification": {
                        "startTimeoutMs": 4000,
                        "audioSpecification": {
                            "maxLengthMs": 15000,
                            "endTimeoutMs": 640
                        },
                        "dtmfSpecification": {
                            "maxLength": 513,
                            "endTimeoutMs": 5000,
                            "deletionCharacter": "*",
                            "endCharacter": "#"
                        }
                    },
                    "textInputSpecification": {
                        "startTimeoutMs": 30000
                    }
                },
                "Retry3": {
                    "allowInterrupt": true,
                    "allowedInputTypes": {
                        "allowAudioInput": true,
                        "allowDTMFInput": true
                    },
                    "audioAndDTMFInputSpecification": {
                        "startTimeoutMs": 4000,
                        "audioSpecification": {
                            "maxLengthMs": 15000,
                            "endTimeoutMs": 640
                        },
                        "dtmfSpecification": {
                            "maxLength": 513,
                            "endTimeoutMs": 5000,
                            "deletionCharacter": "*",
                            "endCharacter": "#"
                        }
                    },
                    "textInputSpecification": {
                        "startTimeoutMs": 30000
                    }
                },
                "Retry4": {
                    "allowInterrupt": true,
                    "allowedInputTypes": {
                        "allowAudioInput": true,
                        "allowDTMFInput": true
                    },
                    "audioAndDTMFInputSpecification": {
                        "startTimeoutMs": 4000,
                        "audioSpecification": {
                            "maxLengthMs": 15000,
                            "endTimeoutMs": 640
                        },
                        "dtmfSpecification": {
                            "maxLength": 513,
                            "endTimeoutMs": 5000,
                            "deletionCharacter": "*",
                            "endCharacter": "#"
                        }
                    },
                    "textInputSpecification": {
                        "startTimeoutMs": 30000
                    }
                }
            }
        },
        "sampleUtterances": [
            {
                "utterance": "Yeah"
            },
            {
                "utterance": "Yea"
            },
            {
                "utterance": "Y"
            },
            {
                "utterance": "N"
            },
            {
                "utterance": "No"
            },
            {
                "utterance": "Na"
            },
            {
                "utterance": "Nah"
            },
            {
                "utterance": "Nooo"
            },
            {
                "utterance": "Yah"
            }
        ],
        "slotCaptureSetting": {
            "captureNextStep": {
                "dialogAction": {
                    "type": "ElicitSlot",
                    "slotToElicit": "gender"
                },
                "intent": {}
            },
            "failureResponse": {
                "messageGroups": [
                    {
                        "message": {
                            "plainTextMessage": {
                                "value": "Sorry, I didn't understand that. Please respond with a number."
                            }
                        }
                    }
                ],
                "allowInterrupt": true
            },
            "failureNextStep": {
                "dialogAction": {
                    "type": "ElicitSlot",
                    "slotToElicit": "age"
                },
                "intent": {}
            },
            "elicitationCodeHook": {
                "enableCodeHookInvocation": true
            }
        }
    },
    "botId": "C6HUSTIFBR",
    "botVersion": "DRAFT",
    "localeId": "en_US",
    "intentId": "PBKSDSQGK0",
    "creationDateTime": 1683615199.088,
    "lastUpdatedDateTime": 1683820222.651
}



 aws lexv2-models list-slots --intent-id PBKSDSQGK0 --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US --slot-id 1WMLGAXGMT
{
    "botId": "C6HUSTIFBR",
    "botVersion": "DRAFT",
    "localeId": "en_US",
    "intentId": "PBKSDSQGK0",
    "slotSummaries": [
        {
            "slotId": "1WMLGAXGMT",
            "slotName": "age",
            "slotConstraint": "Required",
            "slotTypeId": "UMWO7VEHGT",
            "valueElicitationPromptSpecification": {
                "messageGroups": [
                    {
                        "message": {
                            "plainTextMessage": {
                                "value": "Thank you. You can say ‘prefer not to answer’ (or type X) to any question."
                            }
                        }
                    },
                    {
                        "message": {
                            "plainTextMessage": {
                                "value": "How old are you? "
                            }
                        },
                        "variations": []
                    }
                ],
                "maxRetries": 4,
                "allowInterrupt": true,
                "messageSelectionStrategy": "Random",
                "promptAttemptsSpecification": {
                    "Initial": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry1": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry2": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry3": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry4": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    }
                }
            }
        },
        {
            "slotId": "QG013POPRB",
            "slotName": "gender",
            "slotConstraint": "Required",
            "slotTypeId": "BYJ3H59AY2",
            "valueElicitationPromptSpecification": {
                "messageGroups": [
                    {
                        "message": {
                            "plainTextMessage": {
                                "value": "What is your gender??"
                            }
                        }
                    }
                ],
                "maxRetries": 4,
                "allowInterrupt": true,
                "messageSelectionStrategy": "Random",
                "promptAttemptsSpecification": {
                    "Initial": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry1": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry2": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry3": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry4": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    }
                }
            }
        },
        {
            "slotId": "SRUIBWMLXU",
            "slotName": "CallerType",
            "slotConstraint": "Required",
            "slotTypeId": "M5DBSHPUGQ",
            "valueElicitationPromptSpecification": {
                "messageGroups": [
                    {
                        "message": {
                            "plainTextMessage": {
                                "value": "Are you calling about yourself? Please answer Yes or No."
                            }
                        }
                    }
                ],
                "maxRetries": 4,
                "allowInterrupt": true,
                "messageSelectionStrategy": "Random",
                "promptAttemptsSpecification": {
                    "Initial": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry1": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry2": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry3": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    },
                    "Retry4": {
                        "allowInterrupt": true,
                        "allowedInputTypes": {
                            "allowAudioInput": true,
                            "allowDTMFInput": true
                        },
                        "audioAndDTMFInputSpecification": {
                            "startTimeoutMs": 4000,
                            "audioSpecification": {
                                "maxLengthMs": 15000,
                                "endTimeoutMs": 640
                            },
                            "dtmfSpecification": {
                                "maxLength": 513,
                                "endTimeoutMs": 5000,
                                "deletionCharacter": "*",
                                "endCharacter": "#"
                            }
                        },
                        "textInputSpecification": {
                            "startTimeoutMs": 30000
                        }
                    }
                }
            }
        }
    ]
}

aws lexv2-models list-slot-types --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US
{
    "botId": "C6HUSTIFBR",
    "botVersion": "DRAFT",
    "localeId": "en_US",
    "slotTypeSummaries": [
        {
            "slotTypeId": "BYJ3H59AY2",
            "slotTypeName": "Gender",
            "lastUpdatedDateTime": 1683634802.813,
            "slotTypeCategory": "Custom"
        },
        {
            "slotTypeId": "M5DBSHPUGQ",
            "slotTypeName": "CallerTypes",
            "lastUpdatedDateTime": 1683626651.811,
            "slotTypeCategory": "Custom"
        },
        {
            "slotTypeId": "UMWO7VEHGT",
            "slotTypeName": "Age",
            "lastUpdatedDateTime": 1683625784.009,
            "slotTypeCategory": "Custom"
        }
    ]
}
aws lexv2-models describe-slot-type --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US --slot-type-id BYJ3H59AY2

{
    "slotTypeId": "BYJ3H59AY2",
    "slotTypeName": "Gender",
    "slotTypeValues": [
        {
            "sampleValue": {
                "value": "Boy"
            },
            "synonyms": [
                {
                    "value": "Boy"
                },
                {
                    "value": "Male"
                },
                {
                    "value": "Dude"
                },
                {
                    "value": "Guy"
                },
                {
                    "value": "Man"
                },
                {
                    "value": "M"
                },
                {
                    "value": "He"
                }
            ]
        },
        {
            "sampleValue": {
                "value": "Girl"
            },
            "synonyms": [
                {
                    "value": "Woman"
                },
                {
                    "value": "Lady"
                },
                {
                    "value": "Female"
                },
                {
                    "value": "She"
                },
                {
                    "value": "F"
                }
            ]
        },
        {
            "sampleValue": {
                "value": "Non-Binary"
            },
            "synonyms": [
                {
                    "value": "None"
                },
                {
                    "value": "non binary"
                }
            ]
        },
        {
            "sampleValue": {
                "value": "Unknown"
            },
            "synonyms": [
                {
                    "value": "x"
                },
                {
                    "value": "not sure"
                }
            ]
        },
        {
            "sampleValue": {
                "value": "prefer not to answer"
            }
        }
    ],
    "valueSelectionSetting": {
        "resolutionStrategy": "TopResolution"
    },
    "botId": "C6HUSTIFBR",
    "botVersion": "DRAFT",
    "localeId": "en_US",
    "creationDateTime": 1677861117.996,
    "lastUpdatedDateTime": 1683634802.813
}


*/
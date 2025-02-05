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
  intent_slot_pairs = flatten([
    for intent in var.lex_v2_intents : [
      for slot in intent.config.slotPriorities : {
        bot_name     = intent.bot_name
        intent_name  = intent.config.intentName
        priority     = slot.priority
        slot_name    = slot.slotName
      }
    ]
  ])
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

/*
If a bot is deleted it might not delete the DRAFT version (this is a bug).
We can't import it because it fails a constraint that it needs to be a number (this is bug).
We can't delete it from the console nor using the API AWS command.
What I ended up doing was to comment this next resource and the reference in the resource that follows
*/

resource "aws_lexv2models_bot_version" "this" {
  for_each                         = var.lex_v2_bots
  bot_id = aws_lexv2models_bot.this["${each.key}"].id
  locale_specification = {
    "en_US" = {
      source_bot_version = "DRAFT"
    }
  }
}

resource "aws_lexv2models_bot_locale" "this" {
  for_each                         = var.lex_v2_bots
  bot_id                           = aws_lexv2models_bot.this["${each.key}"].id
  bot_version                      = "DRAFT"
  locale_id                        = each.value.locale
  n_lu_intent_confidence_threshold = 0.70
  depends_on = [aws_lexv2models_bot.this, aws_lexv2models_bot_version.this]
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


/*
Intents are pretty buggy, nothing is actually added to the intent when the resource is created. *facepalm*
*/

resource "aws_lexv2models_intent" "this" {
  for_each = {
    for idx, intent in var.lex_v2_intents :
    "${intent.bot_name}_${intent.config.intentName}" => intent
  }
    bot_id         = aws_lexv2models_bot.this["${each.value.bot_name}"].id
    bot_version    = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].bot_version
    name           = "${each.value.config.intentName}"
    locale_id      = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].locale_id
    
    dynamic "sample_utterance" {
        for_each =  each.value.config.sampleUtterances != null ? each.value.config.sampleUtterances : []
        content {
            utterance = sample_utterance.value.utterance

        }
    }
  

    closing_setting {
        active = each.value.config.intentClosingSetting.active
        dynamic "closing_response" {
            for_each = each.value.config.intentClosingSetting.closingResponse != null ? [each.value.config.intentClosingSetting.closingResponse] : []
            content {
                allow_interrupt = closing_response.value.allowInterrupt
                message_group {
                    dynamic "message" {
                        for_each = closing_response.value.messageGroups
                        content {
                            plain_text_message {
                            value = message.value.message.plainTextMessage.value
                            }
                        }
                    }
                } 
            }
        }
        dynamic "next_step" {
            for_each = each.value.config.intentClosingSetting.nextStep != null ? [each.value.config.intentClosingSetting.nextStep] : []
            content{
                dialog_action {
                    type = next_step.value.dialogAction.type
                }
            }
        }
    }
    
  
    dynamic "initial_response_setting" {
        for_each = each.value.config.initialResponseSetting != null ? [each.value.config.initialResponseSetting] : []
        content {
            dynamic "initial_response" {
                for_each = each.value.config.initialResponseSetting.initialResponse != null ? [each.value.config.initialResponseSetting.initialResponse] : []
                content {
                allow_interrupt = initial_response_setting.value.initialResponse.allowInterrupt
                message_group {
                    dynamic "message" {
                        for_each = initial_response_setting.value.initialResponse.messageGroups
                        content {
                            plain_text_message {
                            value = message.value.message.plainTextMessage.value
                            }
                        }
                    }
                }
                }
            }
            next_step {
            dialog_action {
                type = initial_response_setting.value.nextStep.dialogAction.type
            }
            }
            code_hook {
                enable_code_hook_invocation =initial_response_setting.value.codeHook.enableCodeHookInvocation
                active = each.value.config.initialResponseSetting.codeHook.active
                post_code_hook_specification {
                    success_next_step {
                        dialog_action {
                            type = initial_response_setting.value.codeHook.postCodeHookSpecification.successNextStep.dialogAction.type
                        }
                    }
                    failure_next_step {
                        dialog_action {
                            type = initial_response_setting.value.codeHook.postCodeHookSpecification.failureNextStep.dialogAction.type
                        }
                    }
                    timeout_next_step {
                        dialog_action {
                            type = initial_response_setting.value.codeHook.postCodeHookSpecification.timeoutNextStep.dialogAction.type
                        }
                    }
                }
            }
        }
  
    }
}

resource "aws_lexv2models_slot" "this" {
  for_each = {
    for idx, slot in var.lex_v2_slots :
    "${slot.config.intentName}_${slot.config.slotName}" => slot
  }

  bot_id      = aws_lexv2models_bot.this["${each.value.bot_name}"].id
  bot_version = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].bot_version
  intent_id   = split(":", aws_lexv2models_intent.this["${each.value.bot_name}_${each.value.config.intentName}"].id)[0] 
  locale_id   = aws_lexv2models_bot_locale.this["${each.value.bot_name}"].locale_id
  name        = each.value.config.slotName
  slot_type_id = split(",", aws_lexv2models_slot_type.this["${each.value.bot_name}_${each.value.config.slotTypeName}"].id)[3]
  description  = each.value.config.description

  value_elicitation_setting {
    slot_constraint = each.value.config.valueElicitationSetting.slotConstraint

    dynamic "prompt_specification" {
      for_each = each.value.config.valueElicitationSetting.promptSpecification != null ? [each.value.config.valueElicitationSetting.promptSpecification] : []
      content {
        allow_interrupt           = prompt_specification.value.allowInterrupt
        max_retries               = prompt_specification.value.maxRetries
        message_selection_strategy = prompt_specification.value.messageSelectionStrategy

        message_group {
            dynamic "message" {
                for_each = prompt_specification.value.messageGroups
                content {
                    plain_text_message {
                    value = message.value.message.plainTextMessage.value
                    }
                }
            }
        }

        dynamic "prompt_attempts_specification" {
          for_each = prompt_specification.value.promptAttemptsSpecification
          content {
            map_block_key = prompt_attempts_specification.key
            allow_interrupt = prompt_attempts_specification.value.allowInterrupt

            allowed_input_types {
              allow_audio_input = prompt_attempts_specification.value.allowedInputTypes.allowAudioInput
              allow_dtmf_input  = prompt_attempts_specification.value.allowedInputTypes.allowDTMFInput
            }

            dynamic "audio_and_dtmf_input_specification" {
              for_each = prompt_attempts_specification.value.audioAndDTMFInputSpecification != null ? [prompt_attempts_specification.value.audioAndDTMFInputSpecification] : []
              content {
                start_timeout_ms = audio_and_dtmf_input_specification.value.startTimeoutMs

                dynamic "audio_specification" {
                  for_each = audio_and_dtmf_input_specification.value.audioSpecification != null ? [audio_and_dtmf_input_specification.value.audioSpecification] : []
                  content {
                    max_length_ms = audio_specification.value.maxLengthMs
                    end_timeout_ms = audio_specification.value.endTimeoutMs
                  }
                }

                dynamic "dtmf_specification" {
                  for_each = audio_and_dtmf_input_specification.value.dtmfSpecification != null ? [audio_and_dtmf_input_specification.value.dtmfSpecification] : []
                  content {
                    max_length         = dtmf_specification.value.maxLength
                    end_timeout_ms     = dtmf_specification.value.endTimeoutMs
                    deletion_character = dtmf_specification.value.deletionCharacter
                    end_character      = dtmf_specification.value.endCharacter
                  }
                }
              }
            }

            dynamic "text_input_specification" {
              for_each = prompt_attempts_specification.value.textInputSpecification != null ? [prompt_attempts_specification.value.textInputSpecification] : []
              content {
                start_timeout_ms = text_input_specification.value.startTimeoutMs
              }
            }
          }
        }
      }
    }
 
    /*
    This is actually documented in the structure, but it is not supported by terraform, no explanation as to why this is *facepalm*
    */
  /*
    dynamic "capture_setting" {
      for_each = each.value.config.valueElicitationSetting.slotCaptureSetting != null ? [each.value.config.valueElicitationSetting.slotCaptureSetting] : []
      content {
        capture_next_step {
          dialog_action {
            type = capture_setting.value.captureNextStep.dialogAction.type
          }
        }

        failure_response {
          allow_interrupt = capture_setting.value.failureResponse.allowInterrupt

          dynamic "message_groups" {
            for_each = capture_setting.value.failureResponse.messageGroups
            content {
              message {
                plain_text_message {
                  value = message_groups.value.message.plainTextMessage.value
                }
              }
            }
          }
        }

        failure_next_step {
          dialog_action {
            type         = capture_setting.value.failureNextStep.dialogAction.type
            slot_to_elicit = capture_setting.value.failureNextStep.dialogAction.slotToElicit
          }
        }

        elicitation_code_hook {
          enable_code_hook_invocation = capture_setting.value.elicitationCodeHook.enableCodeHookInvocation
        }
      }
    }
    */
  }
}

/*
There is a circular dependency here between slots and intents.
A slot needs to be created with an intent id, and an intent needs to be created with the slot priorities.
Since I can't reference the slot ids when creating the intent I need to update the intent with the slot priorities as the last step.
This command doesn't always work, sometimes it only add just one dependency, so I usually run the apply twice.

 */
resource "null_resource" "update_intent_slots" {
    triggers = {
        always_run = timestamp()
    }
    for_each = { for item in local.intent_slot_pairs : "${item.bot_name}_${item.intent_name}_${item.slot_name}" => item }

    provisioner "local-exec" {
        command = <<EOT
        aws lexv2-models update-intent \
        --bot-id ${aws_lexv2models_bot.this[each.value.bot_name].id} \
        --bot-version ${aws_lexv2models_bot_locale.this[each.value.bot_name].bot_version} \
        --locale-id ${aws_lexv2models_bot_locale.this[each.value.bot_name].locale_id} \
        --intent-id ${split(":", aws_lexv2models_intent.this["${each.value.bot_name}_${each.value.intent_name}"].id)[0]} \
        --intent-name ${each.value.intent_name} \
        --slot-priorities "[{\"priority\": ${each.value.priority}, \"slotId\": \"${split(",", aws_lexv2models_slot.this["${each.value.intent_name}_${each.value.slot_name}"].id)[4]}\"}]"
        EOT
    }
    depends_on = [
    aws_lexv2models_intent.this,
    aws_lexv2models_slot.this
  ]
}

resource "null_resource" "add_intent_utterances" {
    triggers = {
        always_run = timestamp()
    }
    for_each = {
    for idx, intent in var.lex_v2_intents :
    "${intent.bot_name}_${intent.config.intentName}" => intent
  }
    provisioner "local-exec" {
        command = <<EOT
        aws lexv2-models update-intent \
        --bot-id ${aws_lexv2models_bot.this[each.value.bot_name].id} \
        --bot-version ${aws_lexv2models_bot_locale.this[each.value.bot_name].bot_version} \
        --locale-id ${aws_lexv2models_bot_locale.this[each.value.bot_name].locale_id} \
        --intent-id ${split(":", aws_lexv2models_intent.this["${each.value.bot_name}_${each.value.config.intentName}"].id)[0]} \
        --intent-name ${each.value.config.intentName} \
        --sample-utterances "${each.value.config.sampleUtterances}"
        EOT
    }
    depends_on = [
    aws_lexv2models_intent.this,
    aws_lexv2models_slot.this
  ]
}






/*
aws lexv2-models describe-bot --bot-id C6HUSTIFBR

{
    "botId": "C6HUSTIFBR",
    "botName": "PreSurveyBot-test",
    "roleArn": "arn:aws:iam::123123123:role/aws-service-role/lexv2.amazonaws.com/AWSServiceRoleForLexV2Bots_3KBQGRB7KCE",
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



aws lexv2-models describe-intent --intent-id IOCGXECPOX --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US

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
aws lexv2-models describe-slot --intent-id PBKSDSQGK0 --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US --slot-id QG013POPRB
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
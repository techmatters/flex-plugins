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
  for_each = var.bots
  name     = replace("${local.name_prefix}_${each.key}", "2", "")
  description = each.value.description
  data_privacy {
    child_directed = true
  }
  idle_session_ttl_in_seconds = 60
  role_arn                    = data.aws_iam_role.role-lex-v2-bot.arn
  type                        = "Bot"

  tags = {
    foo = "terraform"
  }
}

resource "aws_lexv2models_bot_locale" "this" {
  for_each                         = var.bots
  bot_id                           = aws_lexv2models_bot.this["${each.key}"].id
  bot_version                      = "DRAFT"
  locale_id                        = "en_US"
  n_lu_intent_confidence_threshold = 0.70
}

resource "aws_lexv2models_bot_version" "this" {
  for_each                         = var.bots
  bot_id = aws_lexv2models_bot.this["${each.key}"].id
  locale_specification = {
    "en_US" = {
      source_bot_version = "DRAFT"
    }
  }
}

resource "aws_lexv2models_intent" "this" {
  for_each                         = var.bots
  bot_id      = aws_lexv2models_bot.this["${each.key}"].id
  bot_version = aws_lexv2models_bot_locale.this["${each.key}"].bot_version
  name        = "${each.key}_intent"
  locale_id   = aws_lexv2models_bot_locale.this["${each.key}"].locale_id
}

resource "aws_lexv2models_slot" "this" {
  for_each                         = var.bots
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
          allow_audio_input = false
          allow_dtmf_input  = false
        }

        text_input_specification {
          start_timeout_ms = 30000
        }
      }

      prompt_attempts_specification {
        allow_interrupt = true
        map_block_key   = "Retry1"

        allowed_input_types {
          allow_audio_input = false
          allow_dtmf_input  = false
        }

        text_input_specification {
          start_timeout_ms = 30000
        }
      }

    }
  }
}

resource "aws_lexv2models_slot_type" "this" {
  for_each                         = var.bots
  bot_id      = aws_lexv2models_bot.this["${each.key}"].id
  bot_version = aws_lexv2models_bot_locale.this["${each.key}"].bot_version
  name        = "${each.key}_slot_type"
  locale_id   = aws_lexv2models_bot_locale.this["${each.key}"].locale_id
}


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


 aws lexv2-models list-slots --intent-id PBKSDSQGK0 --bot-id C6HUSTIFBR --bot-version DRAFT --locale-id en_US
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



*/
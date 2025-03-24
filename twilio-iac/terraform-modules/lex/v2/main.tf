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
 grouped_intent_slots = {
    for key, group in { for item in local.intent_slot_pairs : "${item.bot_name}_${item.intent_name}" => item... } :
    key => {
      bot_name      = group[0].bot_name
      intent_name   = group[0].intent_name
      slot_priorities = jsonencode([
        for slot in group : {
          priority = slot.priority
          slotId   = split(",", aws_lexv2models_slot.this["${slot.intent_name}_${slot.slot_name}"].id)[4]
        }
      ])
    }
  }
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
/*
resource "aws_lexv2models_bot_version" "this" {
  for_each                         = var.lex_v2_bots
  bot_id = aws_lexv2models_bot.this["${each.key}"].id
  locale_specification = {
    "en_US" = {
      source_bot_version = "DRAFT"
    }
  }
}
*/
resource "aws_lexv2models_bot_locale" "this" {
  for_each                         = var.lex_v2_bots
  bot_id                           = aws_lexv2models_bot.this["${each.key}"].id
  bot_version                      = "DRAFT"
  locale_id                        = each.value.locale
  n_lu_intent_confidence_threshold = 0.70
  depends_on = [aws_lexv2models_bot.this/*, aws_lexv2models_bot_version.this*/]
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
 
  }
}

/*
There is a circular dependency here between slots and intents.
A slot needs to be created with an intent id, and an intent needs to have the slot priorities.
Since I can't reference the slot ids when creating the intent I need to update the intent with the slot priorities as a later step.
This command doesn't always work, sometimes it only add just one dependency, so I usually run the apply twice.

 */
 /*
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
}*/
resource "null_resource" "update_intent_slots" {
    triggers = {
        always_run = timestamp()
    }
    for_each = local.grouped_intent_slots

    provisioner "local-exec" {
        command = <<EOT
        aws lexv2-models update-intent \
        --bot-id ${aws_lexv2models_bot.this[each.value.bot_name].id} \
        --bot-version ${aws_lexv2models_bot_locale.this[each.value.bot_name].bot_version} \
        --locale-id ${aws_lexv2models_bot_locale.this[each.value.bot_name].locale_id} \
        --intent-id ${split(":", aws_lexv2models_intent.this["${each.value.bot_name}_${each.value.intent_name}"].id)[0]} \
        --intent-name ${each.value.intent_name} \
        --slot-priorities '${each.value.slot_priorities}'
        EOT
    }

    depends_on = [
        aws_lexv2models_intent.this,
        aws_lexv2models_slot.this
    ]
}

resource "time_sleep" "wait_10_seconds" {
  create_duration = "10s"

  depends_on = [null_resource.update_intent_slots]
}

/*
Based on what is writen on the intent resource. This will actually add all the sections that were not added by the resource.
This is not ideal, but it works.
 */

resource "null_resource" "update_intent_settings" {
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
        ${each.value.config.intentClosingSetting != null ? "--intent-closing-setting '${jsonencode(each.value.config.intentClosingSetting)}'" : ""} \
        ${each.value.config.initialResponseSetting != null ? "--initial-response-setting '${jsonencode(each.value.config.initialResponseSetting)}'" : ""} \
        ${each.value.config.fulfillmentCodeHook != null ? "--fulfillment-code-hook '${jsonencode(each.value.config.fulfillmentCodeHook)}'" : ""} \
        ${each.value.config.sampleUtterances != null ? "--sample-utterances '${jsonencode(each.value.config.sampleUtterances)}'" : ""} \
        ${lookup(local.grouped_intent_slots, each.key, null) != null ? "--slot-priorities '${local.grouped_intent_slots[each.key].slot_priorities}'"  : ""} \
        EOT
    }
    depends_on = [
    time_sleep.wait_10_seconds,
    null_resource.update_intent_slots
  ]
}



terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-staging"
    key            = "twilio/jm/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-staging"
  }
}

provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${lower(var.environment)}"
    session_name = "tf-${basename(abspath(path.module))}"
  }
}

data "aws_ssm_parameter" "secrets" {
  name = "/terraform/twilio-iac/${basename(abspath(path.module))}/secrets.json"
}

locals {
  secrets = jsondecode(data.aws_ssm_parameter.secrets.value)
  safespot_flow_definition = jsonencode({
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "next": "AvoidChatBot",
          "event": "incomingMessage"
        },
        {
          "event": "incomingCall"
        },
        {
          "event": "incomingConversationMessage"
        },
        {
          "event": "incomingRequest"
        },
        {
          "event": "incomingParent"
        }
      ],
      "properties": {
        "offset": {
          "x": -100,
          "y": -520
        }
      }
    },
    {
      "name": "smsAttributes",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 840,
          "y": 1110
        },
        "workflow": module.taskRouter.master_workflow_sid,
        "channel": module.taskRouter.chat_task_channel_sid,
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
      }
    },
    {
      "name": "check_counselor_handoff",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "AdjustAttributes",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to counselor_handoff",
              "arguments": [
                "{{widgets.ChatBot.CurrentTask}}"
              ],
              "type": "equal_to",
              "value": "counselor_handoff"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.ChatBot.CurrentTask}}",
        "offset": {
          "x": 610,
          "y": 540
        }
      }
    },
    {
      "name": "defaultAttributes",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": -120,
          "y": 1110
        },
        "workflow": module.taskRouter.master_workflow_sid,
        "channel": module.taskRouter.chat_task_channel_sid,
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
      }
    },
    {
      "name": "whatsappAttributes",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 200,
          "y": 1110
        },
        "workflow": module.taskRouter.master_workflow_sid,
        "channel": module.taskRouter.chat_task_channel_sid,
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
      }
    },
    {
      "name": "facebookAttributes",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 520,
          "y": 1110
        },
        "workflow": module.taskRouter.master_workflow_sid,
        "channel": module.taskRouter.chat_task_channel_sid,
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
      }
    },
    {
      "name": "webAttributes",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 1160,
          "y": 1110
        },
        "workflow": module.taskRouter.master_workflow_sid,
        "channel": module.taskRouter.chat_task_channel_sid,
        "attributes": "{\"ip\":\"{{trigger.message.ChannelAttributes.pre_engagement_data.ip}}\",\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"{{trigger.message.ChannelAttributes.pre_engagement_data.helpline}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
      }
    },
    {
      "name": "AdjustAttributes",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "defaultAttributes",
          "event": "noMatch"
        },
        {
          "next": "whatsappAttributes",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to whatsapp",
              "arguments": [
                "{{trigger.message.ChannelAttributes.channel_type}}"
              ],
              "type": "equal_to",
              "value": "whatsapp"
            }
          ]
        },
        {
          "next": "facebookAttributes",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to facebook",
              "arguments": [
                "{{trigger.message.ChannelAttributes.channel_type}}"
              ],
              "type": "equal_to",
              "value": "facebook"
            }
          ]
        },
        {
          "next": "smsAttributes",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to sms",
              "arguments": [
                "{{trigger.message.ChannelAttributes.channel_type}}"
              ],
              "type": "equal_to",
              "value": "sms"
            }
          ]
        },
        {
          "next": "webAttributes",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to web",
              "arguments": [
                "{{trigger.message.ChannelAttributes.channel_type}}"
              ],
              "type": "equal_to",
              "value": "web"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{trigger.message.ChannelAttributes.channel_type}}",
        "offset": {
          "x": 400,
          "y": 800
        }
      }
    },
    {
      "name": "check_response",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "pre_survey_complete",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value contains 2",
              "arguments": [
                "{{widgets.ReasonBot.memory.twilio.collected_data.collect_survey.answers.service.answer}}"
              ],
              "type": "contains",
              "value": "2"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.ReasonBot.memory.twilio.collected_data.collect_survey.answers.service.answer}}",
        "offset": {
          "x": -70,
          "y": 120
        }
      }
    },
    {
      "name": "AvoidChatBot",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "contact_reason_complete",
          "event": "noMatch"
        },
        {
          "next": "lineAttributes",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to line",
              "arguments": [
                "{{trigger.message.ChannelAttributes.channel_type}}"
              ],
              "type": "equal_to",
              "value": "line"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{trigger.message.ChannelAttributes.channel_type}}",
        "offset": {
          "x": 160,
          "y": -290
        }
      }
    },
    {
      "name": "lineAttributes",
      "type": "send-to-flex",
      "transitions": [
        {
          "event": "callComplete"
        },
        {
          "event": "failedToEnqueue"
        },
        {
          "event": "callFailure"
        }
      ],
      "properties": {
        "offset": {
          "x": 570,
          "y": -60
        },
        "workflow": module.taskRouter.master_workflow_sid,
        "channel": module.taskRouter.chat_task_channel_sid,
        "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\",\"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
      }
    },
    {
      "name": "capture_channel_bot",
      "type": "run-function",
      "transitions": [
        {
          "event": "success"
        },
        {
          "event": "fail"
        }
      ],
      "properties": {
        "service_sid": serverless_service_sid,
        "environment_sid": serverless_environment_sid,
        "offset": {
          "x": -290,
          "y": 550
        },
        "function_sid": capture_channel_with_bot_sid,
        "parameters": [
          {
            "value": "{{flow.channel.address}}",
            "key": "channelSid"
          },
          {
            "value": "trigger_pre_survey",
            "key": "message"
          },
          {
            "value": "{{flow.flow_sid}}",
            "key": "studioFlowSid"
          },
          {
            "value": "pt",
            "key": "language"
          },
          {
            "value": "pre_survey",
            "key": "botSuffix"
          },
          {
            "value": "withUserMessage",
            "key": "triggerType"
          },
          {
            "value": "triggerStudioFlow",
            "key": "releaseType"
          },
          {
            "value": "preSurveyComplete",
            "key": "releaseFlag"
          }
        ],
        "url": "https://serverless-7688-production.twil.io/channelCapture/captureChannelWithBot"
      }
    },
    {
      "name": "pre_survey_complete",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "capture_channel_bot",
          "event": "noMatch"
        },
        {
          "next": "check_counselor_handoff",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to true",
              "arguments": [
                "{{trigger.message.ChannelAttributes.preSurveyComplete}}"
              ],
              "type": "equal_to",
              "value": "true"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{trigger.message.ChannelAttributes.preSurveyComplete}}",
        "offset": {
          "x": 70,
          "y": 330
        }
      }
    },
    {
      "name": "reason_bot",
      "type": "run-function",
      "transitions": [
        {
          "event": "success"
        },
        {
          "event": "fail"
        }
      ],
      "properties": {
        "service_sid": serverless_service_sid,
        "environment_sid": serverless_environment_sid,
        "offset": {
          "x": -770,
          "y": 150
        },
        "function_sid": capture_channel_with_bot_sid,
        "parameters": [
          {
            "value": "{{flow.channel.address}}",
            "key": "channelSid"
          },
          {
            "value": "trigger_contact_reason",
            "key": "message"
          },
          {
            "value": "{{flow.flow_sid}}",
            "key": "studioFlowSid"
          },
          {
            "value": "pt",
            "key": "language"
          },
          {
            "value": "contact_reason",
            "key": "botSuffix"
          },
          {
            "value": "withUserMessage",
            "key": "triggerType"
          },
          {
            "value": "triggerStudioFlow",
            "key": "releaseType"
          },
          {
            "value": "contactReasonComplete",
            "key": "releaseFlag"
          }
        ],
        "url": "https://serverless-7688-production.twil.io/channelCapture/captureChannelWithBot"
      }
    },
    {
      "name": "contact_reason_complete",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "reason_bot",
          "event": "noMatch"
        },
        {
          "next": "check_response",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to true",
              "arguments": [
                "{{trigger.message.ChannelAttributes.contactReasonComplete}}"
              ],
              "type": "equal_to",
              "value": "true"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{trigger.message.ChannelAttributes.contactReasonComplete}}",
        "offset": {
          "x": -330,
          "y": -90
        }
      }
    }
  ],
    "initial_state" : "Trigger",
    "flags" : {
      "allow_concurrent_calls" : true
    },
    "description" : "Bot flow for creating a Flex messaging task"
  })
}

provider "twilio" {
  username = local.secrets.twilio_account_sid
  password = local.secrets.twilio_auth_token
}


module "hrmServiceIntegration" {
  source            = "../terraform-modules/hrmServiceIntegration/default"
  local_os          = var.local_os
  helpline          = var.helpline
  short_helpline    = var.short_helpline
  environment       = var.environment
  short_environment = var.short_environment
}

module "serverless" {
  source             = "../terraform-modules/serverless/default"
  twilio_account_sid = local.secrets.twilio_account_sid
  twilio_auth_token  = local.secrets.twilio_auth_token
}

module "services" {
  source                    = "../terraform-modules/services/default"
  local_os                  = var.local_os
  helpline                  = var.helpline
  short_helpline            = var.short_helpline
  environment               = var.environment
  short_environment         = var.short_environment
  uses_conversation_service = false
}

module "taskRouter" {
  source                                                    = "../terraform-modules/taskRouter/default"
  serverless_url                                            = module.serverless.serverless_environment_production_url
  helpline                                                  = var.helpline
  custom_task_routing_filter_expression                     = "isContactlessTask==true OR channelType==\"web\" OR to==\"+14244147346\" OR to==\"+18767287042\""
  custom_task_routing_survey_queue_target_filter_expression = "(worker.waitingOfflineContact != true AND ((task.transferTargetType == \"worker\" AND task.targetSid == worker.sid) OR (task.transferTargetType != \"worker\" AND worker.sid != task.ignoreAgent))) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)"

}

module "studioFlow" {
  source                   = "../terraform-modules/studioFlow/default"
  custom_flow_definition   = local.safespot_flow_definition
  master_workflow_sid      = module.taskRouter.master_workflow_sid
  chat_task_channel_sid    = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid       = "deleted"
}

module "flex" {
  source                    = "../terraform-modules/flex/default"
  twilio_account_sid        = local.secrets.twilio_account_sid
  short_environment         = var.short_environment
  flex_chat_service_sid     = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module "survey" {
  source                             = "../terraform-modules/survey/default"
  helpline                           = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module "aws" {
  source                             = "../terraform-modules/aws/default"
  twilio_account_sid                 = local.secrets.twilio_account_sid
  twilio_auth_token                  = local.secrets.twilio_auth_token
  serverless_url                     = module.serverless.serverless_environment_production_url
  helpline                           = var.helpline
  short_helpline                     = var.short_helpline
  environment                        = var.environment
  short_environment                  = var.short_environment
  operating_info_key                 = var.operating_info_key
  datadog_app_id                     = local.secrets.datadog_app_id
  datadog_access_token               = local.secrets.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid                = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid      = module.services.shared_state_sync_service_sid
  flex_chat_service_sid              = module.services.flex_chat_service_sid
  flex_proxy_service_sid             = module.services.flex_proxy_service_sid
  post_survey_bot_sid                = "deleted"
  survey_workflow_sid                = module.survey.survey_workflow_sid
}

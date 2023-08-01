terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-production"
    key            = "twilio/jm/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-production"
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
    "states" : [
      {
        "transitions" : [
          {
            "event" : "incomingMessage",
            "next" : "ChatBot"
          },
          {
            "event" : "incomingCall"
          },
          {
            "event" : "incomingRequest"
          },
          {
            "event" : "incomingParent"
          }
        ],
        "type" : "trigger",
        "name" : "Trigger",
        "properties" : {
          "offset" : {
            "y" : -70,
            "x" : 0
          }
        }
      },
      {
        "transitions" : [
          {
            "event" : "callComplete"
          },
          {
            "event" : "failedToEnqueue"
          },
          {
            "event" : "callFailure"
          }
        ],
        "type" : "send-to-flex",
        "name" : "smsAttributes",
        "properties" : {
          "attributes" : "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow" : module.taskRouter.master_workflow_sid,
          "channel" : module.taskRouter.chat_task_channel_sid,
          "offset" : {
            "y" : 810,
            "x" : 270
          }
        }
      },
      {
        "transitions" : [
          {
            "event" : "sessionEnded",
            "next" : "check_counselor_handoff"
          },
          {
            "event" : "failure"
          }
        ],
        "type" : "send-to-auto-pilot",
        "name" : "ChatBot",
        "properties" : {
          "body" : "{{trigger.message.Body}}",
          "from" : "Bot",
          "chat_service" : "{{trigger.message.InstanceSid}}",
          "target_task" : "greeting",
          "timeout" : 14400,
          "offset" : {
            "y" : 110,
            "x" : -20
          },
          "chat_channel" : "{{trigger.message.ChannelSid}}",
          "autopilot_assistant_sid" : module.chatbots.pre_survey_bot_sid
        }
      },
      {
        "transitions" : [
          {
            "event" : "noMatch"
          },
          {
            "conditions" : [
              {
                "type" : "equal_to",
                "friendly_name" : "If value equal_to counselor_handoff",
                "arguments" : [
                  "{{widgets.ChatBot.CurrentTask}}"
                ],
                "value" : "counselor_handoff"
              }
            ],
            "event" : "match",
            "next" : "AdjustAttributes"
          }
        ],
        "type" : "split-based-on",
        "name" : "check_counselor_handoff",
        "properties" : {
          "input" : "{{widgets.ChatBot.CurrentTask}}",
          "offset" : {
            "y" : 340,
            "x" : -20
          }
        }
      },
      {
        "transitions" : [
          {
            "event" : "callComplete"
          },
          {
            "event" : "failedToEnqueue"
          },
          {
            "event" : "callFailure"
          }
        ],
        "type" : "send-to-flex",
        "name" : "defaultAttributes",
        "properties" : {
          "attributes" : "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow" : module.taskRouter.master_workflow_sid,
          "channel" : module.taskRouter.default_task_channel_sid,
          "offset" : {
            "y" : 810,
            "x" : -690
          }
        }
      },
      {
        "transitions" : [
          {
            "event" : "callComplete"
          },
          {
            "event" : "failedToEnqueue"
          },
          {
            "event" : "callFailure"
          }
        ],
        "type" : "send-to-flex",
        "name" : "whatsappAttributes",
        "properties" : {
          "attributes" : "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow" : module.taskRouter.master_workflow_sid,
          "channel" : module.taskRouter.chat_task_channel_sid,
          "offset" : {
            "y" : 810,
            "x" : -370
          }
        }
      },
      {
        "transitions" : [
          {
            "event" : "callComplete"
          },
          {
            "event" : "failedToEnqueue"
          },
          {
            "event" : "callFailure"
          }
        ],
        "type" : "send-to-flex",
        "name" : "facebookAttributes",
        "properties" : {
          "attributes" : "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow" : module.taskRouter.master_workflow_sid,
          "channel" : module.taskRouter.chat_task_channel_sid,
          "offset" : {
            "y" : 810,
            "x" : -50
          }
        }
      },
      {
        "transitions" : [
          {
            "event" : "callComplete"
          },
          {
            "event" : "failedToEnqueue"
          },
          {
            "event" : "callFailure"
          }
        ],
        "type" : "send-to-flex",
        "name" : "webAttributes",
        "properties" : {
          "attributes" : "{\"ip\":\"{{trigger.message.ChannelAttributes.pre_engagement_data.ip}}\",\"firstName\": \"{{trigger.message.ChannelAttributes.from}}\",\"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"SafeSpot\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
          "workflow" : module.taskRouter.master_workflow_sid,
          "channel" : module.taskRouter.chat_task_channel_sid,
          "offset" : {
            "y" : 810,
            "x" : 590
          }
        }
      },
      {
        "transitions" : [
          {
            "event" : "noMatch",
            "next" : "defaultAttributes"
          },
          {
            "conditions" : [
              {
                "type" : "equal_to",
                "friendly_name" : "If value equal_to whatsapp",
                "arguments" : [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value" : "whatsapp"
              }
            ],
            "event" : "match",
            "next" : "whatsappAttributes"
          },
          {
            "conditions" : [
              {
                "type" : "equal_to",
                "friendly_name" : "If value equal_to facebook",
                "arguments" : [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value" : "facebook"
              }
            ],
            "event" : "match",
            "next" : "facebookAttributes"
          },
          {
            "conditions" : [
              {
                "type" : "equal_to",
                "friendly_name" : "If value equal_to sms",
                "arguments" : [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value" : "sms"
              }
            ],
            "event" : "match",
            "next" : "smsAttributes"
          },
          {
            "conditions" : [
              {
                "type" : "equal_to",
                "friendly_name" : "If value equal_to web",
                "arguments" : [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value" : "web"
              }
            ],
            "event" : "match",
            "next" : "webAttributes"
          }
        ],
        "type" : "split-based-on",
        "name" : "AdjustAttributes",
        "properties" : {
          "input" : "{{trigger.message.ChannelAttributes.channel_type}}",
          "offset" : {
            "y" : 560,
            "x" : -200
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

module "chatbots" {
  source            = "../terraform-modules/chatbots/default"
  serverless_url    = module.serverless.serverless_environment_production_url
  gender_field_type = "safespot"
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
  custom_task_routing_filter_expression                     = "helpline=='${var.helpline}' OR channelType==\"web\" OR to==\"+14244147346\" OR to==\"+18767287042\""
  custom_task_routing_survey_queue_target_filter_expression = "(worker.waitingOfflineContact != true AND ((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)"
}

module "studioFlow" {
  source                   = "../terraform-modules/studioFlow/default"
  custom_flow_definition   = local.safespot_flow_definition
  master_workflow_sid      = module.taskRouter.master_workflow_sid
  chat_task_channel_sid    = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid       = module.chatbots.pre_survey_bot_sid
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
  post_survey_bot_sid                = module.chatbots.post_survey_bot_sid
  survey_workflow_sid                = module.survey.survey_workflow_sid
}

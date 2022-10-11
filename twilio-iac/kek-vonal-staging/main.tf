terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio-ukr-staging"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "twilio-terraform-ukr-staging-locks"
    region = "us-east-1"
    encrypt        = true
  }
}

locals {
  custom_messaging_flow_definition = json_encode({
    description = "Bot flow for creating a Flex messaging task",
    states = [
      {
        name = "Trigger",
        type = "trigger",
        transitions = [
          {
            next = "split_language",
            event = "incomingMessage"
          },
          {
            event = "incomingCall"
          },
          {
            event = "incomingConversationMessage"
          },
          {
            event = "incomingRequest"
          },
          {
            event = "incomingParent"
          }
        ],
        properties = {
          offset = {
            x = 0,
            y = -70
          }
        }
      },
      {
        name = "smsAttributes",
        type = "send-to-flex",
        transitions = [
          {
            event = "callComplete"
          },
          {
            event = "failedToEnqueue"
          },
          {
            event = "callFailure"
          }
        ],
        properties = {
          offset = {
            x = -330,
            y = 1260
          },
          workflow = "WW5814cf7617d435faf2103e8bdb3fba52",
          channel = "TC83c2500c69637fccebd6ca4d83875ac9",
          attributes = "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
        }
      },
      {
        name = "ChatBot",
        type = "send-to-auto-pilot",
        transitions = [
          {
            next = "check_counselor_handoff",
            event = "sessionEnded"
          },
          {
            event = "failure"
          }
        ],
        properties = {
          chat_channel = "{{trigger.message.ChannelSid}}",
          offset = {
            x = -490,
            y = 390
          },
          autopilot_assistant_sid = "UAa0d9bf36a5123ecd0308d58a8a2331ac",
          from = "Bot",
          chat_service = "{{trigger.message.InstanceSid}}",
          body = "{{trigger.message.Body}}",
          target_task = "greeting",
          timeout = 14400
        }
      },
      {
        name = "check_counselor_handoff",
        type = "split-based-on",
        transitions = [
          {
            event = "noMatch"
          },
          {
            next = "AdjustAttributes",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to counselor_handoff",
                arguments = [
                  "{{widgets.ChatBot.CurrentTask}}"
                ],
                type = "equal_to",
                value = "counselor_handoff"
              }
            ]
          }
        ],
        properties = {
          input = "{{widgets.ChatBot.CurrentTask}}",
          offset = {
            x = 110,
            y = 770
          }
        }
      },
      {
        name = "defaultAttributes",
        type = "send-to-flex",
        transitions = [
          {
            event = "callComplete"
          },
          {
            event = "failedToEnqueue"
          },
          {
            event = "callFailure"
          }
        ],
        properties = {
          offset = {
            x = -1420,
            y = 1260
          },
          workflow = "WW5814cf7617d435faf2103e8bdb3fba52",
          channel = "TCcf0554f1eed13b297c4c7edcc8023679",
          attributes = "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
        }
      },
      {
        name = "whatsappAttributes",
        type = "send-to-flex",
        transitions = [
          {
            event = "callComplete"
          },
          {
            event = "failedToEnqueue"
          },
          {
            event = "callFailure"
          }
        ],
        properties = {
          offset = {
            x = -1060,
            y = 1260
          },
          workflow = "WW5814cf7617d435faf2103e8bdb3fba52",
          channel = "TC83c2500c69637fccebd6ca4d83875ac9",
          attributes = "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
        }
      },
      {
        name = "facebookAttributes",
        type = "send-to-flex",
        transitions = [
          {
            event = "callComplete"
          },
          {
            event = "failedToEnqueue"
          },
          {
            event = "callFailure"
          }
        ],
        properties = {
          offset = {
            x = -700,
            y = 1260
          },
          workflow = "WW5814cf7617d435faf2103e8bdb3fba52",
          channel = "TC83c2500c69637fccebd6ca4d83875ac9",
          attributes = "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
        }
      },
      {
        name = "webAttributes",
        type = "send-to-flex",
        transitions = [
          {
            event = "callComplete"
          },
          {
            event = "failedToEnqueue"
          },
          {
            event = "callFailure"
          }
        ],
        properties = {
          offset = {
            x = 40,
            y = 1260
          },
          workflow = "WW5814cf7617d435faf2103e8bdb3fba52",
          channel = "TC83c2500c69637fccebd6ca4d83875ac9",
          attributes = "{\"ip\":\"{{trigger.message.ChannelAttributes.pre_engagement_data.ip}}\",\"language\": \"{{trigger.message.ChannelAttributes.pre_engagement_data.language}}\",\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"{{trigger.message.ChannelAttributes.pre_engagement_data.helpline}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
        }
      },
      {
        name = "AdjustAttributes",
        type = "split-based-on",
        transitions = [
          {
            next = "defaultAttributes",
            event = "noMatch"
          },
          {
            next = "whatsappAttributes",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to whatsapp",
                arguments = [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                type = "equal_to",
                value = "whatsapp"
              }
            ]
          },
          {
            next = "facebookAttributes",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to facebook",
                arguments = [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                type = "equal_to",
                value = "facebook"
              }
            ]
          },
          {
            next = "smsAttributes",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to sms",
                arguments = [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                type = "equal_to",
                value = "sms"
              }
            ]
          },
          {
            next = "webAttributes",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to web",
                arguments = [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                type = "equal_to",
                value = "web"
              }
            ]
          }
        ],
        properties = {
          input = "{{trigger.message.ChannelAttributes.channel_type}}",
          offset = {
            x = -60,
            y = 1020
          }
        }
      },
      {
        name = "split_language",
        type = "split-based-on",
        transitions = [
          {
            event = "noMatch"
          },
          {
            next = "ChatBot",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to hu-HU",
                arguments = [
                  "{{trigger.message.ChannelAttributes.pre_engagement_data.language}}"
                ],
                type = "equal_to",
                value = "hu-HU"
              }
            ]
          },
          {
            next = "Chatbot-ru-HU",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to ukr-HU",
                arguments = [
                  "{{trigger.message.ChannelAttributes.pre_engagement_data.language}}"
                ],
                type = "equal_to",
                value = "ru-HU"
              }
            ]
          },
          {
            next = "Chatbot-ukr-HU",
            event = "match",
            conditions = [
              {
                friendly_name = "If value equal_to ukr-HU",
                arguments = [
                  "{{trigger.message.ChannelAttributes.pre_engagement_data.language}}"
                ],
                type = "equal_to",
                value = "ukr-HU"
              }
            ]
          }
        ],
        properties = {
          input = "{{trigger.message.ChannelAttributes.pre_engagement_data.language}}",
          offset = {
            x = -50,
            y = 130
          }
        }
      },
      {
        name = "Chatbot-ru-HU",
        type = "send-to-auto-pilot",
        transitions = [
          {
            next = "check_counselor_handoff",
            event = "sessionEnded"
          },
          {
            event = "failure"
          }
        ],
        properties = {
          chat_channel = "{{trigger.message.ChannelSid}}",
          offset = {
            x = 150,
            y = 410
          },
          autopilot_assistant_sid = "UAa3d636d171092e6b2744c3e9c47a8658",
          from = "Bot",
          chat_service = "{{trigger.message.InstanceSid}}",
          body = "{{trigger.message.Body}}",
          target_task = "greeting",
          timeout = 14400
        }
      },
      {
        name = "Chatbot-ukr-HU",
        type = "send-to-auto-pilot",
        transitions = [
          {
            next = "check_counselor_handoff",
            event = "sessionEnded"
          },
          {
            event = "failure"
          }
        ],
        properties = {
          chat_channel = "{{trigger.message.ChannelSid}}",
          offset = {
            x = 700,
            y = 420
          },
          autopilot_assistant_sid = "UA8ff2157a14d101dbee67eb1821166756",
          from = "Bot",
          chat_service = "{{trigger.message.InstanceSid}}",
          body = "{{trigger.message.Body}}",
          target_task = "greeting",
          timeout = 14400
        }
      }
    ],
    initial_state = "Trigger",
    flags         = {
      allow_concurrent_calls = true
    }
  })
}
module "chatbots" {
  source = "../terraform-modules/chatbots/default"
  serverless_url = var.serverless_url
  gender_field_type = "kek-vonal"
}

module "hrmServiceIntegration" {
  source = "../terraform-modules/hrmServiceIntegration/default"
  local_os = var.local_os
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
}

module "serverless" {
  source = "../terraform-modules/serverless/default"
}

module "services" {
  source = "../terraform-modules/services/default"
  local_os = var.local_os
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
}

module "taskRouter" {
  source = "../terraform-modules/taskRouter/default"
  serverless_url = var.serverless_url
  helpline = "Kék Vonal"
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid = module.chatbots.pre_survey_bot_sid
}

module flex {
  source = "../terraform-modules/flex/default"
  account_sid = var.account_sid
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  permission_config = "demo"
  definition_version = var.definition_version
  serverless_url = var.serverless_url
  hrm_url = "https://hrm-staging-eu.tl.techmatters.org"
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
  messaging_flow_contact_identity = "+12053089376"
  flex_chat_service_sid = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module survey {
  source = "../terraform-modules/survey/default"
  helpline = var.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module aws {
  source = "../terraform-modules/aws/default"
  account_sid = var.account_sid
  helpline = var.helpline
  short_helpline = var.short_helpline
  environment = var.environment
  short_environment = var.short_environment
  operating_info_key = var.operating_info_key
  datadog_app_id = var.datadog_app_id
  datadog_access_token = var.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid = module.services.shared_state_sync_service_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  flex_proxy_service_sid = module.services.flex_proxy_service_sid
  post_survey_bot_sid = module.chatbots.post_survey_bot_sid
  survey_workflow_sid = module.survey.survey_workflow_sid
  bucket_region = "us-east-1"
}
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

  helpline  = "Kék Vonal"
  short_helpline = "HU"
  operating_info_key = "hu"
  environment = "Staging"
  short_environment = "STG"
  definition_version = "hu-v1"
  permission_config = "hu"
  multi_office  = false

  feature_flags = {
      "enable_fullstory_monitoring": false,
      "enable_upload_documents": true,
      "enable_post_survey": false,
      "enable_case_management": true,
      "enable_offline_contact": true,
      "enable_filter_cases": true,
      "enable_sort_cases": true,
      "enable_transfers": true,
      "enable_manual_pulling": true,
      "enable_csam_report": true,
      "enable_canned_responses": true,
      "enable_dual_write": false,
      "enable_save_insights": true,
      "enable_previous_contacts": true
    }

  ukr_chatbot_state = "Chatbot-ukr-HU"
  ru_chatbot_state = "Chatbot-ru-HU"

  custom_messaging_flow_definition = jsonencode({
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
          workflow = module.taskRouter.master_workflow_sid,
          channel = module.taskRouter.chat_task_channel_sid,
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
          autopilot_assistant_sid = twilio_autopilot_assistants_v1.chatbot_default.sid,
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
          workflow = module.taskRouter.master_workflow_sid,
          channel = module.taskRouter.default_task_channel_sid,
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
          workflow = module.taskRouter.master_workflow_sid,
          channel = module.taskRouter.chat_task_channel_sid,
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
          workflow = module.taskRouter.master_workflow_sid,
          channel = module.taskRouter.chat_task_channel_sid,
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
          workflow = module.taskRouter.master_workflow_sid,
          channel = module.taskRouter.chat_task_channel_sid,
          attributes = "{\"language\": \"{{trigger.message.ChannelAttributes.pre_engagement_data.language}}\",\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"${local.helpline}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}"
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
            next = local.ru_chatbot_state,
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
            next = local.ukr_chatbot_state,
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
        name = local.ru_chatbot_state,
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
          autopilot_assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid,
          from = "Bot",
          chat_service = "{{trigger.message.InstanceSid}}",
          body = "{{trigger.message.Body}}",
          target_task = "greeting",
          timeout = 14400
        }
      },
      {
        name = local.ukr_chatbot_state
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
          autopilot_assistant_sid = twilio_autopilot_assistants_v1.chatbot_ukr_HU.sid,
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

module "hrmServiceIntegration" {
  source = "../terraform-modules/hrmServiceIntegration/default"
  local_os = var.local_os
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  short_environment = local.short_environment
}

module "serverless" {
  source = "../terraform-modules/serverless/default"
}

module "services" {
  source = "../terraform-modules/services/default"
  local_os = var.local_os
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  short_environment = local.short_environment
}

module "taskRouter" {
  source = "../terraform-modules/taskRouter/default"
  custom_task_routing_filter_expression = "phone=='+3680984590' OR phone=='+3612344587' OR channelType=='web' OR isContactlessTask==true"
  serverless_url = var.serverless_url
  include_default_filter = true
  helpline = "Kék Vonal"
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  master_workflow_sid = module.taskRouter.master_workflow_sid
  chat_task_channel_sid = module.taskRouter.chat_task_channel_sid
  default_task_channel_sid = module.taskRouter.default_task_channel_sid
  pre_survey_bot_sid = twilio_autopilot_assistants_v1.chatbot_default.sid
  custom_flow_definition = local.custom_messaging_flow_definition
}

module flex {
  source = "../terraform-modules/flex/default"
  account_sid = var.account_sid
  short_environment = local.short_environment
  operating_info_key = local.operating_info_key
  permission_config = "demo"
  definition_version = local.definition_version
  serverless_url = var.serverless_url
  hrm_url = "https://hrm-staging-eu.tl.techmatters.org"
  multi_office_support = local.multi_office
  feature_flags = local.feature_flags
  messaging_flow_contact_identity = "+12053089376"
  flex_chat_service_sid = module.services.flex_chat_service_sid
  messaging_studio_flow_sid = module.studioFlow.messaging_studio_flow_sid
}

module survey {
  source = "../terraform-modules/survey/default"
  helpline = local.helpline
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
}

module aws {
  source = "../terraform-modules/aws/default"
  account_sid = var.account_sid
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  short_environment = local.short_environment
  operating_info_key = local.operating_info_key
  datadog_app_id = var.datadog_app_id
  datadog_access_token = var.datadog_access_token
  flex_task_assignment_workspace_sid = module.taskRouter.flex_task_assignment_workspace_sid
  master_workflow_sid = module.taskRouter.master_workflow_sid
  shared_state_sync_service_sid = module.services.shared_state_sync_service_sid
  flex_chat_service_sid = module.services.flex_chat_service_sid
  flex_proxy_service_sid = module.services.flex_proxy_service_sid
  post_survey_bot_sid = twilio_autopilot_assistants_v1.chatbot_postsurvey.sid
  survey_workflow_sid = module.survey.survey_workflow_sid
  bucket_region = "us-east-1"
}

module aws_monitoring {
  source = "../terraform-modules/aws-monitoring/default"
  helpline = local.helpline
  short_helpline = local.short_helpline
  environment = local.environment
  aws_account_id = var.aws_account_id
  cloudwatch_region = "us-east-1"
}

module github {
  source = "../terraform-modules/github/default"
  twilio_account_sid = var.account_sid
  twilio_auth_token = var.auth_token
  short_environment = local.short_environment
  short_helpline = local.short_helpline
  serverless_url = var.serverless_url
}
terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "local" {
    path = "dev.tfstate"
  }

  # backend "s3" {
  #   bucket         = "tl-terraform-state-twilio-ph-staging"
  #   key            = "twilio/terraform.tfstate"
  #   dynamodb_table = "twilio-terraform-ph-staging-locks"
  #   encrypt        = true
  # }
}

locals {
  ecpat_flow_definition = jsonencode({
    "states":[
      {
        "transitions":[
          {
            "event":"incomingMessage",
            "next":"LanguageBot"
          },
          {
            "event":"incomingCall"
          },
          {
            "event":"incomingRequest"
          },
          {
            "event":"incomingParent"
          }
        ],
        "type":"trigger",
        "name":"Trigger",
        "properties":{
          "offset":{
            "y":-660,
            "x":-1310
          }
        }
      },
      {
        "transitions":[
          {
            "event":"callComplete"
          },
          {
            "event":"failedToEnqueue"
          },
          {
            "event":"callFailure"
          }
        ],
        "type":"send-to-flex",
        "name":"smsAttributes",
        "properties":{
          "attributes":"{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow":module.taskRouter.master_workflow_sid,
          "channel":module.taskRouter.chat_task_channel_sid,
          "offset":{
            "y":1460,
            "x":-170
          }
        }
      },
      {
        "transitions":[
          {
            "event":"sessionEnded",
            "next":"check_counselor_handoff"
          },
          {
            "event":"failure"
          }
        ],
        "type":"send-to-auto-pilot",
        "name":"ChatBot",
        "properties":{
          "body":"{{trigger.message.Body}}",
          "from":"Bot",
          "chat_service":"{{trigger.message.InstanceSid}}",
          "target_task":"greeting",
          "timeout":14400,
          "offset":{
            "y":620,
            "x":-1350
          },
          "chat_channel":"{{trigger.message.ChannelSid}}",
          "autopilot_assistant_sid":module.chatbots.pre_survey_bot_sid
        }
      },
      {
        "transitions":[
          {
            "event":"noMatch"
          },
          {
            "conditions":[
              {
                "type":"equal_to",
                "friendly_name":"If value equal_to counselor_handoff",
                "arguments":[
                  "{{widgets.ChatBot.CurrentTask}}"
                ],
                "value":"counselor_handoff"
              }
            ],
            "event":"match",
            "next":"AdjustAttributes"
          }
        ],
        "type":"split-based-on",
        "name":"check_counselor_handoff",
        "properties":{
          "input":"{{widgets.ChatBot.CurrentTask}}",
          "offset":{
            "y":930,
            "x":-1270
          }
        }
      },
      {
        "transitions":[
          {
            "event":"callComplete"
          },
          {
            "event":"failedToEnqueue"
          },
          {
            "event":"callFailure"
          }
        ],
        "type":"send-to-flex",
        "name":"defaultAttributes",
        "properties":{
          "attributes":"{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow":module.taskRouter.master_workflow_sid,
          "channel":module.taskRouter.default_task_channel_sid,
          "offset":{
            "y":1430,
            "x":-1240
          }
        }
      },
      {
        "transitions":[
          {
            "event":"callComplete"
          },
          {
            "event":"failedToEnqueue"
          },
          {
            "event":"callFailure"
          }
        ],
        "type":"send-to-flex",
        "name":"whatsappAttributes",
        "properties":{
          "attributes":"{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow":module.taskRouter.master_workflow_sid,
          "channel":module.taskRouter.chat_task_channel_sid,
          "offset":{
            "y":1460,
            "x":-890
          }
        }
      },
      {
        "transitions":[
          {
            "event":"callComplete"
          },
          {
            "event":"failedToEnqueue"
          },
          {
            "event":"callFailure"
          }
        ],
        "type":"send-to-flex",
        "name":"facebookAttributes",
        "properties":{
          "attributes":"{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"language\":\"en-US\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow":module.taskRouter.master_workflow_sid,
          "channel":module.taskRouter.chat_task_channel_sid,
          "offset":{
            "y":1460,
            "x":-530
          }
        }
      },
      {
        "transitions":[
          {
            "event":"callComplete"
          },
          {
            "event":"failedToEnqueue"
          },
          {
            "event":"callFailure"
          }
        ],
        "type":"send-to-flex",
        "name":"webAttributes",
        "properties":{
          "attributes":"{\"ip\":\"{{trigger.message.ChannelAttributes.pre_engagement_data.ip}}\",\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"{{trigger.message.ChannelAttributes.pre_engagement_data.helpline}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow":module.taskRouter.master_workflow_sid,
          "channel":module.taskRouter.chat_task_channel_sid,
          "offset":{
            "y":1460,
            "x":180
          }
        }
      },
      {
        "transitions":[
          {
            "event":"noMatch",
            "next":"defaultAttributes"
          },
          {
            "conditions":[
              {
                "type":"equal_to",
                "friendly_name":"If value equal_to whatsapp",
                "arguments":[
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value":"whatsapp"
              }
            ],
            "event":"match",
            "next":"whatsappAttributes"
          },
          {
            "conditions":[
              {
                "type":"equal_to",
                "friendly_name":"If value equal_to facebook",
                "arguments":[
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value":"facebook"
              }
            ],
            "event":"match",
            "next":"facebookAttributes"
          },
          {
            "conditions":[
              {
                "type":"equal_to",
                "friendly_name":"If value equal_to sms",
                "arguments":[
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value":"sms"
              }
            ],
            "event":"match",
            "next":"smsAttributes"
          },
          {
            "conditions":[
              {
                "type":"equal_to",
                "friendly_name":"If value equal_to web",
                "arguments":[
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value":"web"
              }
            ],
            "event":"match",
            "next":"webAttributes"
          }
        ],
        "type":"split-based-on",
        "name":"AdjustAttributes",
        "properties":{
          "input":"{{trigger.message.ChannelAttributes.channel_type}}",
          "offset":{
            "y":1170,
            "x":-1140
          }
        }
      },
      {
        "transitions":[
          {
            "event":"sessionEnded",
            "next":"split_language"
          },
          {
            "event":"failure"
          },
          {
            "event":"timeout"
          }
        ],
        "type":"send-to-auto-pilot",
        "name":"LanguageBot",
        "properties":{
          "body":"{{trigger.message.Body}}",
          "from":"Bot",
          "chat_service":"{{trigger.message.InstanceSid}}",
          "target_task":"greeting",
          "timeout":14400,
          "offset":{
            "y":-470,
            "x":-1260
          },
          "chat_channel":"{{trigger.message.ChannelSid}}",
          "autopilot_assistant_sid":module.custom_chatbots.language_bot_sid
        }
      },
      {
        "transitions":[
          {
            "event":"sessionEnded",
            "next":"split_permission"
          },
          {
            "event":"failure"
          },
          {
            "event":"timeout"
          }
        ],
        "type":"send-to-auto-pilot",
        "name":"Permission",
        "properties":{
          "body":"{{trigger.message.Body}}",
          "from":"Bot",
          "chat_service":"{{trigger.message.InstanceSid}}",
          "target_task":"greeting",
          "timeout":14400,
          "offset":{
            "y":130,
            "x":-1330
          },
          "chat_channel":"{{trigger.message.ChannelSid}}",
          "autopilot_assistant_sid":module.custom_chatbots.permission_bot_en_sid
        }
      },
      {
        "transitions":[
          {
            "event":"noMatch"
          },
          {
            "conditions":[
              {
                "type":"contains",
                "friendly_name":"If value contains en-US",
                "arguments":[
                  "{{widgets.LanguageBot.memory.twilio.collected_data.collect_survey.answers.language.answer}}"
                ],
                "value":"en-US"
              }
            ],
            "event":"match",
            "next":"Permission"
          },
          {
            "conditions":[
              {
                "type":"contains",
                "friendly_name":"If value contains Filipino",
                "arguments":[
                  "{{widgets.LanguageBot.memory.twilio.collected_data.collect_survey.answers.language.answer}}"
                ],
                "value":"Filipino"
              }
            ],
            "event":"match",
            "next":"Permission_fil"
          }
        ],
        "type":"split-based-on",
        "name":"split_language",
        "properties":{
          "input":"{{widgets.LanguageBot.memory.twilio.collected_data.collect_survey.answers.language.answer}}",
          "offset":{
            "y":-210,
            "x":-1040
          }
        }
      },
      {
        "transitions":[
          {
            "event":"noMatch"
          },
          {
            "conditions":[
              {
                "type":"contains",
                "friendly_name":"If value contains yes",
                "arguments":[
                  "{{widgets.Permission.memory.twilio.collected_data.collect_permission.answers.permission.answer}}"
                ],
                "value":"yes"
              }
            ],
            "event":"match",
            "next":"ChatBot"
          },
          {
            "conditions":[
              {
                "type":"contains",
                "friendly_name":"If value contains no",
                "arguments":[
                  "{{widgets.Permission.memory.twilio.collected_data.collect_permission.answers.permission.answer}}"
                ],
                "value":"no"
              }
            ],
            "event":"match",
            "next":"send_message_NO"
          }
        ],
        "type":"split-based-on",
        "name":"split_permission",
        "properties":{
          "input":"{{widgets.Permission.memory.twilio.collected_data.collect_permission.answers.permission.answer}}",
          "offset":{
            "y":370,
            "x":-1710
          }
        }
      },
      {
        "transitions":[
          {
            "event":"sent"
          },
          {
            "event":"failed"
          }
        ],
        "type":"send-message",
        "name":"send_message_NO",
        "properties":{
          "body":"Please visit the ECPAT Philippines reporting page for anonymous reporting.\n\necpat.org.ph/report",
          "from":"Bot",
          "service":"{{trigger.message.InstanceSid}}",
          "to":"{{contact.channel.address}}",
          "offset":{
            "y":620,
            "x":-1800
          },
          "channel":"{{trigger.message.ChannelSid}}"
        }
      },
      {
        "transitions":[
          {
            "event":"sessionEnded",
            "next":"split_fil"
          },
          {
            "event":"failure"
          },
          {
            "event":"timeout"
          }
        ],
        "type":"send-to-auto-pilot",
        "name":"Permission_fil",
        "properties":{
          "body":"{{trigger.message.Body}}",
          "from":"{{flow.channel.address}}",
          "chat_service":"{{trigger.message.InstanceSid}}",
          "target_task":"greeting",
          "timeout":14400,
          "offset":{
            "y":130,
            "x":-580
          },
          "chat_channel":"{{trigger.message.ChannelSid}}",
          "autopilot_assistant_sid":module.custom_chatbots.permission_bot_fil_sid
        }
      },
      {
        "transitions":[
          {
            "event":"sent"
          },
          {
            "event":"failed"
          }
        ],
        "type":"send-message",
        "name":"no_permission_msg_fil",
        "properties":{
          "body":"mangyaring bisitahin ang hindi kilalang pahina ng pag-uulat ng ECPAT Philippines ecpat.org.ph/report",
          "from":"{{flow.channel.address}}",
          "service":"{{trigger.message.InstanceSid}}",
          "to":"{{contact.channel.address}}",
          "offset":{
            "y":660,
            "x":-470
          },
          "channel":"{{trigger.message.ChannelSid}}"
        }
      },
      {
        "transitions":[
          {
            "event":"noMatch"
          },
          {
            "conditions":[
              {
                "type":"contains",
                "friendly_name":"If value contains no",
                "arguments":[
                  "{{widgets.Permission_fil.memory.twilio.collected_data.collect_permission.answers.Permission.answer}}"
                ],
                "value":"no"
              }
            ],
            "event":"match",
            "next":"no_permission_msg_fil"
          },
          {
            "conditions":[
              {
                "type":"contains",
                "friendly_name":"If value contains yes",
                "arguments":[
                  "{{widgets.Permission_fil.memory.twilio.collected_data.collect_permission.answers.Permission.answer}}"
                ],
                "value":"yes"
              }
            ],
            "event":"match",
            "next":"PreSurvey_fil"
          }
        ],
        "type":"split-based-on",
        "name":"split_fil",
        "properties":{
          "input":"{{widgets.Permission_fil.memory.twilio.collected_data.collect_permission.answers.Permission.answer}}",
          "offset":{
            "y":380,
            "x":-400
          }
        }
      },
      {
        "transitions":[
          {
            "event":"sessionEnded",
            "next":"check_counselor_fil"
          },
          {
            "event":"failure"
          },
          {
            "event":"timeout"
          }
        ],
        "type":"send-to-auto-pilot",
        "name":"PreSurvey_fil",
        "properties":{
          "body":"{{trigger.message.Body}}",
          "from":"{{flow.channel.address}}",
          "chat_service":"{{trigger.message.InstanceSid}}",
          "target_task":"greeting",
          "timeout":14400,
          "offset":{
            "y":660,
            "x":-10
          },
          "chat_channel":"{{trigger.message.ChannelSid}}",
          "autopilot_assistant_sid":module.custom_chatbots.pre_survey_bot_fil_sid
        }
      },
      {
        "transitions":[
          {
            "event":"noMatch"
          },
          {
            "conditions":[
              {
                "type":"equal_to",
                "friendly_name":"If value equal_to counselor_handoff",
                "arguments":[
                  "{{widgets.PreSurvey_fil.CurrentTask}}"
                ],
                "value":"counselor_handoff"
              }
            ],
            "event":"match",
            "next":"AdjustAttributes_fil"
          }
        ],
        "type":"split-based-on",
        "name":"check_counselor_fil",
        "properties":{
          "input":"{{widgets.PreSurvey_fil.CurrentTask}}",
          "offset":{
            "y":920,
            "x":30
          }
        }
      },
      {
        "transitions":[
          {
            "event":"noMatch",
            "next":"defaultAttributes"
          },
          {
            "conditions":[
              {
                "type":"contains",
                "friendly_name":"If value equal_to facebook",
                "arguments":[
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value":"facebook"
              }
            ],
            "event":"match",
            "next":"facebookAttributes_fil"
          }
        ],
        "type":"split-based-on",
        "name":"AdjustAttributes_fil",
        "properties":{
          "input":"{{trigger.message.ChannelAttributes.channel_type}}",
          "offset":{
            "y":1200,
            "x":170
          }
        }
      },
      {
        "transitions":[
          {
            "event":"callComplete"
          },
          {
            "event":"failedToEnqueue"
          },
          {
            "event":"callFailure"
          }
        ],
        "type":"send-to-flex",
        "name":"facebookAttributes_fil",
        "properties":{
          "attributes":"{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"language\":\"Filipino\",\n\"memory\": {{widgets.PreSurvey_fil.memory | to_json}}}",
          "workflow":module.taskRouter.master_workflow_sid,
          "channel":module.taskRouter.chat_task_channel_sid,
          "offset":{
            "y":1430,
            "x":760
          }
        }
      }
    ],
    "initial_state":"Trigger",
    "flags":{
      "allow_concurrent_calls":true
    },
    "description":"Bot flow for creating a Flex messaging task"
  })
}

module "chatbots" {
  source = "../terraform-modules/chatbots/default"
  serverless_url = var.serverless_url
}

module "custom_chatbots" {
  source = "../terraform-modules/chatbots/ecpat"
  serverless_url = var.serverless_url
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
  helpline = var.helpline
}

module studioFlow {
  source = "../terraform-modules/studioFlow/default"
  custom_flow_definition = local.ecpat_flow_definition
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
  definition_version = var.definition_version
  serverless_url = var.serverless_url
  multi_office_support = var.multi_office
  feature_flags = var.feature_flags
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
}
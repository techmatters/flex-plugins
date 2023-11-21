terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  flow_definition = var.custom_flow_definition != "" ? var.custom_flow_definition : jsonencode({
    "states": [
      {
        "transitions": [
          {
            "event": "incomingMessage",
            "next": "split_web",
          },
          {
            "event": "incomingCall"
          },
          {
            "event": "incomingRequest"
          }
        ],
        "properties": {
          "offset": {
            "y": -70,
            "x": 0
          }
        }
      },
      {
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
        "type": "send-to-flex",
        "name": "smsAttributes",
        "properties": {
          "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{trigger.message.ChannelAttributes.memory | to_json}}}",
          "workflow": var.master_workflow_sid,
          "channel":  var.chat_task_channel_sid,
          "offset": {
            "y": 810,
            "x": 270
          }
        }
      },
      {
      "name": "language_selector_complete",
      "type": "split-based-on",
      "transitions": [
        {
          "next": "capture_channel_with_language_bot",
          "event": "noMatch"
        },
        {
          "next": "terms_conditions_complete",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "If value equal_to true",
              "arguments": [
                "{{trigger.message.ChannelAttributes.isSelectLanguageComplete}}"
              ],
              "type": "equal_to",
              "value": "true"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{trigger.message.ChannelAttributes.isSelectLanguageComplete}}",
        "offset": {
          "x": -360,
          "y": 190
        }
      }
    },
      {
      "name": "capture_channel_with_language_bot",
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
        "service_sid": var.service_sid,
        "environment_sid": var.environment_sid,
        "offset": {
          "x": -850,
          "y": 570
        },
        "function_sid": var.capture_channel_with_bot_function_sid,
        "parameters": [
          {
            "value": "{{flow.channel.address}}",
            "key": "channelSid"
          },
          {
            "value": "trigger_language_selector",
            "key": "message"
          },
          {
            "value": "{{flow.flow_sid}}",
            "key": "studioFlowSid"
          },
          {
            "value": "en-MT",
            "key": "language"
          },
          {
            "value": "language_selector",
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
            "value": "isSelectLanguageComplete",
            "key": "releaseFlag"
          },
          {
            "value": "languageMemory",
            "key": "memoryAttribute"
          }
        ],
        "url": "${var.serverless_url}/channelCapture/captureChannelWithBot"
      }
    },
      {
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
        "type": "send-to-flex",
        "name": "defaultAttributes",
        "properties": {
          "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{trigger.message.ChannelAttributes.memory | to_json}}}",
          "workflow": var.master_workflow_sid,
          "channel":  var.default_task_channel_sid,
          "offset": {
            "y": 810,
            "x": -690
          }
        }
      },
      {
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
        "type": "send-to-flex",
        "name": "whatsappAttributes",
        "properties": {
          "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{trigger.message.ChannelAttributes.memory | to_json}}}",
          "workflow": var.master_workflow_sid,
          "channel":  var.chat_task_channel_sid,
          "offset": {
            "y": 810,
            "x": -370
          }
        }
      },
      {
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
        "type": "send-to-flex",
        "name": "facebookAttributes",
        "properties": {
          "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{trigger.message.ChannelAttributes.memory | to_json}}}",
          "workflow": var.master_workflow_sid,
          "channel":  var.chat_task_channel_sid,
          "offset": {
            "y": 810,
            "x": -50
          }
        }
      },
      {
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
        "type": "send-to-flex",
        "name": "webAttributes",
        "properties": {
          "attributes": "{\"ip\":\"{{trigger.message.ChannelAttributes.pre_engagement_data.ip}}\",\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"{{trigger.message.ChannelAttributes.pre_engagement_data.helpline}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\"taskLanguage\": \"\",\n\"memory\": {{trigger.message.ChannelAttributes.memory | to_json}}}",
          "workflow": var.master_workflow_sid,
          "channel": var.chat_task_channel_sid,
          "offset": {
            "y": 810,
            "x": 590
          }
        }
      },
      {
        "transitions": [
          {
            "event": "noMatch",
            "next": "defaultAttributes"
          },
          {
            "conditions": [
              {
                "type": "equal_to",
                "friendly_name": "If value equal_to whatsapp",
                "arguments": [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value": "whatsapp"
              }
            ],
            "event": "match",
            "next": "whatsappAttributes"
          },
          {
            "conditions": [
              {
                "type": "equal_to",
                "friendly_name": "If value equal_to facebook",
                "arguments": [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value": "facebook"
              }
            ],
            "event": "match",
            "next": "facebookAttributes"
          },
          {
            "conditions": [
              {
                "type": "equal_to",
                "friendly_name": "If value equal_to sms",
                "arguments": [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value": "sms"
              }
            ],
            "event": "match",
            "next": "smsAttributes"
          },
          {
            "conditions": [
              {
                "type": "equal_to",
                "friendly_name": "If value equal_to web",
                "arguments": [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value": "web"
              }
            ],
            "event": "match",
            "next": "webAttributes"
          }
        ],
        "type": "split-based-on",
        "name": "AdjustAttributes",
        "properties": {
          "input": "{{trigger.message.ChannelAttributes.channel_type}}",
          "offset": {
            "y": 560,
            "x": -200
          }
        }
      }
    ],
    "initial_state": "Trigger",
    "flags": {
      "allow_concurrent_calls": true
    },
    "description": "Bot flow for creating a Flex messaging task"
  })
}

resource "twilio_studio_flows_v2" "messaging_flow" {
  friendly_name = "Messaging Flow"
  status = "published"
  definition = local.flow_definition
}
/*
resource "twilio_studio_flows_v2" "twitter_messaging_flow" {
  friendly_name = "Twitter Messaging Flow"
  status = "published"
  definition = local.twitter_messaging_flow_definition
}*/

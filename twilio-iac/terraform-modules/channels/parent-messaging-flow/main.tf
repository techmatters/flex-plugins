terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  flow_definition = jsonencode(
  {
        "states": [
          {
            "transitions": [
              {
                "event": "incomingMessage",
                "next": "AvoidChatBot"
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
            "type": "trigger",
            "name": "Trigger",
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
              "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
              "workflow": var.master_workflow_sid,
              "channel": var.chat_task_channel_sid,
              "offset": {
                "y": 810,
                "x": 270
              }
            }
          },
          {
            "transitions": [
              {
                "event": "sessionEnded",
                "next": "check_counselor_handoff"
              },
              {
                "event": "failure"
              }
            ],
            "type": "send-to-auto-pilot",
            "name": "ChatBot",
            "properties": {
              "body": "{{trigger.message.Body}}",
              "from": "Bot",
              "chat_service": "{{trigger.message.InstanceSid}}",
              "target_task": "greeting",
              "timeout": 14400,
              "offset": {
                "y": 110,
                "x": -20
              },
              "chat_channel": "{{trigger.message.ChannelSid}}",
              "autopilot_assistant_sid": var.pre_survey_bot_sid
            }
          },
          {
            "transitions": [
              {
                "event": "noMatch"
              },
              {
                "conditions": [
                  {
                    "type": "equal_to",
                    "friendly_name": "If value equal_to counselor_handoff",
                    "arguments": [
                      "{{widgets.ChatBot.CurrentTask}}"
                    ],
                    "value": "counselor_handoff"
                  }
                ],
                "event": "match",
                "next": "AdjustAttributes"
              }
            ],
            "type": "split-based-on",
            "name": "check_counselor_handoff",
            "properties": {
              "input": "{{widgets.ChatBot.CurrentTask}}",
              "offset": {
                "y": 340,
                "x": -20
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
            "name": "defaultAttributes",
            "properties": {
              "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
              "workflow": var.master_workflow_sid,
              "channel": var.chat_task_channel_sid,
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
              "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
              "workflow": var.master_workflow_sid,
              "channel": var.chat_task_channel_sid,
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
              "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
              "workflow": var.master_workflow_sid,
              "channel": var.chat_task_channel_sid,
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
              "attributes": "{\"ip\":\"{{trigger.message.ChannelAttributes.pre_engagement_data.ip}}\",\"firstName\": \"{{trigger.message.ChannelAttributes.from}}\",\"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"SafeSpot\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
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
          },
          {
            "transitions": [
              {
                "event": "noMatch",
                "next": "ChatBot"
              },
              {
                "conditions": [
                  {
                    "type": "equal_to",
                    "friendly_name": "If value equal_to instagram",
                    "arguments": [
                      "{{trigger.message.ChannelAttributes.channel_type}}"
                    ],
                    "value": "instagram"
                  }
                ],
                "event": "match",
                "next": "CustomSubFlows"
              }
            ],
            "type": "split-based-on",
            "name": "AvoidChatBot",
            "properties": {
              "input": "{{trigger.message.ChannelAttributes.channel_type}}",
              "offset": {
                "y": 140,
                "x": 420
              }
            }
          },
          {
            "transitions": [
              {
                "event": "completed"
              },
              {
                "event": "failed"
              }
            ],
            "type": "run-subflow",
            "name": "CustomSubFlows",
            "properties": {
              "offset": {
                "y": 420,
                "x": 680
              },
              "flow_sid": var.custom_messaging_studio_subflow_sid,
              "flow_revision": "LatestPublished"
            }
          }
        ],
        "initial_state": "Trigger",
        "flags": {
          "allow_concurrent_calls": true
        },
        "description": "Parent Messaging Flow"
      }
  )
}

  resource "twilio_studio_flows_v2" "parent_messaging_flow" {
    friendly_name = "Parent Messaging Flow"
    status = "published"
    definition = local.flow_definition
  }

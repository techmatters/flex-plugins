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
            "transitions": [
              {
                "event": "incomingMessage",
                "next": "chatbot"
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
                "y": -90,
                "x": -90
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
            "name": "chatbot",
            "properties": {
              "body": "{{trigger.message.Body}}",
              "from": "Bot",
              "chat_service": "{{trigger.message.InstanceSid}}",
              "target_task": var.target_task_name,
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
                      "{{widgets.chatbot.CurrentTask}}"
                    ],
                    "value": "counselor_handoff"
                  }
                ],
                "event": "match",
                "next": "messenger_attributes"
              }
            ],
            "type": "split-based-on",
            "name": "check_counselor_handoff",
            "properties": {
              "input": "{{widgets.chatbot.CurrentTask}}",
              "offset": {
                "y": 400,
                "x": 70
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
            "name": "messenger_attributes",
            "properties": {
              "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.chatbot.memory | to_json}}}",
              "workflow":  var.master_workflow_sid,
              "channel": var.chat_task_channel_sid,
              "offset": {
                "y": 670,
                "x": 310
              }
            }
          }
        ],
        "initial_state": "Trigger",
        "flags": {
          "allow_concurrent_calls": true
        },
        "description": "Messenger Messaging Flow"
      }
  )
}

  resource "twilio_studio_flows_v2" "messenger_messaging_flow" {
    friendly_name = "Messenger Messaging Flow"
    status = "published"
    definition = local.flow_definition
  }

  resource "twilio_flex_flex_flows_v1" "messenger_flow" {
    channel_type  = "facebook"
    chat_service_sid = var.flex_chat_service_sid
    friendly_name = "Flex Mesenger Channel Flow"
    integration_type = "studio"
    contact_identity     = "facebook"
    integration_flow_sid = twilio_studio_flows_v2.messenger_messaging_flow.sid
    enabled = true
  }

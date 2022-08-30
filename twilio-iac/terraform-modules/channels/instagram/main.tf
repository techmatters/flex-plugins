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
              "next": "Instagram"
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
              "y": 0,
              "x": 0
            }
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
                  "type": "contains",
                  "friendly_name": "If value equal_to instagram",
                  "arguments": [
                    "{{trigger.message.ChannelAttributes.channel_type}}"
                  ],
                  "value": "instagram"
                }
              ],
              "event": "match",
              "next": "InstagramAttributes"
            }
          ],
          "type": "split-based-on",
          "name": "Instagram",
          "properties": {
            "input": "{{trigger.message.ChannelAttributes.channel_type}}",
            "offset": {
              "y": 260,
              "x": 120
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
          "name": "InstagramAttributes",
          "properties": {
            "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\",\"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\",\"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
            "workflow":  var.master_workflow_sid,
            "channel": var.chat_task_channel_sid,
            "offset": {
              "y": 520,
              "x": 300
            }
          }
        }
      ],
      "initial_state": "Trigger",
      "flags": {
        "allow_concurrent_calls": true
      },
      "description": "Instagram Messaging Flow"
    }
  )
}

  resource "twilio_studio_flows_v2" "instagram_messaging_flow" {
    friendly_name = "Instagram Messaging Flow"
    status = "published"
    definition = local.flow_definition
  }

  resource "twilio_flex_flex_flows_v1" "instagram_flow" {
    channel_type  = "custom"
    chat_service_sid = var.flex_chat_service_sid
    friendly_name = "Flex Instagram Channel Flow"
    integration_type = "studio"
    contact_identity     = "instagram"
    integration_flow_sid = twilio_studio_flows_v2.instagram_messaging_flow.sid
    enabled = true
  }

  resource "aws_ssm_parameter" "instagram_flex_flow_sid_parameter" {
    name  = "${var.short_environment}_TWILIO_${var.short_helpline}_INSTAGRAM_FLEX_FLOW_SID"
    type  = "SecureString"
    value = twilio_flex_flex_flows_v1.instagram_flow.sid
    description = "Instagram Flex Flow SID"
  }

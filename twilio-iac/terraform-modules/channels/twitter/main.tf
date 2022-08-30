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
            "next": "Twitter"
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
                "type": "equal_to",
                "friendly_name": "If value equal_to twitter",
                "arguments": [
                  "{{trigger.message.ChannelAttributes.channel_type}}"
                ],
                "value": "twitter"
              }
            ],
            "event": "match",
            "next": "TwitterAttributes"
          }
        ],
        "type": "split-based-on",
        "name": "Twitter",
        "properties": {
          "input": "{{trigger.message.ChannelAttributes.channel_type}}",
          "offset": {
            "y": 210,
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
        "name": "TwitterAttributes",
        "properties": {
          "attributes": "{\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"twitterUserHandle\": \"{{trigger.message.ChannelAttributes.twitterUserHandle}}\",\"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\",\"twilioNumber\": \"{{trigger.message.ChannelAttributes.twilioNumber}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow":  var.master_workflow_sid,
          "channel": var.chat_task_channel_sid,
          "offset": {
            "y": 480,
            "x": 190
          }
        }
      }
    ],
    "initial_state": "Trigger",
    "flags": {
      "allow_concurrent_calls": true
    },
    "description": "Twitter Messaging Flow"
  }
  )
}

  resource "twilio_studio_flows_v2" "twitter_messaging_flow" {
    friendly_name = "Twitter Messaging Flow"
    status = "published"
    definition = local.flow_definition
  }

  resource "twilio_flex_flex_flows_v1" "twitter_flow" {
    channel_type  = "custom"
    chat_service_sid = var.flex_chat_service_sid
    friendly_name = "Flex Twitter Channel Flow"
    integration_type = "studio"
    contact_identity     = "twitter"
    integration_flow_sid = twilio_studio_flows_v2.twitter_messaging_flow.sid
    enabled = true
  }

  resource "aws_ssm_parameter" "twitter_flex_flow_sid_parameter" {
    name  = "${var.short_environment}_TWILIO_${var.short_helpline}_TWITTER_FLEX_FLOW_SID"
    type  = "SecureString"
    value = twilio_flex_flex_flows_v1.twitter_flow.sid
    description = "Twitter Flex Flow SID"
  }

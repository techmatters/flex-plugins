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
                "event": "incomingParent",
                "next": "TwitterAttributes"
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
        "description": "Custom Sub Flow"
      }
  )
}

  resource "twilio_studio_flows_v2" "custom_messaging_subflow" {
    friendly_name = "Custom Messaging SubFlow"
    status = "published"
    definition = local.flow_definition
  }

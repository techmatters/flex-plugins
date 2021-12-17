locals {
  flow_definition = jsonencode({
    "states": [
      {
        "transitions": [
          {
            "event": "incomingMessage",
            "next": "ChatBot"
          },
          {
            "event": "incomingCall"
          },
          {
            "event": "incomingRequest"
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
          "workflow": twilio_taskrouter_workspaces_workflows_v1.master_workflow.sid,
          "channel":  twilio_taskrouter_workspaces_task_channels_v1.chat.sid,
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
          "autopilot_assistant_sid": twilio_autopilot_assistants_v1.pre_survey.sid
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
          "workflow": twilio_taskrouter_workspaces_workflows_v1.master_workflow.sid,
          "channel":  twilio_taskrouter_workspaces_task_channels_v1.default.sid,
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
          "workflow": twilio_taskrouter_workspaces_workflows_v1.master_workflow.sid,
          "channel":  twilio_taskrouter_workspaces_task_channels_v1.chat.sid,
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
          "workflow": twilio_taskrouter_workspaces_workflows_v1.master_workflow.sid,
          "channel":  twilio_taskrouter_workspaces_task_channels_v1.chat.sid,
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
          "attributes": "{\"ip\":\"{{trigger.message.ChannelAttributes.pre_engagement_data.ip}}\",\"name\": \"{{trigger.message.ChannelAttributes.from}}\", \"channelType\": \"{{trigger.message.ChannelAttributes.channel_type}}\", \"channelSid\": \"{{trigger.message.ChannelSid}}\", \"helpline\": \"{{trigger.message.ChannelAttributes.pre_engagement_data.helpline}}\", \"ignoreAgent\":\"\", \"transferTargetType\":\"\",\n\"memory\": {{widgets.ChatBot.memory | to_json}}}",
          "workflow": twilio_taskrouter_workspaces_workflows_v1.master_workflow.sid,
          "channel": twilio_taskrouter_workspaces_task_channels_v1.chat.sid,
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
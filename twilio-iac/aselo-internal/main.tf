terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.9.2"
    }
  }
}

variable "account_sid" {}
variable "auth_token" {}
variable "helpline" {}

provider "twilio" {
  # Configuration options
  username = var.account_sid
  password  = var.auth_token
}

resource "twilio_chat_services_v2" "flex_chat_service" {
  friendly_name = "Flex Chat Service"
}

resource "twilio_api_accounts_keys_v2010" "shared_state_key" {
  friendly_name = "Shared State Service"
}

resource "twilio_api_accounts_keys_v2010" "hrm_static_key" {
  friendly_name = "hrm-static-key"
}

// Workspaces
resource "twilio_taskrouter_workspaces_v1" "flex_task_assignment" {
  friendly_name      = "Flex Task Assignment"
  event_callback_url = null // Optional param
  multi_task_enabled = true // Optional param
}


//TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "helpline_queue" {
  friendly_name  = var.helpline
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = "helpline=='${var.helpline}'"
}

// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "master_workflow" {
  friendly_name = "Master Workflow"
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  configuration = <<EOF
{
  "task_routing": {
        "filters": [
          {
            "filter_friendly_name": "${var.helpline}",
            "expression": "helpline=='${var.helpline}'",
            "targets": [
              {
                "expression":
                  "(worker.waitingOfflineContact != true AND ((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0)) AND ((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)",
                "queue": "${twilio_taskrouter_workspaces_task_queues_v1.helpline_queue.sid}"
              }
            ]
          }
        ]
      }
}
EOF
}

//Sync Service
resource "twilio_sync_services_v1" "shared_state_service" {
  friendly_name                   = "Shared State Service"
}
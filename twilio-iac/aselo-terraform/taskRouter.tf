
variable "account_sid" {}
variable "helpline" {}
variable "short_helpline" {}

variable "environment" {}
variable "short_environment" {}

variable "datadog_app_id" {}
variable "datadog_access_token" {}
variable "operating_info_key" {}


provider "twilio" {
  # Configuration options
  # Override the account_sid with the one in the tfvars file you provide.
  # This means if your twilio environment variables are set to the wrong account, it will get an auth failure rather than risking trashing an account
  username = var.account_sid
}


// Workspaces
resource "twilio_taskrouter_workspaces_v1" "flex_task_assignment" {
  friendly_name      = "Flex Task Assignment"
  multi_task_enabled = true
  event_callback_url = "${var.serverless_url}/webhooks/taskrouterCallback"
  events_filter = "task.created,task.canceled,task.completed" //Ignore the docs where it implies this should be 'EventsFilter=task.created, task.canceled, task.completed'
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
  configuration = jsonencode(
{
  "task_routing": {
        "filters": [
          {
            "filter_friendly_name": var.helpline,
            "expression": "helpline=='${var.helpline}'",
            "targets": [
              {
                "expression": "(worker.waitingOfflineContact != true AND ((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0)) AND ((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)",
                "queue": twilio_taskrouter_workspaces_task_queues_v1.helpline_queue.sid
              }
            ]
          }
        ]
      }
})
}

//Sync Service
resource "twilio_sync_services_v1" "shared_state_service" {
  friendly_name                   = "Shared State Service"
}

resource "twilio_taskrouter_workspaces_task_channels_v1" "default" {
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = "Default"
  unique_name = "default"
}

resource "twilio_taskrouter_workspaces_task_channels_v1" "chat" {
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = "Programmable Chat"
  unique_name = "chat"
}

resource "twilio_taskrouter_workspaces_task_channels_v1" "voice" {
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = "Voice"
  unique_name = "voice"
}

resource "twilio_taskrouter_workspaces_task_channels_v1" "sms" {
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = "SMS"
  unique_name = "sms"
}

resource "twilio_taskrouter_workspaces_task_channels_v1" "video" {
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = "Video"
  unique_name = "video"
}

resource "twilio_taskrouter_workspaces_task_channels_v1" "email" {
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = "Email"
  unique_name = "email"
}
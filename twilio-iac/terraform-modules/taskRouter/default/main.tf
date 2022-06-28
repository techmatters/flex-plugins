terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  helplines = var.helplines == null ? [var.helpline] : var.helplines
  helplines_filter = "helpline IN [${join(", ", formatlist("'%s'", local.helplines))}]"
  helplines_friendly_name = join(", ", compact(local.helplines))
  task_routing_filter_expression = var.custom_task_routing_filter_expression != "" ? var.custom_task_routing_filter_expression : "${local.helplines_filter} OR channelType ==\"web\" "
  task_routing_survey_queue_target_filter_expression = var.custom_task_routing_survey_queue_target_filter_expression != "" ? var.custom_task_routing_survey_queue_target_filter_expression : file("${path.module}/default_target_expression.tftpl")
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
  friendly_name  = local.helplines_friendly_name
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = var.custom_target_workers != "" ? var.custom_target_workers : local.helplines_filter
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
          "filter_friendly_name": local.helplines_friendly_name,
          "expression": local.task_routing_filter_expression,
          "targets": [
            {
              "expression": local.task_routing_survey_queue_target_filter_expression,
              "queue": twilio_taskrouter_workspaces_task_queues_v1.helpline_queue.sid
            }
          ]
        }
      ]
    }
  })
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
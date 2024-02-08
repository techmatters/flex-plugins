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
  helplines_filter = var.helplines == null ? "1==1" : "helpline IN [${join(", ", formatlist("'%s'", local.helplines))}]"
  helplines_friendly_name = join(", ", compact(local.helplines))
  task_routing_filter_expression = var.custom_task_routing_filter_expression != "" ? var.custom_task_routing_filter_expression : "${local.helplines_filter} OR channelType ==\"web\" OR isContactlessTask == true"
  default_target_expression = file("${path.module}/../default/default_target_expression.tftpl")
}

// Workspaces
resource "twilio_taskrouter_workspaces_v1" "flex_task_assignment" {
  friendly_name      = "Flex Task Assignment"
  multi_task_enabled = true
  event_callback_url = "${var.serverless_url}/webhooks/taskrouterCallback"
  events_filter = "task.created,task.canceled,task.completed,task.deleted,task.wrapup,task-queue.entered,task.system-deleted,reservation.accepted,reservation.rejected,reservation.timeout,reservation.wrapup" //Ignore the docs where it implies this should be 'EventsFilter=task.created, task.canceled, task.completed'
}

//TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "helpline_queue" {
  friendly_name  = local.helplines_friendly_name
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = var.custom_target_workers != "" ? var.custom_target_workers : local.helplines_filter
}

// Outside Operating Hours TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "outside_operating_hours_queue" {
  friendly_name  = "Outside Operating Hours"
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = var.custom_target_workers != "" ? var.custom_target_workers : local.helplines_filter
}

// Non Counselling TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "non_counselling_queue" {
  friendly_name  = "Non Counselling"
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = "1==0"
}

// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "master_workflow" {
  friendly_name = "Master Workflow"
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  configuration = jsonencode(
  {
    "task_routing":{
      filters: [
        {
          "filter_friendly_name": local.helplines_friendly_name,
          "expression": local.task_routing_filter_expression,
          "targets":  [
            {
              expression = local.default_target_expression,
              queue = twilio_taskrouter_workspaces_task_queues_v1.helpline_queue.sid,
            }
          ]
        }
      ]
    }
  })
}

// Outside Operating Hours Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "outside_operating_hours_workflow" {
  friendly_name = "Outside Operating Hours Workflow"
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  configuration = jsonencode(
  {
    "task_routing":{
      filters: [
        {
          "filter_friendly_name": "Outside Operating Hours",
          "expression": local.task_routing_filter_expression,
          "targets":  [
            {
              expression = local.default_target_expression,
              queue = twilio_taskrouter_workspaces_task_queues_v1.outside_operating_hours_queue.sid,
            }
          ]
        }
      ]
    }
  })
}

// Non Counselling
resource "twilio_taskrouter_workspaces_workflows_v1" "non_counselling_workflow" {
  friendly_name = "Non Counselling Workflow"
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  configuration = jsonencode(
  {
    "task_routing":{
      filters: [
        {
          "filter_friendly_name": "Non Counselling",
          "expression": local.task_routing_filter_expression,
          "targets":  [
            {
              expression = "1==0",
              queue = twilio_taskrouter_workspaces_task_queues_v1.non_counselling_queue.sid,
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

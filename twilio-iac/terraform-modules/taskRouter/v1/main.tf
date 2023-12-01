terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  helplines                      = var.helplines == null ? [var.helpline] : var.helplines
  helplines_filter               = var.helplines == null ? "1==1" : "helpline IN [${join(", ", formatlist("'%s'", local.helplines))}]"
  task_routing_filter_expression = var.custom_task_routing_filter_expression != "" ? var.custom_task_routing_filter_expression : "${local.helplines_filter} OR channelType =='web' OR isContactlessTask == true"
  event_callback_url             = "${var.serverless_url}/webhooks/taskrouterCallback"
}

// This module assumes that we only work with one Workspace
// Workspace
resource "twilio_taskrouter_workspaces_v1" "flex_task_assignment" {
  friendly_name      = "Flex Task Assignment"
  multi_task_enabled = true
  event_callback_url = local.event_callback_url
  events_filter      = join(",", var.events_filter)
}

// Task Queue
resource "twilio_taskrouter_workspaces_task_queues_v1" "task_queue" {
  for_each             = var.task_queues
  friendly_name        = each.value.friendly_name
  max_reserved_workers = try(each.value.max_reserved_workers, null)
  workspace_sid        = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  target_workers       = each.value.target_workers
}

moved {
  from = twilio_taskrouter_workspaces_task_queues_v1.helpline_queue
  to   = twilio_taskrouter_workspaces_task_queues_v1.task_queue["master"]
}



// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "workflow" {
  for_each                 = var.workflows
  friendly_name            = each.value.friendly_name
  task_reservation_timeout = try(each.value.task_reservation_timeout, null)
  workspace_sid            = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  configuration = templatefile(
    each.value.templatefile,
    {
      task_queues                    = { for idx, tq in var.task_queues : idx => twilio_taskrouter_workspaces_task_queues_v1.task_queue[idx].sid }
      helpline                       = var.helpline
      helplines                      = local.helplines
      task_routing_filter_expression = local.task_routing_filter_expression
      phone_numbers                  = var.phone_numbers
      workflow_vars                  = var.workflow_vars
    }
  )
}

moved {
  from = twilio_taskrouter_workspaces_workflows_v1.master_workflow
  to   = twilio_taskrouter_workspaces_workflows_v1.workflow["master"]
}


//Task Channels
resource "twilio_taskrouter_workspaces_task_channels_v1" "task_channel" {
  for_each      = var.task_channels
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = each.value
  unique_name   = each.key
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.default
  to   = twilio_taskrouter_workspaces_task_channels_v1.task_channel["default"]
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.chat
  to   = twilio_taskrouter_workspaces_task_channels_v1.task_channel["chat"]
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.voice
  to   = twilio_taskrouter_workspaces_task_channels_v1.task_channel["voice"]
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.sms
  to   = twilio_taskrouter_workspaces_task_channels_v1.task_channel["sms"]
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.video
  to   = twilio_taskrouter_workspaces_task_channels_v1.task_channel["video"]
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.email
  to   = twilio_taskrouter_workspaces_task_channels_v1.task_channel["email"]
}



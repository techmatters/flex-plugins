terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

locals {
  helplines               = var.helplines == null ? [var.helpline] : var.helplines
  helplines_filter        = var.helplines == null ? "1==1" : "helpline IN [${join(", ", formatlist("'%s'", local.helplines))}]"
  helplines_friendly_name = join(", ", compact(local.helplines))
}

// This module assumes that we only work with one Workspace
// Workspace
resource "twilio_taskrouter_workspaces_v1" "flex_task_assignment" {
  friendly_name      = "Flex Task Assignment"
  multi_task_enabled = true
  event_callback_url = var.event_callback_url
  events_filter      = join(",", [for ef in var.events_filter : ef])
}

// Task Queue
resource "twilio_taskrouter_workspaces_task_queues_v1" "task_queue" {
  for_each       = { for tq in var.task_queues : tq.friendly_name => tq.target_workers }
  friendly_name  = each.key
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  target_workers = each.value
}

// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "workflow" {
  for_each      = { for w in var.workflows : w.friendly_name => w }
  friendly_name = each.key
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  configuration = jsonencode(
    {
      task_routing = {
        filters = [
          for f in each.value.filters : {
            filter_friendly_name = f.filter_friendly_name
            expression           = f.expression
            targets = [
              for t in f.targets : {
                expression = t.expression
                queue      = twilio_taskrouter_workspaces_task_queues_v1.task_queue[t.queue].id
                timeout    = t.timeout
                priority   = t.priority
                skip_if    = t.skip_if
              }
            ]
      }] }
  })
}

//Task Channels
resource "twilio_taskrouter_workspaces_task_channels_v1" "task_channel" {
  for_each      = { for tc in var.task_channels : tc.unique_name => tc }
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
  friendly_name = each.value.friendly_name
  unique_name   = each.value.unique_name
}

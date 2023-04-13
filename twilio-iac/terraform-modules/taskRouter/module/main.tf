terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}
// This module assumes that we only work with one Workspace
// Workspace
resource "twilio_taskrouter_workspaces_v1" "flex_task_assignment" {
  friendly_name      = "Flex Task Assignment"
  multi_task_enabled = true
  event_callback_url = var.event_callback_url
  events_filter = var.events_filter
}

// Task Queue
resource "twilio_taskrouter_workspaces_task_queues_v1" "task_queue" {
  for_each       = var.task_queues 
  friendly_name  = each.value.friendly_name
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = each.value.target_workers
}

// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "workflow" {
  for_each      = var.workflows
  friendly_name = each.value.friendly_name
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  configuration = jsonencode(
  {
    task_routing =  {
      filters = [ 
        for f in each.value.filters : {
          filter_friendly_name  = f.filter_friendly_name
          expression            = f.expression
          targets = [
            for t in f.targets : {
              expression  = t.expression
              queue       = module.taskRouter.module.twilio_taskrouter_workspaces_task_queues_v1.task_queue[t.task_queue_friendly_name].id
              timeout     = t.timeout ? t.timeout : null
              priority    = t.priority ? t.priority : null
              skip_if     = t.skip_if ? t.skip_if : null
            }
          ]
        }]}
  })
}

//Task Channels

resource "twilio_taskrouter_workspaces_task_channels_v1" "task_channel" {
  for_each      = var.task_channels
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  friendly_name = each.value.friendly_name
  unique_name   = each.value.unique_name
}

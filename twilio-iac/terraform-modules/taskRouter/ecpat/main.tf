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
  default_target_expression = file("${path.module}/../default/default_target_expression.tftpl")
}

// Workspaces
resource "twilio_taskrouter_workspaces_v1" "flex_task_assignment" {
  friendly_name      = "Flex Task Assignment"
  multi_task_enabled = true
  event_callback_url = "${var.serverless_url}/webhooks/taskrouterCallback"
  events_filter = "task.created,task.canceled,task.completed,task.deleted,task.system-deleted" //Ignore the docs where it implies this should be 'EventsFilter=task.created, task.canceled, task.completed'
}

// TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "helpline_queue" {
  friendly_name  = local.helplines_friendly_name
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = var.custom_target_workers
}

// Outside Operating Hours TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "outside_operating_hours_task_queue" {
  friendly_name  = "Outside Operating Hours"
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = var.custom_target_workers
}

// Non Counselling TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "non_counselling_hours_task_queue" {
  friendly_name  = "Non Counselling"
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = ""
}

// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "master_workflow" {
  friendly_name = "Master Workflow"
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  configuration = templatefile(
    "${path.module}/Master Workflow.tftpl",
    {
      all_counsellors_target_expression = local.default_target_expression
      ecpat_target_expression = local.default_target_expression
      eyca_target_expression = local.default_target_expression
      ecpat_task_queue_sid = twilio_taskrouter_workspaces_task_queues_v1.helpline_queue.sid
      eyca_task_queue_sid = twilio_taskrouter_workspaces_task_queues_v1.eyca_task_queue.sid
      ecpat_messenger_number = var.ecpat_messenger_number
      eyca_messenger_number = var.eyca_messenger_number
    }
  )
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

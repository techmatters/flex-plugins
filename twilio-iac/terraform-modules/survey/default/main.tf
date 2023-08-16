terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

// TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "survey_queue" {
  friendly_name  = "Survey"
  workspace_sid  = var.flex_task_assignment_workspace_sid
  target_workers = "1==0"
}

// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "survey_workflow" {
  friendly_name = "Survey"
  workspace_sid = var.flex_task_assignment_workspace_sid
  configuration = jsonencode({
    "task_routing" : {
      "filters" : [
        {
          "filter_friendly_name" : "CaptureChannel",
          "expression" : "isChatCaptureControl==true",
          "targets" : [
            {
              "queue" : twilio_taskrouter_workspaces_task_queues_v1.survey_queue.sid
            }
          ]
        }
      ]
    }
  })
}

//Task channel

resource "twilio_taskrouter_workspaces_task_channels_v1" "survey" {
  workspace_sid = var.flex_task_assignment_workspace_sid
  friendly_name = "Survey"
  unique_name   = "survey"
}

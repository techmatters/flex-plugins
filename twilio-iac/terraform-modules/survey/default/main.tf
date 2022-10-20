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
    "task_routing": {
      "filters": [
        {
          "filter_friendly_name": "Survey Filter",
          "expression": var.custom_task_routing_filter_expression != "" ? var.custom_task_routing_filter_expression : "isSurveyTask==true",
          "targets": [
            {
              "expression": var.custom_task_routing_survey_queue_target_filter_expression,
              "queue": twilio_taskrouter_workspaces_task_queues_v1.survey_queue.sid
            }
          ]
        }
      ]
    }
  })
}

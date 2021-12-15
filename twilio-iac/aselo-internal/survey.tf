//TaskQueue
resource "twilio_taskrouter_workspaces_task_queues_v1" "survey_queue" {
  friendly_name  = "Survey"
  workspace_sid  = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  target_workers = "1==0"
}

// Workflow
resource "twilio_taskrouter_workspaces_workflows_v1" "survey_workflow" {
  friendly_name = "Survey"
  workspace_sid = twilio_taskrouter_workspaces_v1.flex_task_assignment.id
  configuration = jsonencode({
  "task_routing": {
        "filters": [
          {
            "filter_friendly_name": "Survey Filter",
            "expression": "helpline=='${var.helpline}'",
            "targets": [
              {
                "expression": "isSurveyTask==true",
                "queue": twilio_taskrouter_workspaces_task_queues_v1.survey_queue.sid
              }
            ]
          }
        ]
      }
})
}
output "survey_workflow_sid" {
  description = "Twilio SID of the 'Survey Workflow' service"
  value = twilio_taskrouter_workspaces_workflows_v1.survey_workflow.sid
}
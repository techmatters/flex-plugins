output "flex_task_assignment_workspace_sid" {
  description = "Twilio SID of the 'Flex Task Assignment' workspace"
  value = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
}

output "workflow_id" {
  value = zipmap( values(twilio_taskrouter_workspaces_workflows_v1.workflow)[*].friendly_name, values(twilio_taskrouter_workspaces_workflows_v1.workflow)[*].id ) 
}

output "task_channel_id" {
  value = zipmap( values(twilio_taskrouter_workspaces_task_channels_v1.task_channel)[*].friendly_name, values(twilio_taskrouter_workspaces_task_channels_v1.task_channel)[*].id ) 
}
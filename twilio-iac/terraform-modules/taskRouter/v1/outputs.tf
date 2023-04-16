output "flex_task_assignment_workspace_sid" {
  description = "Twilio SID of the 'Flex Task Assignment' workspace"
  value       = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
}

output "workflow_ids" {
  value = { for w in var.workflows : w.name => twilio_taskrouter_workspaces_workflows_v1.workflow[w.name].sid }
  # value = zipmap(values(twilio_taskrouter_workspaces_workflows_v1.workflow)[*].name, values(twilio_taskrouter_workspaces_workflows_v1.workflow)[*].id)
}

output "task_channel_ids" {
  value = { for tc in var.task_channels : tc.unique_name => twilio_taskrouter_workspaces_task_channels_v1.task_channel[tc.unique_name].sid }
}

output "flex_task_assignment_workspace_sid" {
  description = "Twilio SID of the 'Flex Task Assignment' workspace"
  value       = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
}

output "workflow_sids" {
  value = { for idx, w in var.workflows : idx => try(twilio_taskrouter_workspaces_workflows_v1.workflow[idx].sid, "") }
}

output "task_channel_sids" {
  value = { for idx, tc in var.task_channels : idx => try(twilio_taskrouter_workspaces_task_channels_v1.task_channel[idx].sid, "") }
}

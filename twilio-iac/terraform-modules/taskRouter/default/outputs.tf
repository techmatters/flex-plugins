output "flex_task_assignment_workspace_sid" {
  description = "Twilio SID of the 'Flex Task Assignment' workspace"
  value = twilio_taskrouter_workspaces_v1.flex_task_assignment.sid
}

output "master_workflow_sid" {
  description = "Twilio SID of the 'Master Workflow' service"
  value = twilio_taskrouter_workspaces_workflows_v1.master_workflow.sid
}

output "chat_task_channel_sid" {
  description = "Twilio SID of the 'chat' task channel"
  value = twilio_taskrouter_workspaces_task_channels_v1.chat.sid
}

output "voice_task_channel_sid" {
  description = "Twilio SID of the 'voice' task channel"
  value = twilio_taskrouter_workspaces_task_channels_v1.voice.sid
}

output "default_task_channel_sid" {
  description = "Twilio SID of the 'chat' task channel"
  value = twilio_taskrouter_workspaces_task_channels_v1.default.sid
}

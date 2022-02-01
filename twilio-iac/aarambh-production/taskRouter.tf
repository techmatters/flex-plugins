// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

// Workspaces
moved {
  from = twilio_taskrouter_workspaces_v1.flex_task_assignment
  to = module.taskRouter.twilio_taskrouter_workspaces_v1.flex_task_assignment
}

//TaskQueue
moved {
  from = twilio_taskrouter_workspaces_task_queues_v1.helpline_queue
  to = module.taskRouter.twilio_taskrouter_workspaces_task_queues_v1.helpline_queue
}

// Workflow
moved {
  from = twilio_taskrouter_workspaces_workflows_v1.master_workflow
  to = module.taskRouter.twilio_taskrouter_workspaces_workflows_v1.master_workflow
}

//Sync Service
moved {
  from = twilio_sync_services_v1.shared_state_service
  to = module.services.twilio_sync_services_v1.shared_state_service
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.default
  to = module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.default
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.chat
  to = module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.chat
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.voice
  to = module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.voice
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.sms
  to = module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.sms
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.video
  to = module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.video
}

moved {
  from = twilio_taskrouter_workspaces_task_channels_v1.email
  to = module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.email
}
// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

// TaskQueue
moved {
  from = twilio_taskrouter_workspaces_task_queues_v1.survey_queue
  to = module.survey.twilio_taskrouter_workspaces_task_queues_v1.survey_queue
}

// Workflow
moved {
  from = twilio_taskrouter_workspaces_workflows_v1.survey_workflow
  to = module.survey.twilio_taskrouter_workspaces_workflows_v1.survey_workflow
}
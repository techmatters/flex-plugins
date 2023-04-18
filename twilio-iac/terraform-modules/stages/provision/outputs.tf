output "serverless_url" {
  value = module.serverless.serverless_environment_production_url
}

output "serverless_environment_production_sid" {
  value = module.serverless.serverless_environment_production_sid
}

output "serverless_service_sid" {
  value = module.serverless.serverless_service_sid
}

output "task_router_master_workflow_sid" {
  value = module.taskRouter.workflow_ids["master"]
}

output "task_router_chat_task_channel_sid" {
  value = module.taskRouter.task_channel_ids["chat"]
}

output "task_router_voice_task_channel_sid" {
  value = module.taskRouter.task_channel_ids["voice"]
}

output "services_flex_chat_service_sid" {
  value = module.services.flex_chat_service_sid
}

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    task_router_config = {
      event_filters = [
        "task.created",
        "task.canceled",
        "task.completed",
        "task.deleted",
        "task.system-deleted",
      ]

      additional_queues = [
        {
          friendly_name = "EYCA"
        }
      ]
    }
  }
}
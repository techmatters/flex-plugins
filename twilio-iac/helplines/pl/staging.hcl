locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType ==\"web\" OR isContactlessTask == true OR  phone=='+16602359810' OR phone=='+48800012935'"
  }
}
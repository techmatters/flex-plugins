/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    helpline_region = "eu-west-1"

    custom_task_routing_filter_expression = ""
    flow_vars = {
      service_sid                   = "ZSbfebd43b19b4db9e3bd763b72b101eaf"
      environment_sid               = "ZE12ad6d59ba95d24d43e184a21cfe3669"
      operating_hours_function_sid  = "ZH95bf7c7442969d4577caa5b656957f53"
      operating_hours_function_name = "operatingHours"
    }
  }
}

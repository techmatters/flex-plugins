/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType =='voice' OR channelType =='web' OR isContactlessTask == true"
    flow_vars = {
      service_sid                   = "ZS8a0d3bbfb230721c2609641ca8e17ce1"
      environment_sid               = "ZEc53cef7898c0b95ee402fb4144e90d1f"
      operating_hours_function_sid  = "ZH6ce19445f0d636acbc4768a52ca91e6f"
      operating_hours_function_name = "operatingHours"
    }
  }
}
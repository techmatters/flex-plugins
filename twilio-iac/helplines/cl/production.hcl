locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_datadog_monitoring = false
    #Studio flow
    flow_vars = {
      service_sid                   = "ZSe84c8040f76f6e331310f132b88c25d8"
      environment_sid               = "ZE79c328112066b496d1875fe19bfe2b5c"
      operating_hours_function_sid  = "ZHb02706803df7458aebd679967beb1005"
      operating_hours_function_name = "operatingHours"
    }
  }
}
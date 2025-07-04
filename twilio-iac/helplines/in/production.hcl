locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "isContactlessTask==true"


    flow_vars = {}


    channels = {}
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}
locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    operating_hours_enforced_override     = true
    #Studio flow
    flow_vars = {
      service_sid                   = "ZSeed7070ce3f2974cb12a0382a2c93340"
      environment_sid               = "ZEe424f8b564e45c01958e48a1bdfdb41d"
      operating_hours_function_sid  = "ZH3474ae11ae0fcd34edf418930a4abdaf"
      operating_hours_function_name = "operatingHours"
    }

    ui_editable = true
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}
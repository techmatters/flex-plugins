locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_external_recordings = true
    permission_config = "dev"
    get_profile_flags_for_identifiers_base_url = "hrm-development.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}
/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars = {
      widget_from          = "Aselo Okta Pilot"
      chat_blocked_message = "Sorry, you're not able to contact Aselo Okta Pilot from this device or account"
    }
    # Blocked-contact check used by the chat Studio flow (falls back to the old serverless URL if unset)
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"

    # Okta SAML app for this environment (okta-app stage). See twilio-iac/docs/okta.md
    okta_app = {
      optional_attribute_sets = ["labels", "team"]
      # Testing the new attribute statements (federated claims) before making them the default
      attribute_statements_mode = "federated"
    }
  }
}

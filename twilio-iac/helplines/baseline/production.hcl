/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars = {
      widget_from          = "<helpline name>"
      chat_blocked_message = "Sorry, you're not able to contact <helpline name> from this device or account"
    }
    # Blocked-contact check used by the chat Studio flow (falls back to the old serverless URL if unset).
    # eu-west-1 helplines: hrm-production-eu
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"

    # Okta SAML app for this environment (okta-app stage). See twilio-iac/docs/okta.md
    okta_app = {
      # New attribute statements (federated claims): the standard for new helplines (tested on ASOP)
      attribute_statements_mode = "federated"
      # optional_attribute_sets = ["labels", "team"]
    }
  }
}

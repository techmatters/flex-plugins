/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    # Okta SAML app for this environment (okta-app stage). See twilio-iac/docs/okta.md
    okta_app = {
      optional_attribute_sets = ["labels", "team"]
      # Testing the new attribute statements (federated claims) before making them the default
      attribute_statements_mode = "federated"
    }
  }
}

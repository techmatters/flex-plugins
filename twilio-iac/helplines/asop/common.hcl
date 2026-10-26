/**
 * Aselo Okta Pilot (ASOP): test helpline for the Okta / Flex SSO process (see twilio-iac/docs/okta.md).
 * Okta-only for now: only the okta-org and okta-app stages are expected to run for this helpline.
 * The rest of the helpline configuration will be added for the full onboarding test.
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline = "Aselo Okta Pilot"

    # Okta: helpline-level, shared by staging and production apps (okta-org stage). See twilio-iac/docs/okta.md
    okta = {
      group_name = "Aselo Okta Pilot (ASOP)"
      # Test of a Terraform-managed group rule: users whose Okta organization is "Aselo Okta Pilot"
      group_rule = { organizations = ["Aselo Okta Pilot"] }
    }
  }
}

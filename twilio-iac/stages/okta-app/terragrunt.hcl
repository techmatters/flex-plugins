/**
  * okta-app stage (Layer 2): the Okta SAML app for ONE helpline + environment.
  * Usage: make plan HL=<short code> HL_ENV=<staging|production>
  *
  * Requires the helpline group to exist first (okta-org stage) and the helpline config to have an
  * `okta` block in common.hcl and an `okta_app` block in the environment file. See twilio-iac/docs/okta.md.
  */
include "root" {
  path = find_in_parent_folders("terragrunt.root.hcl")

  expose = true
}

locals {
  local_config = {}

  config = merge(include.root.locals.config, local.local_config)

  root = include.root.locals
}

/**
  * Okta stages need the okta + http providers instead of twilio + datadog, so this stage
  * replaces the root "backend" generate block with its own template (same state bucket/key layout).
  */
generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents = templatefile(find_in_parent_folders("okta-backend.tftpl"), {
    use_local_state  = local.root.use_local_state
    local_state_path = "${get_terragrunt_dir()}/${local.root.short_helpline}-${local.root.environment}.tfstate"
    state_bucket     = "tl-terraform-state-${local.root.environment}"
    state_key        = "twilio/${local.root.short_helpline}/${local.root.stage}/terraform.tfstate"
    state_role_arn   = local.root.env_role
  })
}

inputs = local.config

terraform {
  source = "../../terraform-modules//stages/${include.root.locals.stage}"
}

/**
  * okta-org stage (Layer 1): helpline-level Okta objects (groups, group rules) for ALL helplines.
  * Not tied to a helpline or environment, so it does NOT include terragrunt.root.hcl and ignores HL/HL_ENV.
  * Usage: make plan   (from this directory)
  *
  * Input: the `okta` block of every helplines/<code>/common.hcl that has one. See twilio-iac/docs/okta.md.
  */
locals {
  helplines_dir = "${get_terragrunt_dir()}/../../helplines"

  # Every helpline's merged common config (defaults.hcl + common.hcl), keyed by short code
  common_configs = {
    for file in fileset(local.helplines_dir, "*/common.hcl") :
    dirname(file) => read_terragrunt_config("${local.helplines_dir}/${file}").locals.config
  }

  # baseline/ is the copy-me template for new helplines, not a real helpline
  helpline_okta = {
    for code, config in local.common_configs : code => config.okta
    if code != "baseline" && lookup(config, "okta", null) != null
  }

  # Okta is a single org shared by staging and production; its state lives in the production
  # state bucket under twilio/ (where tf-twilio-iac-production can write), see docs/okta.md.
  aws_account_id  = get_aws_account_id()
  state_role_arn  = "arn:aws:iam::${local.aws_account_id}:role/tf-twilio-iac-production"
  use_local_state = get_env("USE_LOCAL_STATE", "") != ""
}

generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents = templatefile(find_in_parent_folders("okta-backend.tftpl"), {
    use_local_state  = local.use_local_state
    local_state_path = "${get_terragrunt_dir()}/okta-org.tfstate"
    state_bucket     = "tl-terraform-state-production"
    state_key        = "twilio/okta-org/terraform.tfstate"
    state_role_arn   = local.state_role_arn
  })
}

generate "aws-provider" {
  path      = "aws-provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    provider "aws" {
      assume_role {
        role_arn     = "${local.state_role_arn}"
        session_name = "tf-okta-org"
      }
      region                      = "us-east-1"
      skip_region_validation      = true
      skip_credentials_validation = true
    }
  EOF
}

inputs = {
  helpline_okta = local.helpline_okta
}

terraform {
  source = "../../terraform-modules//stages/okta-org"
}

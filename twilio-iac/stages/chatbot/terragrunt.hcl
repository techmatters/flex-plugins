include "root" {
  path = find_in_parent_folders("terragrunt.root.hcl")

  expose = true
}

dependencies {
  paths = ["../provision", ]
}

dependency "provision" {
  config_path = "../provision"

  # Configure mock outputs for the `validate` command that are returned when there are no outputs available (e.g the
  # module hasn't been applied yet.
  mock_outputs_allowed_terraform_commands = ["validate"]
  mock_outputs = local.config.mock_outputs.provision
}

locals {
  local_config = {}

  config = merge(include.root.locals.config, local.local_config)
}

inputs = merge(
  local.config,
  {
    serverless_url = dependency.provision.outputs.serverless_url
  }
)

terraform {
  // TODO: remove this when we are ready to apply
  before_hook "abort_apply" {
    commands = ["apply"]
    execute  = ["exit", "1"]
  }

  source = "../../terraform-modules//stages/${include.root.locals.stage}"
}
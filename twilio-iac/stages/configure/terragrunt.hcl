include "root" {
  path = find_in_parent_folders("terragrunt.root.hcl")

  expose = true
}

dependencies {
  paths = [
    "../provision",
    "../chatbot",
  ]
}

dependency "provision" {
  config_path = "../provision"

  mock_outputs_allowed_terraform_commands = ["validate", "init", "state"]
  mock_outputs = local.config.mock_outputs.provision
}

dependency "chatbot" {
  config_path = "../chatbot"

  mock_outputs_allowed_terraform_commands = ["validate", "init", "state"]
  mock_outputs = local.config.mock_outputs.chatbot
}

locals {
  local_config = {}

  config = merge(include.root.locals.config, local.local_config)
}

inputs = local.config

terraform {

  // TODO: remove this when we are ready to apply
  before_hook "abort_apply" {
    commands = ["apply"]
    execute  = ["exit", "1"]
  }

  source = "../../terraform-modules//stages/${include.root.locals.stage}"

  // The state migration script is called via `make migrate-state` becuase it makes terragrunt calls which do weird things when nested
  // and so that we can avoid assume role chaining.
}
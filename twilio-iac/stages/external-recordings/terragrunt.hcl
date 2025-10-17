/**
  * We import the terragrunt root config that handles most of the shared setup and
  * configuration for all of our stages
  */
include "root" {
  path = find_in_parent_folders("terragrunt.root.hcl")

  expose = true
}

/**
  * We define the dependencies for this stage. These are the modules that this stage depends on.
  * this enables us to use the outputs of these modules in the configuration of this stage. It
  * also enables us to use plann-all, init-all, and apply-all to run TG commands in all of the
  *  stages in the correct order.
  */
dependencies {
  paths = include.root.locals.use_local_state ? [] : [
    "../provision"
  ]
}

// /**
//   * Dependency blocks allow us to mock outputs from previous stages so that we can
//   * validate, init, and manage state in dependant modules without having to apply
//   * the previous stages.
//   */
// dependency "provision" {
//   config_path = "../provision"

//   mock_outputs_allowed_terraform_commands = ["validate", "init", "state"]
//   mock_outputs                            = local.config.mock_outputs.provision
// }

// dependency "chatbot" {
//   config_path = "../chatbot"

//   mock_outputs_allowed_terraform_commands = ["validate", "init", "state"]
//   mock_outputs                            = local.config.mock_outputs.chatbot
// }

/**
  * We can override the root config with local configuration options if we need to.
  */
locals {
  local_config = {}

  config = merge(include.root.locals.config, local.local_config)
}

/**
  * This sets the variables that are fed into the stage module to be the combined config at local.config
  */
inputs = local.config

/**
  * This is the main terragrunt block that defines the stage module and the hooks that run before it.
  */
terraform {
  source = "../../terraform-modules//stages/${include.root.locals.stage}"

  after_hook "noop" {
    commands = ["apply"]
    execute  = ["/app/twilio-iac/scripts/noop/external-recordings/after.sh"]
  }

  after_hook "update_service_config" {
    commands = ["apply"]
    execute  = [
      "/app/twilio-iac/scripts/python_tools/manageServiceConfig.py",
      "update_prop",
      "--prop=attributes.enableExternalRecordings",
      "--value=True"
    ]
  }
}
include "root" {
  path = find_in_parent_folders("terragrunt.root.hcl")

  expose = true
}

locals {
  local_config = {}

  config = merge(include.root.locals.config, local.local_config)
}

inputs = local.config

terraform {

  // TODO: remove this when we are ready to apply
  // before_hook "abort_apply" {
  //   commands = ["apply"]
  //   execute  = ["exit", "1"]
  // }

  // TODO: remove this once we've migrated all secrets
  before_hook "migrate_tf_secrets" {
    commands = ["init"]
    execute  = ["/app/twilio-iac/scripts/migration/migrateTFSecrets.sh", include.root.locals.config.old_dir_name, include.root.locals.environment, include.root.locals.short_helpline]
  }

  // TODO: make this only happen on provision stage.
  before_hook "manage_tf_secrets" {
    commands = ["init"]
    execute  = ["/app/twilio-iac/scripts/secretManager/manageSecrets.py", "${include.root.locals.environment}/${include.root.locals.short_helpline}"]
  }

  source = "../../terraform-modules//stages/${include.root.locals.stage}"

  // The state migration script is called via `make migrate-state` becuase it makes terragrunt calls which do weird things when nested
  // and so that we can avoid assume role chaining.
}
/**
 * This is the common code used by all of the stages.
 * It handles configuration loading and common generate blocks.
 **/
locals {
  environment    = get_env("HL_ENV")
  short_helpline = get_env("HL")

  stage = basename(get_original_terragrunt_dir())

  // This loads the config for the environment we are provisioning. The depenedency tree is all managed by the configuration hcl files
  env_config_hcl = read_terragrunt_config("../../helplines/${local.short_helpline}/${local.environment}.hcl")
  env_config     = local.env_config_hcl.locals.config

  // Setting related to the temporary additional file system.
  additional_default_file = "../helplines/files/additional.${local.stage}.tf"
  additional_file         = "../helplines/${local.short_helpline}/files/additional.${local.stage}.tf"

  // Map used to convert the environment name to a short version so we don't have to hardcode that everywhere.
  short_env_map = {
    "development" = "DEV"
    "staging"     = "STG"
    "production"  = "PROD"
  }

  aws_account_id = get_aws_account_id()
  env_role = "arn:aws:iam::${local.aws_account_id}:role/tf-twilio-iac-${local.environment}"
  admin_role = "arn:aws:iam::${local.aws_account_id}:role/tf-admin"

  // These are values that will be added to the generated master config that are derived from other locals.
  computed_config = {
    stage              = local.stage
    environment        = local.environment
    short_environment  = local.short_env_map[local.environment]
    short_helpline     = local.short_helpline
    operating_info_key = local.short_helpline
    aws_account_id     = local.aws_account_id
    role_arn           = local.stage == "external-recordings" ? local.admin_role : local.env_role
  }

  config = merge(local.env_config, local.computed_config)

  // We handle state migration locally to speed up the process. This is a temporary measure until all helplines are migrated
  use_local_state       = get_env("USE_LOCAL_STATE", "") == "" ? false : true
  backend_template_file = local.use_local_state ? find_in_parent_folders("backend-local.tftpl") : find_in_parent_folders("backend-remote.tftpl")
  backend_content       = local.use_local_state ? templatefile(local.backend_template_file, merge(local.config, { local_state_path = "${get_terragrunt_dir()}/${local.short_helpline}-${local.environment}.tfstate" })) : templatefile(local.backend_template_file, local.config)
}

generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = local.backend_content
}

generate "aws-provider" {
  path      = "aws-provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = templatefile(find_in_parent_folders("aws-provider.tftpl"), local.config)
}

generate "additional-tf" {
  path      = "additional.tf"
  if_exists = "overwrite_terragrunt"
  contents  = fileexists(local.additional_file) ? file(local.additional_file) : fileexists(local.additional_default_file) ? file(local.additional_default_file) : ""
}

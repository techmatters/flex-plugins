locals {
  environment = get_env("HL_ENV")
  short_helpline  = get_env("HL")

  stage     = basename(get_original_terragrunt_dir())

  defaults_config_hcl = read_terragrunt_config("../../helplines/defaults.hcl")
  defaults_config = local.defaults_config_hcl.locals

  common_config_hcl = read_terragrunt_config("../../helplines/${local.short_helpline}/common.hcl")
  common_config = local.common_config_hcl.locals

  env_config_hcl = read_terragrunt_config("../../helplines/${local.short_helpline}/${local.environment}.hcl")
  env_config = local.env_config_hcl.locals

  file_config =  merge(local.defaults_config, local.common_config, local.env_config)

  computed_config = {
    environment = title(local.environment)
    short_helpline  = local.short_helpline
    old_dir_name = "${local.file_config.old_dir_prefix}-${local.environment}"

    operating_info_key = local.short_helpline
  }

  config = merge(local.file_config, local.computed_config)

  // TODO: remove this once we've migrated all the secrets
  null_migrate_tf_secrets = run_cmd("../../scripts/migrateTFSecrets.sh", local.config.old_dir_name, local.environment, local.short_helpline)

  null_debug = run_cmd("echo", "stage: ${local.stage}")

  // null_exit = run_cmd("exit", "1")
}

generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-${local.environment}"
    key            = "twilio/${local.short_helpline}/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-${local.environment}"
  }
}
EOF
}

generate "aws-provider" {
  path = "aws-provider.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
provider "aws" {
  assume_role {
    role_arn     = "arn:aws:iam::712893914485:role/tf-twilio-iac-${local.environment}"
    session_name = "tf-${local.environment}-${local.short_helpline}"
  }

  # Make it faster by skipping some things
  skip_metadata_api_check     = true
  skip_region_validation      = true
  skip_credentials_validation = true
}
EOF
}

inputs = local.config

terraform {
  source = "../../terraform-modules//${local.stage}"
}

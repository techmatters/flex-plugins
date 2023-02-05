locals {
  environment = get_env("HL_ENV")
  short_helpline  = get_env("HL")

  stage_hcl = read_terragrunt_config(find_in_parent_folders("stage.hcl"))
  stage     = local.stage_hcl.locals.stage

  base_config_hcl = read_terragrunt_config("../../helplines/base.hcl")
  base_config = local.base_config_hcl.locals

  helpline_base_config_hcl = read_terragrunt_config("../../helplines/${local.short_helpline}/helpline-base.hcl")
  helpline_base_config = local.helpline_base_config_hcl.locals

  env_config_hcl = read_terragrunt_config("../../helplines/${local.short_helpline}/${local.environment}/${local.stage}.hcl")
  env_config = local.env_config_hcl.locals

  pre_computed_config =  merge(local.base_config, local.helpline_base_config, local.env_config)

  computed_config = {
    environment = title(local.environment)
    short_helpline  = local.short_helpline
    old_dir_name = "${local.pre_computed_config.old_dir_prefix}-${local.environment}"

    operating_info_key = local.short_helpline
  }

  config = merge(local.pre_computed_config, local.computed_config)
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
  source = "../../modules//${local.stage}"
}

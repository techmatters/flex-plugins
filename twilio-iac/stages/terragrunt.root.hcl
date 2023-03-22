locals {
  environment    = get_env("HL_ENV")
  short_helpline = get_env("HL")

  stage = basename(get_original_terragrunt_dir())

  env_config_hcl = read_terragrunt_config("../../helplines/${local.short_helpline}/${local.environment}.hcl")
  env_config     = local.env_config_hcl.locals.config

  additional_default_file = "../helplines/files/additional.${local.stage}.tf"
  additional_file = "../helplines/${local.short_helpline}/files/additional.${local.stage}.tf"

  computed_config = {
    environment        = title(local.environment)
    short_helpline     = local.short_helpline
    old_dir_name       = "${local.env_config.old_dir_prefix}-${local.environment}"
    operating_info_key = local.short_helpline
  }

  config = merge(local.env_config, local.computed_config)
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
    key            = "twilio/${local.short_helpline}/${local.stage}/terraform.tfstate"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    role_arn       = "arn:aws:iam::712893914485:role/tf-twilio-iac-${local.environment}"
  }
}
EOF
}

generate "aws-provider" {
  path      = "aws-provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
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

generate "additional-tf" {
  path      = "additional.tf"
  if_exists = "overwrite_terragrunt"
  contents  = fileexists(local.additional_file) ? file(local.additional_file) : file(local.additional_default_file)
}

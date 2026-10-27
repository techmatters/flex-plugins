/**
  * Okta for the form builder (form-builder.aselo.org): its OIDC app and the groups that say who can
  * use it. Not tied to a helpline or environment, so it ignores HL/HL_ENV.
  * Usage: make plan   (from this directory, on the devops node)
  *
  * Uses the same Okta Terraform service app (SSM /terraform/okta/terraform_service_app/*), state
  * bucket and role as twilio-iac/stages/okta-org. See form-builder/terraform/README.md.
  */
locals {
  # Helplines whose staff can use the builder: one Okta group form-builder-<code> each.
  # Add a code here when a helpline starts using it.
  helplines = ["usnm"]

  aws_account_id  = get_aws_account_id()
  state_role_arn  = "arn:aws:iam::${local.aws_account_id}:role/tf-twilio-iac-production"
  use_local_state = get_env("USE_LOCAL_STATE", "") != ""
}

generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      required_providers {
        okta = {
          source  = "okta/okta"
          version = "7.0.0"
        }
      }
    %{if local.use_local_state~}
      backend "local" {
        path = "${get_terragrunt_dir()}/okta-form-builder.tfstate"
      }
    %{else~}
      backend "s3" {
        bucket         = "tl-terraform-state-production"
        key            = "twilio/okta-form-builder/terraform.tfstate"
        dynamodb_table = "terraform-locks"
        encrypt        = true
        region         = "us-east-1"
        assume_role = {
          role_arn = "${local.state_role_arn}"
        }
      }
    %{endif~}
    }
  EOF
}

generate "aws-provider" {
  path      = "aws-provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    provider "aws" {
      assume_role {
        role_arn     = "${local.state_role_arn}"
        session_name = "tf-okta-form-builder"
      }
      region                      = "us-east-1"
      skip_region_validation      = true
      skip_credentials_validation = true
    }
  EOF
}

inputs = {
  helplines = local.helplines
}

terraform {
  source = "../modules//okta"
}

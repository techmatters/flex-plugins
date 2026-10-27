// Copyright (C) 2021-2026 Technology Matters
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/.

/**
  * Okta for the form builder (form-builder.tl.techmatters.org): its OIDC app and the groups that say who can
  * use it. Not tied to a helpline or environment, so it ignores HL/HL_ENV.
  * Usage: make plan   (from this directory, on the devops node)
  *
  * Uses the same Okta Terraform service app (SSM /terraform/okta/terraform_service_app/*), state
  * bucket and role as twilio-iac/stages/okta-org. See form-builder/terraform/README.md.
  */
locals {
  # Helplines whose staff can use the builder: one Okta group form-builder-<code> each.
  # Add a code here (e.g. "usnm") when a helpline starts using it; until then only Aselo staff can.
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

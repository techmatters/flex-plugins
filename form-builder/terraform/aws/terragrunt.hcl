/**
  * AWS for the form builder (form-builder.tl.techmatters.org): the site, the API and the drafts
  * bucket, in the management environment. Not tied to a helpline or environment, so it ignores
  * HL/HL_ENV.
  * Usage: make plan   (from this directory, on the devops node)
  *
  * Applied with tf-admin, like infrastructure-config's management environment. Reads the Okta
  * stage's outputs (issuer, client id) from its state. See form-builder/terraform/README.md.
  */
locals {
  aws_account_id  = get_aws_account_id()
  role_arn        = "arn:aws:iam::${local.aws_account_id}:role/tf-admin"
  use_local_state = get_env("USE_LOCAL_STATE", "") != ""
}

generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      required_providers {
        aws = {
          source  = "hashicorp/aws"
          version = "~> 5.0"
        }
        archive = {
          source  = "hashicorp/archive"
          version = "~> 2.4"
        }
      }
    %{if local.use_local_state~}
      backend "local" {
        path = "${get_terragrunt_dir()}/form-builder-aws.tfstate"
      }
    %{else~}
      backend "s3" {
        bucket         = "tl-terraform-state-management"
        key            = "form-builder/aws/terraform.tfstate"
        dynamodb_table = "terraform-locks"
        encrypt        = true
        region         = "us-east-1"
        assume_role = {
          role_arn = "${local.role_arn}"
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
        role_arn     = "${local.role_arn}"
        session_name = "tf-form-builder"
      }
      region = "us-east-1"

      default_tags {
        tags = {
          Environment = "management"
          Service     = "form-builder"
          ManagedBy   = "flex-plugins/form-builder/terraform/aws"
        }
      }
    }
  EOF
}

inputs = {
  # Where the Okta stage (../okta) keeps its state, and the role that can read it
  okta_state = {
    bucket   = "tl-terraform-state-production"
    key      = "twilio/okta-form-builder/terraform.tfstate"
    role_arn = "arn:aws:iam::${local.aws_account_id}:role/tf-twilio-iac-production"
  }
}

terraform {
  source = "../modules//aws"
}

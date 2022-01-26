terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.9.2"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "twilio-terraform-locks"
    encrypt        = true
  }
}

module "chatbots" {
  source = "../terraform-modules/chatbots/default"
  serverless_url = var.serverless_url
}

module "serverless" {
  source = "../terraform-modules/serverless/default"
}

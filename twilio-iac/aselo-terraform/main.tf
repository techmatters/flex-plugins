terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.11.1"
    }
  }

  backend "s3" {
    bucket         = "tl-terraform-state-twilio"
    key            = "twilio/terraform.tfstate"
    dynamodb_table = "twilio-terraform-locks"
    encrypt        = true
  }
}


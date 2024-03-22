terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

resource "twilio_serverless_services_v1" "serverless" {
  unique_name = "serverless"
  friendly_name = "serverless"
  include_credentials = true
  ui_editable = var.ui_editable
}

resource "twilio_serverless_services_environments_v1" "production" {
  service_sid = twilio_serverless_services_v1.serverless.sid
  unique_name = "production"
  domain_suffix = "production"
}

data "external" "service_environment_production" {
  program = ["python3", "${path.module}/getServerlessServiceEnvironmentData.py"]

  query = {
    twilio_account_sid = var.twilio_account_sid
    twilio_auth_token  = var.twilio_auth_token
    service_sid        = twilio_serverless_services_v1.serverless.sid
    environment_sid    = twilio_serverless_services_environments_v1.production.sid
  }

  depends_on = [
    resource.twilio_serverless_services_environments_v1.production
  ]
}

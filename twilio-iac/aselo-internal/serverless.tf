variable "serverless_url" {}

resource "twilio_serverless_services_v1" "serverless" {
  unique_name = "serverless"
  friendly_name = "serverless"
}

resource "twilio_serverless_services_environments_v1" "dev" {
  service_sid = twilio_serverless_services_v1.serverless.sid
  unique_name = "dev"
  domain_suffix = "dev"
}

resource "twilio_serverless_services_environments_v1" "production" {
  service_sid = twilio_serverless_services_v1.serverless.sid
  unique_name = "production"
  domain_suffix = "production"
}

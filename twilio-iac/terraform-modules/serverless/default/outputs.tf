# Will contain serverless_url if https://github.com/twilio/terraform-provider-twilio/issues/85 is implemented

output "serverless_service_sid" {
  description = "Twilio SID of the 'serverless' service"
  value = twilio_serverless_services_v1.serverless.sid
}

output "serverless_environment_production_sid" {
  description = "Twilio SID of the 'production' environment under above service"
  value = twilio_serverless_services_environments_v1.production.sid
}

output "serverless_environment_production_url" {
  description = "Twilio URL of the 'production' environment under above service"
  value = "https://${data.external.service_environment_production.result.domain_name}"
}
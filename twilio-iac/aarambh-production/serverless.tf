// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

moved {
  from = twilio_serverless_services_v1.serverless
  to = module.serverless.twilio_serverless_services_v1.serverless
}

moved {
  from = twilio_serverless_services_environments_v1.dev
  to = module.serverless.twilio_serverless_services_environments_v1.dev
}

moved {
  from = twilio_serverless_services_environments_v1.production
  to = module.serverless.twilio_serverless_services_environments_v1.production
}

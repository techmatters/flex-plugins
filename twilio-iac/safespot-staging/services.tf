// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

moved {
  from = twilio_chat_services_v2.flex_chat_service
  to = module.services.twilio_chat_services_v2.flex_chat_service
}

moved {
  from = twilio_proxy_services_v1.flex_proxy_service
  to = module.services.twilio_proxy_services_v1.flex_proxy_service
}
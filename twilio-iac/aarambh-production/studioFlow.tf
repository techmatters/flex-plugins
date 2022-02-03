// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

moved {
  from = twilio_studio_flows_v2.messaging_flow
  to = module.studioFlow.twilio_studio_flows_v2.messaging_flow
}
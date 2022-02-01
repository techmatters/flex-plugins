// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

moved {
  from = twilio_flex_flex_flows_v1.messaging_flow
  to = module.flex.twilio_flex_flex_flows_v1.messaging_flow
}

moved {
  from = twilio_flex_flex_flows_v1.webchat_flow
  to = module.flex.twilio_flex_flex_flows_v1.webchat_flow
}

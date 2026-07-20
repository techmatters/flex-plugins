# Configure the SMS conversations address with the hardcoded phone number +12607821891.

resource "twilio_conversations_configuration_addresses_v1" "sms" {
  type                                   = "sms"
  address                                = "+12607821891"
  friendly_name                          = "SMS Conversation Address"
  auto_creation_enabled                  = true
  auto_creation_type                     = "studio"
  auto_creation_conversation_service_sid = local.services_flex_chat_service_sid
  auto_creation_studio_flow_sid          = module.channel.channel_studio_flows_sids["sms"].flow_sid
}

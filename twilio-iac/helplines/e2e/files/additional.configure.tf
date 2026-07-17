# Dynamically resolve the single phone number attached to this Twilio account and
# configure it as the SMS conversations address, linked to the SMS studio flow created
# by the channels module.
#
# Using a data source rather than hardcoding the number keeps the config portable:
# the E2E Twilio account has exactly one phone number, so one() is intentionally
# strict here – if the account ever has zero or more than one number the apply will
# fail with a clear error.

data "twilio_api_accounts_incoming_phone_numbers_v2010" "all" {}

resource "twilio_conversations_configuration_addresses_v1" "sms" {
  type                                   = "sms"
  address                                = one(data.twilio_api_accounts_incoming_phone_numbers_v2010.all.incoming_phone_numbers).phone_number
  friendly_name                          = "Sms Conversation Address"
  auto_creation_enabled                  = true
  auto_creation_type                     = "studio"
  auto_creation_conversation_service_sid = local.services_flex_chat_service_sid
  auto_creation_studio_flow_sid          = module.channel.channel_studio_flows_sids["sms"].flow_sid
}

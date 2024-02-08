output "channel_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.channel_messaging_flow.sid
}


output "channel_conversations_address_sid" {
  description = "Twilio SID of the Conversion Address in Flex"
  value = twilio_conversations_configuration_addresses_v1.conversations_address.sid
}

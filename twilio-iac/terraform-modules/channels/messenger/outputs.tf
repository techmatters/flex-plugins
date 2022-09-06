output "messenger_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Messenger Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.messenger_messaging_flow.sid
}


output "messenger_flow_sid" {
  description = "Twilio SID of the 'Messenger Flex Flow' studio flow."
  value = twilio_flex_flex_flows_v1.messenger_flow.sid
}

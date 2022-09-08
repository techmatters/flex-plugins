output "instagram_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Instagram Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.instagram_messaging_flow.sid
}


output "instagram_flow_sid" {
  description = "Twilio SID of the 'Instagram Flex Flow' studio flow."
  value = twilio_flex_flex_flows_v1.instagram_flow.sid
}

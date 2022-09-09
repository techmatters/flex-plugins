output "web_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Web Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.web_messaging_flow.sid
}


output "web_flow_sid" {
  description = "Twilio SID of the 'Web Flex Flow' studio flow."
  value = twilio_flex_flex_flows_v1.web_flow.sid
}

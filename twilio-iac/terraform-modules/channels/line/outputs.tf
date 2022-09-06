output "line_messaging_studio_flow_sid" {
  description = "Twilio SID of the 'Line Messaging Flow' studio flow."
  value = twilio_studio_flows_v2.line_messaging_flow.sid
}


output "line_flow_sid" {
  description = "Twilio SID of the 'Line Flex Flow' studio flow."
  value = twilio_flex_flex_flows_v1.line_flow.sid
}
